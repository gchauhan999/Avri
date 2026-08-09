/**
 * Rate limits for the public write routes.
 *
 * These only work if `trust proxy` is set correctly (see `app.ts`). Behind a
 * reverse proxy with it unset, every request appears to come from the proxy's
 * own address — so the first bot to hit a limit locks out every visitor.
 */

import rateLimit, { type Options } from "express-rate-limit";
import type { RequestHandler } from "express";
import { env } from "../config/env.js";

function limiter(options: Partial<Options> & { limit: number; windowMs: number }): RequestHandler {
  // A limiter in front of a local load test just gets in the way.
  if (!env.rateLimitEnabled) return (_req, _res, next) => next();

  return rateLimit({
    standardHeaders: "draft-7",
    legacyHeaders: false,
    // Return the same envelope as every other error so the forms can render it.
    handler: (_req, res, _next, opts) => {
      const retryAfter = Math.ceil(opts.windowMs / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      res.status(429).json({
        error: {
          code: "RATE_LIMITED",
          message:
            typeof opts.message === "string"
              ? opts.message
              : "Too many requests. Please wait a moment and try again.",
        },
      });
    },
    ...options,
  });
}

/** Browsing jobs, posts and clients. Generous — this is just anti-scrape. */
export const publicRead = limiter({ windowMs: 5 * 60 * 1000, limit: 300 });

/** Contact and quote forms. */
export const enquiryWrite = limiter({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  message: "You have sent several enquiries already. Please call us instead — we will pick up.",
});

/**
 * Job applications. Tightest of the lot: this is the only public route that
 * writes a file to disk, so it is the one that can fill a volume.
 */
export const applicationWrite = limiter({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  message: "You have submitted several applications recently. Please try again later.",
});

/**
 * Sign-in. Keyed on IP *and* email so one address cannot lock out an account,
 * and one account cannot be sprayed from a single address. Successful logins
 * do not count, so a legitimate user who mistypes twice is not punished.
 */
export const loginAttempt = limiter({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const email = typeof req.body?.email === "string" ? req.body.email.toLowerCase() : "";
    return `${req.ip ?? "unknown"}|${email}`;
  },
  message: "Too many sign-in attempts. Please wait fifteen minutes.",
});

const isRead = (method: string) => method === "GET" || method === "HEAD";

/**
 * Reads an admin makes just by using the panel.
 *
 * Deliberately much looser than the write limit below, because one page view is
 * never one request: the layout asks who is signed in, the sidebar asks for its
 * badge counts, the page fetches its own data, and Next prefetches whatever
 * links are on screen. A limit tight enough to be interesting for writes locks
 * the panel up during ordinary editing.
 *
 * It also fails badly when it trips. A 429 is not a 401, so `getSession()` in
 * the admin app rethrows it, the page renders an error, and the dev server
 * retries — which spends more budget and keeps the limit tripped. Generous is
 * the safer setting here; the write limit is the one doing real work.
 */
export const adminRead = limiter({
  windowMs: 5 * 60 * 1000,
  limit: 1000,
  skip: (req) => !isRead(req.method),
});

/** Anything an authenticated admin changes. Loose; it exists to catch loops. */
export const adminWrite = limiter({
  windowMs: 5 * 60 * 1000,
  limit: 200,
  skip: (req) => isRead(req.method),
});
