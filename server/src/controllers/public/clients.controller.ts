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

import type { Request, Response } from "express";
import { uploadUrl } from "../../helpers/uploads.js";
import { Client } from "../../models/index.js";

export async function listPublishedClients(_req: Request, res: Response): Promise<void> {
  const rows = await Client.findAll({
    attributes: [
      "id",
      "name",
      "slug",
      "logoPath",
      "logoWidth",
      "logoHeight",
      "websiteUrl",
      "sector",
    ],
    where: { isPublished: true, isAuthorized: true },
    order: [
      ["sortOrder", "ASC"],
      ["name", "ASC"],
    ],
  });

  res.json(
    rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      logo: uploadUrl(row.logoPath),
      logoWidth: row.logoWidth,
      logoHeight: row.logoHeight,
      website: row.websiteUrl,
      sector: row.sector,
    }))
  );
}
