/**
 * Sign in, sign out, and change password.
 *
 * Everything here is deliberately vague about *why* a sign-in failed. A
 * different message for "no such account" than for "wrong password" turns the
 * login form into a way to enumerate valid admin addresses.
 */

import { Router } from "express";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { env } from "../../config/env.js";
import { db } from "../../db/client.js";
import { adminUsers } from "../../db/schema.js";
import { badRequest, unauthorized } from "../../lib/http-error.js";
import { logger } from "../../lib/logger.js";
import { requireAuth } from "../../middleware/auth.js";
import { loginAttempt } from "../../middleware/rate-limit.js";
import { clearSessionCookie, setSessionCookie, signToken } from "../../services/tokens.js";

export const authRouter = Router();

/**
 * A bcrypt hash of a throwaway value, compared against when the email is
 * unknown. Without it the "no such user" path returns in microseconds while
 * the real path spends ~100ms hashing — a timing difference that reveals which
 * addresses exist.
 */
const DUMMY_HASH = bcrypt.hashSync("no-such-account-timing-equaliser", 10);

/** Consecutive failures before the account itself locks, regardless of IP. */
const MAX_FAILED_ATTEMPTS = 10;
const LOCK_MINUTES = 30;

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().max(255),
  password: z.string().max(200),
});

authRouter.post("/login", loginAttempt, async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const [user] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  // Always hash something, so the response time does not depend on whether
  // the account exists.
  const matches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !matches || !user.isActive) {
    if (user) {
      const attempts = user.failedAttempts + 1;
      await db
        .update(adminUsers)
        .set({
          failedAttempts: attempts,
          // Per-IP rate limiting alone is defeated by rotating addresses, so
          // the account locks on its own after enough failures.
          ...(attempts >= MAX_FAILED_ATTEMPTS
            ? { lockedUntil: sql`DATE_ADD(NOW(), INTERVAL ${LOCK_MINUTES} MINUTE)` }
            : {}),
        })
        .where(eq(adminUsers.id, user.id));
    }
    logger.warn({ email, ip: req.ip }, "failed sign-in");
    throw unauthorized("Those details are not correct.", "INVALID_CREDENTIALS");
  }

  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    throw unauthorized(
      "This account is temporarily locked after too many failed attempts. Try again shortly.",
      "ACCOUNT_LOCKED"
    );
  }

  await db
    .update(adminUsers)
    .set({ failedAttempts: 0, lockedUntil: null, lastLoginAt: sql`NOW()` })
    .where(eq(adminUsers.id, user.id));

  setSessionCookie(res, signToken(user));

  logger.info({ id: user.id, email: user.email }, "admin signed in");

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    mustChangePassword: user.mustChangePassword,
  });
});

authRouter.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.admin });
});

const changePasswordSchema = z.object({
  currentPassword: z.string().max(200),
  newPassword: z
    .string()
    .min(12, "Use at least 12 characters.")
    .max(200, "That password is too long."),
});

authRouter.post("/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
  const adminId = req.admin!.id;

  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, adminId)).limit(1);
  if (!user) throw unauthorized();

  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw badRequest("Your current password is not correct.", "WRONG_PASSWORD");
  }
  if (await bcrypt.compare(newPassword, user.passwordHash)) {
    throw badRequest("Choose a password you have not used here before.", "PASSWORD_REUSED");
  }

  await db
    .update(adminUsers)
    .set({
      passwordHash: await bcrypt.hash(newPassword, env.bcryptRounds),
      mustChangePassword: false,
      // Signs out every other session holding the old password.
      tokenVersion: user.tokenVersion + 1,
    })
    .where(eq(adminUsers.id, adminId));

  // Re-issue for *this* session, so changing your password does not sign you
  // out of the tab you did it in.
  setSessionCookie(res, signToken({ ...user, tokenVersion: user.tokenVersion + 1 }));

  logger.info({ id: adminId }, "admin password changed");
  res.json({ ok: true });
});
