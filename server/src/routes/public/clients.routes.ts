/**
 * The public client list.
 *
 * Both conditions are required, and they mean different things:
 *   `isAuthorized` — we hold written permission to show this logo.
 *   `isPublished`  — we have chosen to show it right now.
 *
 * A database CHECK constraint already makes published-without-authorised
 * impossible, and the admin API refuses it too. Filtering on both here is the
 * third belt: publishing a company's trademark without permission is a legal
 * problem, not a cosmetic one, so it is worth being repetitive about.
 */

import { Router } from "express";
import { and, asc, eq } from "drizzle-orm";
import { env } from "../../config/env.js";
import { db } from "../../db/client.js";
import { clients } from "../../db/schema.js";
import { publicRead } from "../../middleware/rate-limit.js";

export const clientsRouter = Router();

/** Absolute URL for a stored logo path. */
const logoUrl = (stored: string | null) =>
  stored ? `${env.publicApiUrl}/uploads/${stored.replace(/^public\//, "")}` : null;

clientsRouter.get("/", publicRead, async (_req, res) => {
  const rows = await db
    .select({
      id: clients.id,
      name: clients.name,
      slug: clients.slug,
      logoPath: clients.logoPath,
      logoWidth: clients.logoWidth,
      logoHeight: clients.logoHeight,
      websiteUrl: clients.websiteUrl,
      sector: clients.sector,
    })
    .from(clients)
    .where(and(eq(clients.isPublished, true), eq(clients.isAuthorized, true)))
    .orderBy(asc(clients.sortOrder), asc(clients.name));

  res.json(
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      logo: logoUrl(row.logoPath),
      logoWidth: row.logoWidth,
      logoHeight: row.logoHeight,
      website: row.websiteUrl,
      sector: row.sector,
    }))
  );
});
