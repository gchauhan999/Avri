/**
 * Sign in, sign out, and change password.
 *
 * Everything here is deliberately vague about *why* a sign-in failed. A
 * different message for "no such account" than for "wrong password" turns the
 * login form into a way to enumerate valid admin addresses.
 */

import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { literal } from "sequelize";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { badRequest, unauthorized } from "../../helpers/http-error.js";
import { AdminUser } from "../../models/index.js";
import { clearSessionCookie, setSessionCookie, signToken } from "../../services/tokens.js";
import { changePasswordSchema, loginSchema } from "../../validations/auth.validation.js";

/**
 * A bcrypt hash of a throwaway value, compared against when the email is
 * unknown. Without it the "no such user" path returns in microseconds while the
 * real path spends ~100ms hashing — a timing difference that reveals which
 * addresses exist.
 */
const DUMMY_HASH = bcrypt.hashSync("no-such-account-timing-equaliser", 10);

/** Consecutive failures before the account itself locks, regardless of IP. */
const MAX_FAILED_ATTEMPTS = 10;
const LOCK_MINUTES = 30;

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = loginSchema.parse(req.body);

  const user = await AdminUser.findOne({ where: { email } });

  // Always hash something, so the response time does not depend on whether the
  // account exists.
  const matches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !matches || !user.isActive) {
    if (user) {
      const attempts = user.failedAttempts + 1;
      await user.update({
        failedAttempts: attempts,
        // Per-IP rate limiting alone is defeated by rotating addresses, so the
        // account locks on its own after enough failures.
        ...(attempts >= MAX_FAILED_ATTEMPTS
          ? {
              lockedUntil: literal(
                `DATE_ADD(NOW(), INTERVAL ${LOCK_MINUTES} MINUTE)`
              ) as unknown as string,
            }
          : {}),
      });
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

  await user.update({
    failedAttempts: 0,
    lockedUntil: null,
    lastLoginAt: literal("NOW()") as unknown as string,
  });

  setSessionCookie(res, signToken(user));

  logger.info({ id: user.id, email: user.email }, "admin signed in");

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    mustChangePassword: user.mustChangePassword,
  });
}

export function logout(_req: Request, res: Response): void {
  clearSessionCookie(res);
  res.json({ ok: true });
}

export function me(req: Request, res: Response): void {
  res.json({ user: req.admin });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
  const adminId = req.admin!.id;

  const user = await AdminUser.findByPk(adminId);
  if (!user) throw unauthorized();

  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw badRequest("Your current password is not correct.", "WRONG_PASSWORD");
  }
  if (await bcrypt.compare(newPassword, user.passwordHash)) {
    throw badRequest("Choose a password you have not used here before.", "PASSWORD_REUSED");
  }

  await user.update({
    passwordHash: await bcrypt.hash(newPassword, env.bcryptRounds),
    mustChangePassword: false,
    // Signs out every other session holding the old password.
    tokenVersion: user.tokenVersion + 1,
  });

  // Re-issue for *this* session, so changing your password does not sign you
  // out of the tab you did it in.
  setSessionCookie(res, signToken(user));

  logger.info({ id: adminId }, "admin password changed");
  res.json({ ok: true });
}
