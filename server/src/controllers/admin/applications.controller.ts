/** Reviewing applications, and downloading the CVs. */

import type { Request, Response } from "express";
import { Op, literal, type WhereOptions } from "sequelize";
import { logger } from "../../config/logger.js";
import { notFound } from "../../helpers/http-error.js";
import { offsetOf, paged } from "../../helpers/pagination.js";
import { Application, Job } from "../../models/index.js";
import type { Application as ApplicationModel } from "../../models/applications.js";
import { send } from "../../services/mailer.js";
import {
  fromStoredPath,
  removeQuietly,
  resolveWithin,
  resumesRoot,
  safeDownloadName,
} from "../../services/storage.js";
import { applicationEmail } from "../../services/templates/application.js";
import {
  adminApplicationListQuery,
  applicationUpdateSchema,
} from "../../validations/application.validation.js";

async function findOrFail(id: number): Promise<ApplicationModel> {
  const row = await Application.findByPk(id);
  if (!row) throw notFound("No such application.");
  return row;
}

export async function listApplications(req: Request, res: Response): Promise<void> {
  const { page, limit, jobId, status, q } = adminApplicationListQuery.parse(req.query);

  const where: WhereOptions<ApplicationModel> = {};
  if (jobId) Object.assign(where, { jobId });
  if (status) Object.assign(where, { status });
  if (q) {
    const term = `%${q}%`;
    Object.assign(where, {
      [Op.or]: [
        { fullName: { [Op.like]: term } },
        { email: { [Op.like]: term } },
        { phoneNormalised: { [Op.like]: term } },
        { currentCompany: { [Op.like]: term } },
      ],
    });
  }

  const { rows, count } = await Application.findAndCountAll({
    attributes: [
      "id",
      "jobId",
      ["job_title_snapshot", "jobTitle"],
      "fullName",
      "email",
      "phone",
      "currentLocation",
      "experienceYears",
      "currentCompany",
      "noticePeriod",
      "linkedinUrl",
      "coverLetter",
      "resumeOriginalName",
      "resumeSizeBytes",
      "status",
      "adminNotes",
      "emailStatus",
      "emailError",
      "createdAt",
    ],
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset: offsetOf(page, limit),
  });

  res.json(paged(rows, count, page, limit));
}

/** The roles that have applications, to populate the filter dropdown. */
export async function listJobsWithApplications(_req: Request, res: Response): Promise<void> {
  const rows = (await Job.findAll({
    attributes: [
      "id",
      "title",
      [
        literal("(SELECT COUNT(*) FROM applications a WHERE a.job_id = `Job`.`id`)"),
        "count",
      ],
    ],
    order: [["createdAt", "DESC"]],
    raw: true,
  })) as unknown as Array<{ id: number; title: string; count: number | string }>;

  res.json({ items: rows.filter((row) => Number(row.count) > 0) });
}

export async function getApplication(req: Request, res: Response): Promise<void> {
  res.json(await findOrFail(Number(req.params.id)));
}

export async function updateApplication(req: Request, res: Response): Promise<void> {
  const row = await findOrFail(Number(req.params.id));
  const patch = applicationUpdateSchema.parse(req.body);

  if (Object.keys(patch).length > 0) await row.update(patch);

  res.json(row);
}

/**
 * The only way to read a CV.
 *
 * Résumés are never under a static mount — `storage/resumes` is a sibling of
 * `storage/public`, not a child — so this handler is the sole path to the file,
 * and it is behind `requireAuth`.
 *
 * Three deliberate details:
 *   - the path is resolved and re-checked against the résumé root. Every stored
 *     path came from our own UUID generator, so this should be unreachable,
 *     which is exactly why it is worth asserting: without it a future bug that
 *     lets a path into the database becomes arbitrary file read.
 *   - `Content-Disposition: attachment` plus `nosniff` means a browser never
 *     renders the file inline, so a crafted document cannot execute in the
 *     admin's session.
 *   - `no-store`, because this is personal data and should not sit in a proxy
 *     cache.
 */
export async function downloadResume(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const row = await findOrFail(id);

  const absolute = resolveWithin(resumesRoot(), row.resumePath.replace(/^resumes\//, ""));
  if (!absolute) throw notFound("That file is not available.");

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "private, no-store");

  const filename = safeDownloadName(row.fullName, row.resumeOriginalName);

  res.download(absolute, filename, (error) => {
    if (error && !res.headersSent) {
      logger.error({ err: error, id }, "résumé download failed");
    }
  });
}

/** Retry the HR notification when SMTP was down at the time. */
export async function resendApplicationEmail(req: Request, res: Response): Promise<void> {
  const row = await findOrFail(Number(req.params.id));

  const absolute = fromStoredPath(row.resumePath);
  const attachment = absolute
    ? { filename: safeDownloadName(row.fullName, row.resumeOriginalName), path: absolute }
    : null;

  const result = await send(applicationEmail(row, attachment));

  await row.update({
    emailStatus: result.status,
    emailError: result.error ?? null,
    emailAttempts: row.emailAttempts + 1,
  });

  res.json({ status: result.status, error: result.error ?? null });
}

export async function deleteApplication(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const row = await findOrFail(id);
  const { resumePath } = row;

  await row.destroy();

  // Delete the CV too. Keeping personal data after the record is gone would be
  // both pointless and a retention problem.
  await removeQuietly(fromStoredPath(resumePath));

  logger.info({ id, by: req.admin!.email }, "application deleted");
  res.status(204).end();
}
