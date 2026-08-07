/**
 * Authentication for the admin API.
 */

import type { RequestHandler } from "express";
import { eq } from "drizzle-orm";
import { env } from "../config/env.js";
import { db } from "../db/client.js";
import { adminUsers, type AdminUser } from "../db/schema.js";
import { forbidden, unauthorized } from "../lib/http-error.js";
import { expiryMs, setSessionCookie, signToken, verifyToken } from "../services/tokens.js";

/** What handlers see on `req.admin`. Never includes the password hash. */
export interface AuthedAdmin {
  id: number;
  name: string;
  email: string;
  role: AdminUser["role"];
  mustChangePassword: boolean;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AuthedAdmin;
    }
  }
}

/** Re-issue the cookie when under this much time is left. */
const SLIDING_RENEWAL_MS = 2 * 60 * 60 * 1000;

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.[env.cookieName];
    if (!token || typeof token !== "string") {
      throw unauthorized();
    }

    const payload = verifyToken(token);
    if (!payload) throw unauthorized("Your session has expired. Please sign in again.");

    /**
     * One row read per request. That is cheap at this volume and buys instant
     * revocation: deactivating a user or changing a password takes effect on
     * their very next request, with no session store to invalidate.
     */
    const [user] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, Number(payload.sub)))
      .limit(1);

    if (!user || !user.isActive) {
      throw unauthorized("This account is no longer active.");
    }
    if (user.tokenVersion !== payload.tv) {
      throw unauthorized("Your session has ended. Please sign in again.");
    }

    req.admin = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    };

    /**
     * Sliding renewal: someone mid-way through writing a long article should
     * not be signed out at the eight-hour mark, but an idle session still
     * expires.
     */
    const expSeconds = (payload as unknown as { exp?: number }).exp;
    if (expSeconds && expSeconds * 1000 - Date.now() < SLIDING_RENEWAL_MS) {
      setSessionCookie(res, signToken(user));
    }

    next();
  } catch (error) {
    next(error);
  }
};

/** Restricts a route to `super_admin` — user management, mainly. */
export const requireSuperAdmin: RequestHandler = (req, _res, next) => {
  if (req.admin?.role !== "super_admin") {
    next(forbidden("Only a super admin can do that."));
    return;
  }
  next();
};

/**
 * Blocks everything except the change-password route while a bootstrap account
 * is still on its seeded password.
 */
export const blockUntilPasswordChanged: RequestHandler = (req, _res, next) => {
  if (req.admin?.mustChangePassword) {
    next(
      forbidden("Please choose a new password before continuing.", "PASSWORD_CHANGE_REQUIRED")
    );
    return;
  }
  next();
};

export const sessionMaxAgeMs = () => expiryMs(env.jwtExpiresIn);
