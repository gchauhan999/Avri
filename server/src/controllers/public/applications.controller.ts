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

import path from "node:path";
import type { Request, Response } from "express";
import { env } from "../../config/env.js";
import { logger } from "../../config/logger.js";
import { checkDiskSpace } from "../../helpers/disk.js";
import {
  conflict,
  serviceUnavailable,
  unprocessable,
  unsupportedMedia,
} from "../../helpers/http-error.js";
import { clientIpFn, userAgent } from "../../helpers/request.js";
import { normalisePhone } from "../../helpers/validation.js";
import { Application, Job } from "../../models/index.js";
import { verifyResume } from "../../services/file-type.js";
import { send } from "../../services/mailer.js";
import {
  fromStoredPath,
  removeQuietly,
  safeDownloadName,
  toStoredPath,
} from "../../services/storage.js";
import {
  applicationAcknowledgement,
  applicationEmail,
} from "../../services/templates/application.js";
import { applySchema } from "../../validations/application.validation.js";

const SUCCESS =
  "Your application has reached us. If your profile fits the role, our HR team will call you within a week.";

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
async function notify(id: number): Promise<void> {
  const row = await Application.findByPk(id);
  if (!row) return;

  const absolute = fromStoredPath(row.resumePath);
  const attachment = absolute
    ? { filename: safeDownloadName(row.fullName, row.resumeOriginalName), path: absolute }
    : null;

  if (!attachment) {
    logger.error(
      { id, resumePath: row.resumePath },
      "résumé path did not resolve — sending without it"
    );
  }

  const result = await send(applicationEmail(row, attachment));

  await row.update({
    emailStatus: result.status,
    emailError: result.error ?? null,
    emailAttempts: row.emailAttempts + 1,
  });

  // Best effort, and never allowed to affect the HR notification's status.
  if (env.mail.ackEnabled) {
    await send(applicationAcknowledgement(row)).catch(() => undefined);
  }
}

export async function submitApplication(req: Request, res: Response): Promise<void> {
  const file = req.file;

  /** Unlink on every failure path below, so nothing is orphaned. */
  const bail = async (error: unknown): Promise<never> => {
    if (file) await removeQuietly(file.path);
    throw error;
  };

  const parsed = applySchema.safeParse(req.body);
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
        `We cannot accept applications at the moment. Please email your CV to ${
          env.mail.hrTo || "us"
        } instead.`
      )
    );
  }

  /**
   * The check multer cannot do: read the real leading bytes. An .exe renamed to
   * .pdf and sent with a PDF content type passes everything before this.
   */
  const extension = path.extname(file.originalname);
  const check = await verifyResume(file.path, extension);
  if (!check.ok) {
    logger.warn(
      { ip: req.ip, originalname: file.originalname, mimetype: file.mimetype },
      "résumé failed magic-number check"
    );
    return bail(
      unsupportedMedia(
        "That file is not a readable PDF or Word document. Please attach your CV again."
      )
    );
  }

  // Resolve the job, if this is an application to a specific opening.
  let jobId: number | null = null;
  let jobTitle = data.position || "General application";

  if (data.jobSlug) {
    const job = await Job.findOne({
      attributes: ["id", "title"],
      where: { slug: data.jobSlug, status: "open" },
    });

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
    const duplicates = await Application.count({
      where: { jobId, resumeSha256: check.sha256 },
    });

    if (duplicates > 0) {
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
    const created = await Application.create({
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
      // A SQL function, not a value — see `clientIpFn`.
      sourceIp: clientIpFn(req) as unknown as Buffer,
      userAgent: userAgent(req),
    });
    insertedId = created.id;
  } catch (error) {
    // The row is what makes the file meaningful; without one it is litter.
    return bail(error);
  }

  void notify(insertedId).catch((error) => {
    logger.error({ err: error, id: insertedId }, "application notification failed");
  });

  res.status(201).json({ id: insertedId, message: SUCCESS });
}
