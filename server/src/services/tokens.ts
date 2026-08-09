/**
 * Admin session tokens.
 *
 * A signed JWT in an httpOnly cookie. No refresh token and no session table:
 * an eight-hour absolute session on an internal panel is the right shape, and
 * a rotation scheme would be complexity with no payoff at this size.
 *
 * Revocation is handled by `tokenVersion`, which is baked into the token and
 * compared against the row on every request. Bumping the column signs that
 * user out everywhere, immediately — which is what a password change and a
 * deactivation both need.
 */

import jwt, { type SignOptions } from "jsonwebtoken";
import type { CookieOptions, Response } from "express";
import { env } from "../config/env.js";
import type { AdminUser } from "../models/admin_users.js";

const ISSUER = "avri-api";
const AUDIENCE = "avri-admin";

export interface TokenPayload {
  /** admin_users.id */
  sub: string;
  role: AdminUser["role"];
  /** Matched against admin_users.token_version. */
  tv: number;
}

export function signToken(user: Pick<AdminUser, "id" | "role" | "tokenVersion">): string {
  const payload: TokenPayload = {
    sub: String(user.id),
    role: user.role,
    tv: user.tokenVersion,
  };

  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    issuer: ISSUER,
    audience: AUDIENCE,
  } as SignOptions);
}

/** Returns null for anything invalid — expired, tampered, wrong audience. */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.jwtSecret, {
      issuer: ISSUER,
      audience: AUDIENCE,
    }) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * `SameSite=Lax` keys off the registrable domain, so with the admin served at
 * avrienergy.com/admin and the API proxied under the same host, this is a
 * first-party cookie and needs no special handling. `COOKIE_DOMAIN` exists
 * only for a deployment that splits them across subdomains.
 */
function cookieOptions(maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeMs,
    ...(env.cookieDomain ? { domain: env.cookieDomain } : {}),
  };
}

/** Milliseconds for strings like "8h", "45m", "7d". Falls back to 8 hours. */
export function expiryMs(spec: string): number {
  const match = /^(\d+)\s*([smhd])$/.exec(spec.trim());
  if (!match) return 8 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2] as "s" | "m" | "h" | "d";
  const factor = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  return value * factor;
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(env.cookieName, token, cookieOptions(expiryMs(env.jwtExpiresIn)));
}

export function clearSessionCookie(res: Response): void {
  // Same attributes as when it was set, or the browser keeps the original.
  res.clearCookie(env.cookieName, { ...cookieOptions(0), maxAge: undefined });
}
