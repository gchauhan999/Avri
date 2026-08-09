/** Request schemas for the public blog and the admin article editor. */

import { z } from "zod";
import { pageQuery } from "../helpers/pagination.js";

/** The public listing pages nine cards at a time. */
export const publicPostListQuery = z.object({
  category: z.string().trim().max(140).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(9),
});

export const adminPostListQuery = pageQuery.extend({
  status: z.enum(["draft", "published", "archived"]).optional(),
  category: z.coerce.number().int().positive().optional(),
  q: z.string().trim().max(120).optional(),
});

export const postBodySchema = z.object({
  title: z.string().trim().min(3, "Give the article a title.").max(220),
  categoryId: z.coerce.number().int().positive({ message: "Choose a category." }),
  excerpt: z
    .string()
    .trim()
    .max(400)
    .optional()
    .transform((v) => v || null),
  /** HTML from the editor. Sanitised in the controller, never trusted as given. */
  body: z.string().min(1, "The article is empty.").max(200_000, "That article is too long."),
  coverImagePath: z
    .string()
    .trim()
    .max(400)
    .optional()
    .transform((v) => v || null),
  coverImageAlt: z
    .string()
    .trim()
    .max(255)
    .optional()
    .transform((v) => v || null),
  coverImageWidth: z.coerce.number().int().positive().optional(),
  coverImageHeight: z.coerce.number().int().positive().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  publishedAt: z
    .union([
      z.literal(""),
      z.string().regex(/^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2})?)?$/),
    ])
    .optional()
    .transform((v) => (v ? v.replace("T", " ") : null)),
  isFeatured: z.boolean().default(false),
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
  seoKeywords: z
    .string()
    .trim()
    .max(400)
    .optional()
    .transform((v) => v || null),
});
