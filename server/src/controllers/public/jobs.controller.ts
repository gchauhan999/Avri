/**
 * Public job listings.
 *
 * Only `status = "open"` is ever returned, and a job whose `closesAt` has
 * passed is treated as gone. That matters beyond tidiness: Google demotes sites
 * that keep expired JobPosting markup live, so a closed role must 404 rather
 * than render, and must drop out of the sitemap at the same moment.
 */

import type { Request, Response } from "express";
import { Op, literal, type WhereOptions } from "sequelize";
import { notFound } from "../../helpers/http-error.js";
import { Job } from "../../models/index.js";
import type { Job as JobModel } from "../../models/jobs.js";

/** Open, and either with no closing date or one that has not passed. */
const liveJob = (): WhereOptions<JobModel> => ({
  status: "open",
  [Op.or]: [{ closesAt: null }, { closesAt: { [Op.gte]: literal("CURDATE()") } }],
});

const PUBLIC_COLUMNS = [
  "id",
  "slug",
  "title",
  "department",
  "location",
  "employmentType",
  "experienceMin",
  "experienceMax",
  "openings",
  "salaryRange",
  "salaryMin",
  "salaryMax",
  "salaryPeriod",
  "summary",
  "publishedAt",
  "closesAt",
  "updatedAt",
] as const;

export async function listOpenJobs(_req: Request, res: Response): Promise<void> {
  const rows = await Job.findAll({
    attributes: [...PUBLIC_COLUMNS],
    where: liveJob(),
    order: [
      ["publishedAt", "DESC"],
      ["title", "ASC"],
    ],
  });

  res.json(rows);
}

/**
 * Slugs and timestamps only, for the sitemap. Separate from the list above so
 * the sitemap does not pull every description on an hourly schedule.
 */
export async function listJobIndex(_req: Request, res: Response): Promise<void> {
  const rows = await Job.findAll({
    attributes: ["slug", "updatedAt"],
    where: liveJob(),
  });

  res.json(rows);
}

export async function getJobBySlug(req: Request, res: Response): Promise<void> {
  // Express 5 types a route param as `string | string[] | undefined`.
  const slug = String(req.params.slug ?? "");

  const row = await Job.findOne({
    attributes: [
      ...PUBLIC_COLUMNS,
      "description",
      "responsibilities",
      "requirements",
      "seoTitle",
      "seoDescription",
    ],
    where: { slug, ...liveJob() },
  });

  if (!row) throw notFound("That role is no longer open.");
  res.json(row);
}
