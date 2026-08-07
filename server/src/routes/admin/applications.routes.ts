/**
 * Reviewing applications, and downloading the CVs.
 */

import { Router } from "express";
import { and, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/client.js";
import { applications, jobs } from "../../db/schema.js";
import { notFound } from "../../lib/http-error.js";
import { logger } from "../../lib/logger.js";
import { offsetOf, pageQuery, paged } from "../../lib/pagination.js";
import { requireAuth } from "../../middleware/auth.js";
import { send } from "../../services/mailer.js";
import { applicationEmail } from "../../services/templates/application.js";
import {
  fromStoredPath,
  removeQuietly,
  resolveWithin,
  resumesRoot,
  safeDownloadName,
} from "../../services/storage.js";

export const adminApplicationsRouter = Router();

adminApplicationsRouter.use(requireAuth);

const listQuery = pageQuery.extend({
  jobId: z.coerce.number().int().positive().optional(),
  status: z.enum(["new", "shortlisted", "interviewing", "rejected", "hired"]).optional(),
  q: z.string().trim().max(120).optional(),
});

adminApplicationsRouter.get("/", async (req, res) => {
  const { page, limit, jobId, status, q } = listQuery.parse(req.query);

  const filters: SQL[] = [];
  if (jobId) filters.push(eq(applications.jobId, jobId));
  if (status) filters.push(eq(applications.status, status));
  if (q) {
    const term = `%${q}%`;
    const search = or(
      like(applications.fullName, term),
      like(applications.email, term),
      like(applications.phoneNormalised, term),
      like(applications.currentCompany, term)
    );
    if (search) filters.push(search);
  }

  const where = filters.length ? and(...filters) : undefined;

  const [items, [count]] = await Promise.all([
    db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        jobTitle: applications.jobTitleSnapshot,
        fullName: applications.fullName,
        email: applications.email,
        phone: applications.phone,
        currentLocation: applications.currentLocation,
        experienceYears: applications.experienceYears,
        currentCompany: applications.currentCompany,
        noticePeriod: applications.noticePeriod,
        linkedinUrl: applications.linkedinUrl,
        coverLetter: applications.coverLetter,
        resumeOriginalName: applications.resumeOriginalName,
        resumeSizeBytes: applications.resumeSizeBytes,
        status: applications.status,
        adminNotes: applications.adminNotes,
        emailStatus: applications.emailStatus,
        emailError: applications.emailError,
        createdAt: applications.createdAt,
      })
      .from(applications)
      .where(where)
      .orderBy(desc(applications.createdAt))
      .limit(limit)
      .offset(offsetOf(page, limit)),
    db.select({ n: sql<number>`count(*)` }).from(applications).where(where),
  ]);

  res.json(paged(items, Number(count?.n ?? 0), page, limit));
});

/** The roles that have applications, to populate the filter dropdown. */
adminApplicationsRouter.get("/jobs", async (_req, res) => {
  const rows = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      count: sql<number>`(SELECT COUNT(*) FROM applications a WHERE a.job_id = ${jobs.id})`,
    })
    .from(jobs)
    .orderBy(desc(jobs.createdAt));

  res.json({ items: rows.filter((row) => Number(row.count) > 0) });
});

adminApplicationsRouter.get("/:id", async (req, res) => {
  const [row] = await db
    .select()
    .from(applications)
    .where(eq(applications.id, Number(req.params.id)))
    .limit(1);
  if (!row) throw notFound("No such application.");
  res.json(row);
});

const patchSchema = z.object({
  status: z.enum(["new", "shortlisted", "interviewing", "rejected", "hired"]).optional(),
  adminNotes: z.string().max(5000).optional(),
});

adminApplicationsRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const patch = patchSchema.parse(req.body);

  if (Object.keys(patch).length > 0) {
    await db.update(applications).set(patch).where(eq(applications.id, id));
  }

  const [row] = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  if (!row) throw notFound("No such application.");
  res.json(row);
});

/* -------------------------------------------------------------------------- */
/*  Résumé download                                                            */
/* -------------------------------------------------------------------------- */

/**
 * The only way to read a CV.
 *
 * Résumés are never under a static mount — `storage/resumes` is a sibling of
 * `storage/public`, not a child — so this route is the sole path to the file,
 * and it is behind `requireAuth`.
 *
 * Three deliberate details:
 *   - the path is resolved and re-checked against the résumé root. Every
 *     stored path came from our own UUID generator, so this should be
 *     unreachable, which is exactly why it is worth asserting: without it a
 *     future bug that lets a path into the database becomes arbitrary file
 *     read.
 *   - `Content-Disposition: attachment` plus `nosniff` means a browser never
 *     renders the file inline, so a crafted document cannot execute in the
 *     admin's session.
 *   - `no-store`, because this is personal data and should not sit in a proxy
 *     cache.
 */
adminApplicationsRouter.get("/:id/resume", async (req, res) => {
  const id = Number(req.params.id);
  const [row] = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  if (!row) throw notFound("No such application.");

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
});

/** Retry the HR notification when SMTP was down at the time. */
adminApplicationsRouter.post("/:id/resend", async (req, res) => {
  const id = Number(req.params.id);
  const [row] = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  if (!row) throw notFound("No such application.");

  const absolute = fromStoredPath(row.resumePath);
  const attachment = absolute
    ? { filename: safeDownloadName(row.fullName, row.resumeOriginalName), path: absolute }
    : null;

  const result = await send(applicationEmail(row, attachment));

  await db
    .update(applications)
    .set({
      emailStatus: result.status,
      emailError: result.error ?? null,
      emailAttempts: row.emailAttempts + 1,
    })
    .where(eq(applications.id, id));

  res.json({ status: result.status, error: result.error ?? null });
});

adminApplicationsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [row] = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  if (!row) throw notFound("No such application.");

  await db.delete(applications).where(eq(applications.id, id));

  // Delete the CV too. Keeping personal data after the record is gone would be
  // both pointless and a retention problem.
  await removeQuietly(fromStoredPath(row.resumePath));

  logger.info({ id, by: req.admin!.email }, "application deleted");
  res.status(204).end();
});
