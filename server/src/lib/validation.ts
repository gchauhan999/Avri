/**
 * Validation rules shared with the browser.
 *
 * These regexes and messages are duplicated, deliberately, in
 * `client/lib/enquiry.ts`. Keeping them byte-identical means a visitor sees the
 * same wording whether the check ran in their browser or here — and the server
 * copy is the one that actually matters, since the client one is trivially
 * bypassed. If you change one, change both.
 */

import { z } from "zod";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** 10-digit Indian mobile, optionally prefixed with +91 or 0. */
export const PHONE_RE = /^(?:\+?91[\s-]?|0)?[6-9]\d{9}$/;

/** Last ten digits, for storage, de-duplication and search. */
export const normalisePhone = (value: string) => value.replace(/\D/g, "").slice(-10);

/* -------------------------------------------------------------------------- */
/*  Reusable field schemas                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Every free-text field is length-capped. Without a cap a TEXT column happily
 * accepts 64 KB per request and someone will eventually find that out.
 */
export const name = z
  .string()
  .trim()
  .min(2, "Please enter your name.")
  .max(160, "That name is too long.");

export const phone = z
  .string()
  .trim()
  .regex(PHONE_RE, "Enter a valid 10-digit mobile number.");

export const email = z
  .string()
  .trim()
  .max(255, "That email address is too long.")
  .regex(EMAIL_RE, "Enter a valid email address.");

/** Email that may be left blank — the contact form does not require one. */
export const optionalEmail = z
  .union([z.literal(""), email])
  .optional()
  .transform((v) => v ?? "");

export const shortText = (max = 200) => z.string().trim().max(max);

export const optionalText = (max = 200) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v ?? "");

/**
 * The honeypot. `Honeypot()` in the client renders a hidden `company_website`
 * input; a human never fills it in and a scripted submitter usually does.
 *
 * It must validate as "empty string or absent" so a filled one is caught in the
 * route rather than here — the route answers with a normal success message and
 * writes nothing, because a bot that receives an error simply retries without
 * the field.
 */
export const honeypot = z
  .string()
  .optional()
  .transform((v) => v ?? "");
