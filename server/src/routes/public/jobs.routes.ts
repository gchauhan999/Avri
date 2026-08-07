/**
 * Public job listings.
 *
 * Only `status = "open"` is ever returned, and a job whose `closesAt` has
 * passed is treated as gone. That matters beyond tidiness: Google demotes
 * sites that keep expired JobPosting markup live, so a closed role must 404
 * rather than render, and must drop out of the sitemap at the same moment.
 */

import { Router } from "express";
import { and, asc, desc, eq, gte, isNull, or, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { jobs } from "../../db/schema.js";
import { notFound } from "../../lib/http-error.js";
import { publicRead } from "../../middleware/rate-limit.js";

export const jobsRouter = Router();

/** Open, and either with no closing date or one that has not passed. */
const liveJob = () =>
  and(
    eq(jobs.status, "open"),
    or(isNull(jobs.closesAt), gte(jobs.closesAt, sql`CURDATE()`))
  );

const publicColumns = {
  id: jobs.id,
  slug: jobs.slug,
  title: jobs.title,
  department: jobs.department,
  location: jobs.location,
  employmentType: jobs.employmentType,
  experienceMin: jobs.experienceMin,
  experienceMax: jobs.experienceMax,
  openings: jobs.openings,
  salaryRange: jobs.salaryRange,
  salaryMin: jobs.salaryMin,
  salaryMax: jobs.salaryMax,
  salaryPeriod: jobs.salaryPeriod,
  summary: jobs.summary,
  publishedAt: jobs.publishedAt,
  closesAt: jobs.closesAt,
  updatedAt: jobs.updatedAt,
};

jobsRouter.get("/", publicRead, async (_req, res) => {
  const rows = await db
    .select(publicColumns)
    .from(jobs)
    .where(liveJob())
    .orderBy(desc(jobs.publishedAt), asc(jobs.title));

  res.json(rows);
});

/**
 * Slugs and timestamps only, for the sitemap. Separate from the list above so
 * the sitemap does not pull every description on an hourly schedule.
 */
jobsRouter.get("/index", publicRead, async (_req, res) => {
  const rows = await db
    .select({ slug: jobs.slug, updatedAt: jobs.updatedAt })
    .from(jobs)
    .where(liveJob());

  res.json(rows);
});

jobsRouter.get("/:slug", publicRead, async (req, res) => {
  // Express 5 types a route param as `string | string[] | undefined`.
  const slug = String(req.params.slug ?? "");

  const [row] = await db
    .select({
      ...publicColumns,
      description: jobs.description,
      responsibilities: jobs.responsibilities,
      requirements: jobs.requirements,
      seoTitle: jobs.seoTitle,
      seoDescription: jobs.seoDescription,
    })
    .from(jobs)
    .where(and(eq(jobs.slug, slug), liveJob()))
    .limit(1);

  if (!row) throw notFound("That role is no longer open.");
  res.json(row);
});
