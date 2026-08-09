/**
 * Small helpers for reading things off a request that are easy to get subtly
 * wrong.
 */

import type { Request } from "express";
import { fn } from "sequelize";

/** Sequelize v6 does not export the `Fn` class type by name. */
type Fn = ReturnType<typeof fn>;

/**
 * The caller's IP as a MySQL `VARBINARY(16)` value.
 *
 * Stored binary rather than as text so IPv4 and IPv6 both fit in one column and
 * comparisons are exact. `INET6_ATON` returns NULL for anything it cannot
 * parse, which is the right outcome for a malformed forwarded header.
 *
 * Returned as a Sequelize `fn` so the conversion happens in MySQL; passing the
 * text through would store the wrong bytes.
 *
 * Accuracy depends on `trust proxy` being set correctly in `app.ts`.
 */
export function clientIpFn(req: Request): Fn {
  const ip = req.ip ?? "";
  // Express reports IPv4 over a dual-stack socket as "::ffff:1.2.3.4".
  const cleaned = ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  return fn("INET6_ATON", cleaned || null);
}

/** User-Agent, truncated to the column width. */
export function userAgent(req: Request): string | null {
  const ua = req.get("user-agent");
  return ua ? ua.slice(0, 400) : null;
}

/**
 * Which page a form was submitted from, for attribution. Only a path is kept —
 * a full URL from an untrusted body could be anything, and the host adds
 * nothing we do not already know.
 */
export function sourcePage(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    // Resolve against a dummy origin so a bare path parses too.
    const url = new URL(value, "https://placeholder.invalid");
    return `${url.pathname}${url.search}`.slice(0, 300);
  } catch {
    return null;
  }
}
