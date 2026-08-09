/** Payloads for the job editor. */

import { z } from "zod";

/** One-per-line in the editor; an array in the database. */
const lines = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => {
    if (!value) return [] as string[];
    const list = Array.isArray(value) ? value : value.split("\n");
    return list
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 40);
  });

export const jobStatusEnum = z.enum(["draft", "open", "closed"]);

export const jobBodySchema = z.object({
  title: z.string().trim().min(3, "Give the role a title.").max(200),
  department: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => v || null),
  location: z.string().trim().min(2, "Where is this role based?").max(160),
  employmentType: z
    .enum(["full_time", "part_time", "contract", "internship"])
    .default("full_time"),
  experienceMin: z.coerce.number().int().min(0).max(60).optional(),
  experienceMax: z.coerce.number().int().min(0).max(60).optional(),
  openings: z.coerce.number().int().min(1).max(999).default(1),
  salaryRange: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => v || null),
  salaryMin: z.coerce.number().int().min(0).optional(),
  salaryMax: z.coerce.number().int().min(0).optional(),
  salaryPeriod: z.enum(["month", "year"]).default("month"),
  summary: z.string().trim().min(10, "One line describing the role.").max(500),
  description: z
    .string()
    .trim()
    .min(30, "Describe the role in a little more detail.")
    .max(20000),
  responsibilities: lines,
  requirements: lines,
  status: jobStatusEnum.default("draft"),
  closesAt: z
    .union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.")])
    .optional()
    .transform((v) => v || null),
  seoTitle: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => v || null),
  seoDescription: z
    .string()
    .trim()
    .max(320)
    .optional()
    .transform((v) => v || null),
});
