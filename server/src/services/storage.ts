/**
 * Where uploaded files live, and how they are named.
 *
 * Two trees under STORAGE_ROOT, with a hard rule between them:
 *
 *   public/   client logos and blog covers. Served by `express.static`.
 *   resumes/  job applications. Served by NOTHING. Reachable only through an
 *             authenticated download route that streams the file.
 *
 * They are siblings, not nested, so no static mount can ever accidentally
 * expose a résumé. Résumés are personal data — names, phone numbers, addresses
 * and salary history — and a stray directory listing would be a real breach.
 */

import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

export const resumesRoot = () => path.join(env.storageRoot, "resumes");
export const publicRoot = () => path.join(env.storageRoot, "public");

/**
 * Generated, never derived from what the user uploaded.
 *
 * The applicant's filename is stored in the database and only ever reappears,
 * sanitised, in a Content-Disposition header. Using it on disk would invite
 * `../../.ssh/authorized_keys`.
 */
export function generatedName(extension: string): string {
  const ext = extension.startsWith(".") ? extension.toLowerCase() : `.${extension.toLowerCase()}`;
  return `${randomUUID()}${ext}`;
}

/** Résumés are foldered by year/month so one directory never holds 50,000 files. */
export function resumeDirFor(date = new Date()): string {
  return path.join(
    resumesRoot(),
    String(date.getUTCFullYear()),
    String(date.getUTCMonth() + 1).padStart(2, "0")
  );
}

export async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Resolve a stored relative path to an absolute one, refusing anything that
 * escapes the expected root.
 *
 * Every path we store was produced by `generatedName`, so this should be
 * impossible — which is exactly why it is worth asserting. Without it, a
 * future bug that lets a path into the database turns the download route into
 * arbitrary file read.
 */
export function resolveWithin(root: string, relative: string): string | null {
  const absolute = path.resolve(root, relative);
  const normalisedRoot = path.resolve(root);

  if (absolute !== normalisedRoot && !absolute.startsWith(normalisedRoot + path.sep)) {
    logger.error({ relative, root }, "path traversal attempt blocked");
    return null;
  }
  return absolute;
}

/** Path as stored in the database — relative to STORAGE_ROOT, forward slashes. */
export function toStoredPath(absolute: string): string {
  return path.relative(env.storageRoot, absolute).split(path.sep).join("/");
}

/** Absolute path from a stored one, or null if it escapes STORAGE_ROOT. */
export function fromStoredPath(stored: string): string | null {
  return resolveWithin(env.storageRoot, stored);
}

/**
 * Delete without caring whether it was there. Used when replacing a logo, and
 * when an insert fails after the file has already been written.
 */
export async function removeQuietly(absolute: string | null): Promise<void> {
  if (!absolute) return;
  try {
    await fs.unlink(absolute);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") logger.warn({ err: error, absolute }, "could not delete file");
  }
}

/**
 * Filename offered to the admin when downloading a résumé.
 *
 * Stripped to a safe character set for two reasons: a CR or LF in the original
 * name would let an attacker inject headers into the response, and Windows
 * refuses several characters outright.
 */
export function safeDownloadName(applicantName: string, originalName: string): string {
  const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, "") || ".pdf";
  const stem = applicantName
    .normalize("NFKD")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${stem || "resume"}${ext}`;
}
