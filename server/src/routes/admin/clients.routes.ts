/**
 * Managing clients.
 *
 * The interesting rule is the authorisation gate. `isAuthorized` is not a
 * styling toggle — it asserts that someone has written permission to display
 * that company's trademark. So:
 *
 *   - it defaults to false,
 *   - turning it on requires an `authorizationNote` saying how permission was
 *     given, and records who ticked it and when,
 *   - turning it off also unpublishes, rather than leaving a live logo whose
 *     permission has just been withdrawn,
 *   - publishing without it is refused here, and refused again by a CHECK
 *     constraint in the database.
 */

import { Router } from "express";
import { and, asc, eq, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { env } from "../../config/env.js";
import { db } from "../../db/client.js";
import { clients } from "../../db/schema.js";
import { notFound, unprocessable } from "../../lib/http-error.js";
import { slugify, uniqueSlug } from "../../lib/slug.js";
import { requireAuth } from "../../middleware/auth.js";
import { imageUpload } from "../../middleware/upload.js";
import { processImage, publicImageAbsolute } from "../../services/images.js";
import { removeQuietly } from "../../services/storage.js";
import { revalidate } from "../../services/revalidate.js";

export const adminClientsRouter = Router();

adminClientsRouter.use(requireAuth);

const logoUrl = (stored: string | null) =>
  stored ? `${env.publicApiUrl}/uploads/${stored.replace(/^public\//, "")}` : null;

const shape = (row: typeof clients.$inferSelect) => ({
  ...row,
  logo: logoUrl(row.logoPath),
});

adminClientsRouter.get("/", async (_req, res) => {
  const rows = await db
    .select()
    .from(clients)
    .orderBy(asc(clients.sortOrder), asc(clients.name));
  res.json({ items: rows.map(shape) });
});

adminClientsRouter.get("/:id", async (req, res) => {
  const [row] = await db.select().from(clients).where(eq(clients.id, Number(req.params.id))).limit(1);
  if (!row) throw notFound("No such client.");
  res.json(shape(row));
});

const bodySchema = z.object({
  name: z.string().trim().min(2, "Enter the client's name.").max(180),
  websiteUrl: z
    .union([z.literal(""), z.string().trim().url("Enter a full URL, including https://").max(300)])
    .optional()
    .transform((v) => v || null),
  sector: z.string().trim().max(120).optional().transform((v) => v || null),
  isAuthorized: z.boolean().default(false),
  authorizationNote: z.string().trim().max(400).optional().transform((v) => v || null),
  isPublished: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(-999).max(999).default(0),
  /** Stored path returned by POST /api/admin/uploads/image. */
  logoPath: z.string().trim().max(400).optional().transform((v) => v || null),
  logoWidth: z.coerce.number().int().positive().optional(),
  logoHeight: z.coerce.number().int().positive().optional(),
});

/** The rules that make the authorisation flag mean something. */
function checkAuthorisation(input: {
  isAuthorized: boolean;
  isPublished: boolean;
  authorizationNote: string | null;
}) {
  const errors: Record<string, string> = {};

  if (input.isAuthorized && !input.authorizationNote) {
    errors.authorizationNote =
      "Record how permission was given, e.g. “logo use approved by email from R. Kumar, 4 March 2026”.";
  }
  if (input.isPublished && !input.isAuthorized) {
    errors.isPublished =
      "A client cannot be published until it is marked as authorised. Publishing a company's logo without written permission is a trademark risk.";
  }

  if (Object.keys(errors).length > 0) throw unprocessable(errors);
}

adminClientsRouter.post("/", async (req, res) => {
  const data = bodySchema.parse(req.body);
  checkAuthorisation(data);

  const slug = await uniqueSlug(data.name, async (candidate) => {
    const [hit] = await db
      .select({ id: clients.id })
      .from(clients)
      .where(eq(clients.slug, candidate))
      .limit(1);
    return Boolean(hit);
  });

  const [result] = await db.insert(clients).values({
    name: data.name,
    slug,
    logoPath: data.logoPath,
    logoWidth: data.logoWidth ?? null,
    logoHeight: data.logoHeight ?? null,
    websiteUrl: data.websiteUrl,
    sector: data.sector,
    isAuthorized: data.isAuthorized,
    authorizationNote: data.authorizationNote,
    ...(data.isAuthorized
      ? { authorizedAt: sql`NOW()`, authorizedBy: req.admin!.id }
      : {}),
    isPublished: data.isPublished,
    sortOrder: data.sortOrder,
  });

  const [row] = await db.select().from(clients).where(eq(clients.id, result.insertId)).limit(1);
  void revalidate(["clients"], ["/clients", "/"]);
  res.status(201).json(shape(row!));
});

const patchSchema = bodySchema.partial();

adminClientsRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [existing] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  if (!existing) throw notFound("No such client.");

  const patch = patchSchema.parse(req.body);

  const merged = {
    isAuthorized: patch.isAuthorized ?? existing.isAuthorized,
    isPublished: patch.isPublished ?? existing.isPublished,
    authorizationNote:
      patch.authorizationNote !== undefined ? patch.authorizationNote : existing.authorizationNote,
  };

  /**
   * Withdrawing authorisation takes the logo down with it. Leaving it live
   * would be the worst possible outcome of ticking the box off.
   */
  if (merged.isAuthorized === false) merged.isPublished = false;

  checkAuthorisation(merged);

  const updates: Partial<typeof clients.$inferInsert> = {
    ...(patch.name !== undefined ? { name: patch.name } : {}),
    ...(patch.websiteUrl !== undefined ? { websiteUrl: patch.websiteUrl } : {}),
    ...(patch.sector !== undefined ? { sector: patch.sector } : {}),
    ...(patch.sortOrder !== undefined ? { sortOrder: patch.sortOrder } : {}),
    ...(patch.logoPath !== undefined
      ? {
          logoPath: patch.logoPath,
          logoWidth: patch.logoWidth ?? null,
          logoHeight: patch.logoHeight ?? null,
        }
      : {}),
    isAuthorized: merged.isAuthorized,
    isPublished: merged.isPublished,
    authorizationNote: merged.authorizationNote,
  };

  // Stamp the moment authorisation is granted, and clear it when withdrawn.
  if (merged.isAuthorized && !existing.isAuthorized) {
    updates.authorizedAt = sql`NOW()` as never;
    updates.authorizedBy = req.admin!.id;
  } else if (!merged.isAuthorized && existing.isAuthorized) {
    updates.authorizedAt = null;
    updates.authorizedBy = null;
  }

  if (patch.name !== undefined && slugify(patch.name) !== existing.slug) {
    updates.slug = await uniqueSlug(patch.name, async (candidate) => {
      const [hit] = await db
        .select({ id: clients.id })
        .from(clients)
        .where(and(eq(clients.slug, candidate), ne(clients.id, id)))
        .limit(1);
      return Boolean(hit);
    });
  }

  await db.update(clients).set(updates).where(eq(clients.id, id));

  // Replacing the logo orphans the old file; remove it once the row points
  // somewhere else.
  if (patch.logoPath !== undefined && existing.logoPath && existing.logoPath !== patch.logoPath) {
    await removeQuietly(publicImageAbsolute(existing.logoPath));
  }

  const [row] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  void revalidate(["clients"], ["/clients", "/"]);
  res.json(shape(row!));
});

adminClientsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [existing] = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  if (!existing) throw notFound("No such client.");

  await db.delete(clients).where(eq(clients.id, id));
  if (existing.logoPath) await removeQuietly(publicImageAbsolute(existing.logoPath));

  void revalidate(["clients"], ["/clients", "/"]);
  res.status(204).end();
});

/* -------------------------------------------------------------------------- */
/*  Logo upload                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Two-step: upload returns a path, which the create/update body then
 * references. It keeps the content routes pure JSON and lets the admin preview
 * the processed logo before committing to it.
 */
adminClientsRouter.post("/logo", imageUpload.single("image"), async (req, res) => {
  if (!req.file) throw unprocessable({ image: "Choose an image to upload." });

  const stored = await processImage(
    req.file.buffer,
    req.file.mimetype,
    "client_logo",
    env.publicApiUrl
  );

  res.status(201).json(stored);
});
