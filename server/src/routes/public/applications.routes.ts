/**
 * Job applications — the only public route that writes a file to disk.
 *
 * That makes it the most exposed thing in the API, so the order of operations
 * matters:
 *
 *   1. multer streams the upload to disk (extension + MIME already filtered),
 *   2. the leading bytes are checked against the real format signature,
 *   3. the fields are validated,
 *   4. the row is written,
 *   5. only then is the response sent, and mail goes out afterwards.
 *
 * If anything in 2–4 fails, the file is unlinked. Nothing is left behind, and
 * no orphan can accumulate on the volume.
 */

import { Router } from "express";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { checkDiskSpace } from "../../lib/disk.js";
import { db } from "../../db/client.js";
import { applications, jobs } from "../../db/schema.js";
import {
  conflict,
  serviceUnavailable,
  unprocessable,
  unsupportedMedia,
} from "../../lib/http-error.js";
import { logger } from "../../lib/logger.js";
import { clientIpSql, userAgent } from "../../lib/request.js";
import { email, honeypot, name, normalisePhone, phone } from "../../lib/validation.js";
import { applicationWrite } from "../../middleware/rate-limit.js";
import { resumeUpload } from "../../middleware/upload.js";
import { verifyResume } from "../../services/file-type.js";
import { send } from "../../services/mailer.js";
import {
  applicationAcknowledgement,
  applicationEmail,
} from "../../services/templates/application.js";
import { env } from "../../config/env.js";
import { fromStoredPath, removeQuietly, safeDownloadName, toStoredPath } from "../../services/storage.js";
import path from "node:path";

export const applicationsRouter = Router();

const SUCCESS =
  "Your application has reached us. If your profile fits the role, our HR team will call you within a week.";

const bodySchema = z.object({
  jobSlug: z.string().trim().max(220).optional().transform((v) => v || ""),
  position: z.string().trim().max(200).optional().transform((v) => v || ""),
  name,
  email,
  phone,
  currentLocation: z.string().trim().max(160).optional().transform((v) => v || ""),
  experience: z.string().trim().max(40).optional().transform((v) => v || ""),
  currentCompany: z.string().trim().max(160).optional().transform((v) => v || ""),
  noticePeriod: z.string().trim().max(60).optional().transform((v) => v || ""),
  linkedin: z
    .union([z.literal(""), z.string().trim().url("Enter a full URL, including https://").max(300)])
    .optional()
    .transform((v) => v || ""),
  message: z.string().trim().max(5000).optional().transform((v) => v || ""),
  company_website: honeypot,
});

/** "3–5 years" / "Fresher" → a number the database can filter on. */
function experienceToNumber(value: string): string | null {
  if (!value) return null;
  if (/fresher/i.test(value)) return "0.0";
  const match = /(\d+(?:\.\d+)?)/.exec(value);
  return match ? match[1]! : null;
}

/**
 * Deliver in the background and record the outcome on the row. Never awaited:
 * the applicant has already been told we have it, which is true — the row and
 * the file both exist.
 */
async function notify(id: number) {
  const [row] = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  if (!row) return;

  const absolute = fromStoredPath(row.resumePath);
  const attachment = absolute
    ? { filename: safeDownloadName(row.fullName, row.resumeOriginalName), path: absolute }
    : null;

  if (!attachment) {
    logger.error({ id, resumePath: row.resumePath }, "résumé path did not resolve — sending without it");
  }

  const result = await send(applicationEmail(row, attachment));

  await db
    .update(applications)
    .set({
      emailStatus: result.status,
      emailError: result.error ?? null,
      emailAttempts: row.emailAttempts + 1,
    })
    .where(eq(applications.id, id));

  // Best effort, and never allowed to affect the HR notification's status.
  if (env.mail.ackEnabled) {
    await send(applicationAcknowledgement(row)).catch(() => undefined);
  }
}

applicationsRouter.post(
  "/",
  applicationWrite,
  resumeUpload.single("resume"),
  async (req, res) => {
    const file = req.file;

    /** Unlink on every failure path below, so nothing is orphaned. */
    const bail = async (error: unknown): Promise<never> => {
      if (file) await removeQuietly(file.path);
      throw error;
    };

    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "form";
        if (!fields[key]) fields[key] = issue.message;
      }
      return bail(unprocessable(fields));
    }
    const data = parsed.data;

    /**
     * Honeypot. Answer with the normal success and write nothing — a bot that
     * receives an error just retries without the field.
     */
    if (data.company_website) {
      logger.debug({ ip: req.ip }, "honeypot triggered on application");
      if (file) await removeQuietly(file.path);
      res.status(201).json({ message: SUCCESS });
      return;
    }

    if (!file) {
      throw unprocessable({ resume: "Please attach your CV." });
    }

    /**
     * Refuse new uploads before the volume fills. A full disk takes down the
     * database and the whole site with it, so it is worth turning applications
     * away first — and saying so, rather than failing opaquely.
     */
    const free = await checkDiskSpace(env.storageRoot);
    if (free !== null && free < env.minFreeDiskBytes) {
      logger.error({ free }, "storage nearly full — refusing applications");
      return bail(
        serviceUnavailable(
          `We cannot accept applications at the moment. Please email your CV to ${env.mail.hrTo || "us"} instead.`
        )
      );
    }

    /**
     * The check multer cannot do: read the real leading bytes. An .exe renamed
     * to .pdf and sent with a PDF content type passes everything before this.
     */
    const extension = path.extname(file.originalname);
    const check = await verifyResume(file.path, extension);
    if (!check.ok) {
      logger.warn(
        { ip: req.ip, originalname: file.originalname, mimetype: file.mimetype },
        "résumé failed magic-number check"
      );
      return bail(
        unsupportedMedia("That file is not a readable PDF or Word document. Please attach your CV again.")
      );
    }

    // Resolve the job, if this is an application to a specific opening.
    let jobId: number | null = null;
    let jobTitle = data.position || "General application";

    if (data.jobSlug) {
      const [job] = await db
        .select({ id: jobs.id, title: jobs.title })
        .from(jobs)
        .where(and(eq(jobs.slug, data.jobSlug), eq(jobs.status, "open")))
        .limit(1);

      if (job) {
        jobId = job.id;
        // Trust the database over the posted title.
        jobTitle = job.title;
      }
    }

    /**
     * Same CV, same role, already on file. Not a unique index: `job_id` is
     * nullable and MySQL treats each NULL as distinct, so a constraint would
     * never cover speculative applications.
     */
    if (jobId !== null) {
      const [existing] = await db
        .select({ id: applications.id })
        .from(applications)
        .where(and(eq(applications.jobId, jobId), eq(applications.resumeSha256, check.sha256)))
        .limit(1);

      if (existing) {
        return bail(
          conflict(
            "You have already applied for this role with this CV. We have your application.",
            "ALREADY_APPLIED"
          )
        );
      }
    }

    let insertedId: number;
    try {
      const [result] = await db.insert(applications).values({
        jobId,
        jobTitleSnapshot: jobTitle,
        fullName: data.name,
        email: data.email,
        phone: data.phone,
        phoneNormalised: normalisePhone(data.phone),
        currentLocation: data.currentLocation || null,
        experienceYears: experienceToNumber(data.experience),
        currentCompany: data.currentCompany || null,
        noticePeriod: data.noticePeriod || null,
        linkedinUrl: data.linkedin || null,
        coverLetter: data.message || null,
        resumePath: toStoredPath(file.path),
        // Stored, but never used as a path — only in Content-Disposition.
        resumeOriginalName: file.originalname.slice(0, 255),
        resumeMime: file.mimetype,
        resumeSizeBytes: check.size,
        resumeSha256: check.sha256,
        sourceIp: clientIpSql(req) as never,
        userAgent: userAgent(req),
      });
      insertedId = result.insertId;
    } catch (error) {
      // The row is what makes the file meaningful; without one it is litter.
      return bail(error);
    }

    void notify(insertedId).catch((error) => {
      logger.error({ err: error, id: insertedId }, "application notification failed");
    });

    res.status(201).json({ id: insertedId, message: SUCCESS });
  }
);
