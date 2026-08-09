/** Payloads for the client editor. */

import { z } from "zod";

export const clientBodySchema = z.object({
  name: z.string().trim().min(2, "Enter the client's name.").max(180),
  websiteUrl: z
    .union([
      z.literal(""),
      z.string().trim().url("Enter a full URL, including https://").max(300),
    ])
    .optional()
    .transform((v) => v || null),
  sector: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => v || null),
  isAuthorized: z.boolean().default(false),
  authorizationNote: z
    .string()
    .trim()
    .max(400)
    .optional()
    .transform((v) => v || null),
  isPublished: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(-999).max(999).default(0),
  /** Stored path returned by POST /api/admin/clients/logo. */
  logoPath: z
    .string()
    .trim()
    .max(400)
    .optional()
    .transform((v) => v || null),
  logoWidth: z.coerce.number().int().positive().optional(),
  logoHeight: z.coerce.number().int().positive().optional(),
});

export const clientPatchSchema = clientBodySchema.partial();
