/**
 * Multer configurations.
 *
 * Two very different jobs:
 *
 *  - `imageUpload` buffers in memory, because sharp wants a buffer and the
 *    files are small. Nothing is written until it has been re-encoded.
 *  - `resumeUpload` streams to disk, because it is a public endpoint and a
 *    5 MB buffer per concurrent request is a easy way to be pushed over.
 *
 * Both cap `files`, `fields` and `parts`. Without those a multipart body can
 * carry thousands of fields and cost real CPU before any handler runs.
 */

import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { env } from "../config/env.js";
import { unsupportedMedia } from "../lib/http-error.js";
import { ALLOWED_IMAGE_MIME } from "../services/images.js";
import { generatedName, resumeDirFor } from "../services/storage.js";

/* -------------------------------------------------------------------------- */
/*  Résumés                                                                    */
/* -------------------------------------------------------------------------- */

const RESUME_EXT = new Set([".pdf", ".doc", ".docx"]);

/**
 * Browsers and operating systems disagree about Word documents. A .doc from an
 * older Office install can arrive as `application/x-msword`, and several
 * report `application/octet-stream` for both formats.
 *
 * So octet-stream is tolerated, but only because the *extension* vouches for
 * it — both checks must pass, and neither is trusted alone. The real check is
 * the magic-number test that runs in the route after the file has landed.
 */
const RESUME_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/x-msword",
  "application/octet-stream",
]);

export const resumeUpload = multer({
  storage: multer.diskStorage({
    destination(_req, _file, cb) {
      const dir = resumeDirFor();
      fs.mkdir(dir, { recursive: true }).then(
        () => cb(null, dir),
        (error) => cb(error as Error, dir)
      );
    },
    filename(_req, file, cb) {
      cb(null, generatedName(path.extname(file.originalname)));
    },
  }),
  limits: {
    fileSize: env.maxResumeBytes,
    files: 1,
    fields: 25,
    parts: 30,
  },
  fileFilter(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!RESUME_EXT.has(ext) || !RESUME_MIME.has(file.mimetype)) {
      cb(unsupportedMedia("Attach your CV as a PDF or Word document."));
      return;
    }
    cb(null, true);
  },
});

/* -------------------------------------------------------------------------- */
/*  Images                                                                     */
/* -------------------------------------------------------------------------- */

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxImageBytes, files: 1, fields: 10, parts: 12 },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_IMAGE_MIME.has(file.mimetype)) {
      cb(unsupportedMedia("Upload a PNG, JPEG or WebP image. SVG files are not accepted."));
      return;
    }
    cb(null, true);
  },
});
