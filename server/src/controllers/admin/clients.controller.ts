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

import type { Request, Response } from "express";
import { Op, literal } from "sequelize";
import { notFound, unprocessable } from "../../helpers/http-error.js";
import { slugify, uniqueSlug } from "../../helpers/slug.js";
import { uploadUrl } from "../../helpers/uploads.js";
import { Client } from "../../models/index.js";
import type { Client as ClientModel } from "../../models/clients.js";
import { processImage, publicImageAbsolute } from "../../services/images.js";
import { revalidate } from "../../services/revalidate.js";
import { removeQuietly } from "../../services/storage.js";
import {
  clientBodySchema,
  clientPatchSchema,
} from "../../validations/client.validation.js";

const shape = (row: ClientModel) => ({ ...row.toJSON(), logo: uploadUrl(row.logoPath) });

async function findOrFail(id: number): Promise<ClientModel> {
  const row = await Client.findByPk(id);
  if (!row) throw notFound("No such client.");
  return row;
}

/** True when some *other* client already holds this slug. */
const slugTaken = (exceptId?: number) => async (candidate: string) => {
  const where = exceptId ? { slug: candidate, id: { [Op.ne]: exceptId } } : { slug: candidate };
  return (await Client.count({ where })) > 0;
};

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

export async function listClients(_req: Request, res: Response): Promise<void> {
  const rows = await Client.findAll({
    order: [
      ["sortOrder", "ASC"],
      ["name", "ASC"],
    ],
  });
  res.json({ items: rows.map(shape) });
}

export async function getClient(req: Request, res: Response): Promise<void> {
  res.json(shape(await findOrFail(Number(req.params.id))));
}

export async function createClient(req: Request, res: Response): Promise<void> {
  const data = clientBodySchema.parse(req.body);
  checkAuthorisation(data);

  const slug = await uniqueSlug(data.name, slugTaken());

  const row = await Client.create({
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
      ? { authorizedAt: literal("NOW()") as unknown as string, authorizedBy: req.admin!.id }
      : {}),
    isPublished: data.isPublished,
    sortOrder: data.sortOrder,
  });

  await row.reload();

  void revalidate(["clients"], ["/clients", "/"]);
  res.status(201).json(shape(row));
}

export async function updateClient(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const existing = await findOrFail(id);

  const patch = clientPatchSchema.parse(req.body);

  const merged = {
    isAuthorized: patch.isAuthorized ?? existing.isAuthorized,
    isPublished: patch.isPublished ?? existing.isPublished,
    authorizationNote:
      patch.authorizationNote !== undefined
        ? patch.authorizationNote
        : existing.authorizationNote,
  };

  /**
   * Withdrawing authorisation takes the logo down with it. Leaving it live
   * would be the worst possible outcome of ticking the box off.
   */
  if (merged.isAuthorized === false) merged.isPublished = false;

  checkAuthorisation(merged);

  const previousLogoPath = existing.logoPath;

  const updates: Record<string, unknown> = {
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
    updates.authorizedAt = literal("NOW()");
    updates.authorizedBy = req.admin!.id;
  } else if (!merged.isAuthorized && existing.isAuthorized) {
    updates.authorizedAt = null;
    updates.authorizedBy = null;
  }

  if (patch.name !== undefined && slugify(patch.name) !== existing.slug) {
    updates.slug = await uniqueSlug(patch.name, slugTaken(id));
  }

  await existing.update(updates);

  // Replacing the logo orphans the old file; remove it once the row points
  // somewhere else.
  if (patch.logoPath !== undefined && previousLogoPath && previousLogoPath !== patch.logoPath) {
    await removeQuietly(publicImageAbsolute(previousLogoPath));
  }

  await existing.reload();

  void revalidate(["clients"], ["/clients", "/"]);
  res.json(shape(existing));
}

export async function deleteClient(req: Request, res: Response): Promise<void> {
  const existing = await findOrFail(Number(req.params.id));
  const { logoPath } = existing;

  await existing.destroy();
  if (logoPath) await removeQuietly(publicImageAbsolute(logoPath));

  void revalidate(["clients"], ["/clients", "/"]);
  res.status(204).end();
}

/**
 * Two-step: upload returns a path, which the create/update body then
 * references. It keeps the content routes pure JSON and lets the admin preview
 * the processed logo before committing to it.
 */
export async function uploadClientLogo(req: Request, res: Response): Promise<void> {
  if (!req.file) throw unprocessable({ image: "Choose an image to upload." });

  const stored = await processImage(req.file.buffer, req.file.mimetype, "client_logo");

  res.status(201).json(stored);
}
