/** Payloads for the careers form and the applicant inbox. */

import { z } from "zod";
import { pageQuery } from "../helpers/pagination.js";
import { email, honeypot, name, phone } from "../helpers/validation.js";

const APPLICATION_STATUS = z.enum([
  "new",
  "shortlisted",
  "interviewing",
  "rejected",
  "hired",
]);

export const adminApplicationListQuery = pageQuery.extend({
  jobId: z.coerce.number().int().positive().optional(),
  status: APPLICATION_STATUS.optional(),
  q: z.string().trim().max(120).optional(),
});

export const applicationUpdateSchema = z.object({
  status: APPLICATION_STATUS.optional(),
  adminNotes: z.string().max(5000).optional(),
});

/**
 * The public apply form.
 *
 * Everything arrives as multipart/form-data alongside the CV, so every field is
 * a string. Empty strings rather than nulls throughout — the controller maps
 * them to null on the way into the database.
 */
export const applySchema = z.object({
  jobSlug: z
    .string()
    .trim()
    .max(220)
    .optional()
    .transform((v) => v || ""),
  position: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => v || ""),
  name,
  email,
  phone,
  currentLocation: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((v) => v || ""),
  experience: z
    .string()
    .trim()
    .max(40)
    .optional()
    .transform((v) => v || ""),
  currentCompany: z
    .string()
    .trim()
    .max(160)
    .optional()
    .transform((v) => v || ""),
  noticePeriod: z
    .string()
    .trim()
    .max(60)
    .optional()
    .transform((v) => v || ""),
  linkedin: z
    .union([
      z.literal(""),
      z.string().trim().url("Enter a full URL, including https://").max(300),
    ])
    .optional()
    .transform((v) => v || ""),
  message: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .transform((v) => v || ""),
  company_website: honeypot,
});
