/**
 * Processing for uploaded logos and cover images.
 *
 * Everything is re-encoded through sharp rather than being written as
 * received. That does four jobs at once:
 *
 *   1. Validates — sharp throws on anything that is not really an image, so a
 *      renamed file is caught here rather than at render.
 *   2. Strips metadata — a site photograph straight off a phone carries GPS
 *      coordinates, and publishing those is a genuine leak.
 *   3. Neutralises polyglots — the output is encoded from decoded pixels, so
 *      any payload smuggled in the original container does not survive.
 *   4. Normalises size and format, and returns the dimensions so `next/image`
 *      can reserve space and avoid layout shift.
 */

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { unsupportedMedia } from "../helpers/http-error.js";
import { uploadUrl } from "../helpers/uploads.js";
import { ensureDir, generatedName, publicRoot, toStoredPath } from "./storage.js";

/**
 * SVG is deliberately absent.
 *
 * An SVG is a document that can carry script, and we would be serving it from
 * our own domain — so a malicious logo becomes stored XSS. Sanitising SVG
 * properly is a project of its own; rejecting it and asking for a PNG is a
 * two-second inconvenience for whoever uploads the logo.
 */
export const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export type ImagePurpose = "client_logo" | "post_cover";

interface Spec {
  folder: string;
  maxWidth: number;
  maxHeight?: number;
  /** Logos are usually a mark on white with a lot of surrounding space. */
  trim?: boolean;
}

const SPECS: Record<ImagePurpose, Spec> = {
  client_logo: { folder: "clients", maxWidth: 600, maxHeight: 300, trim: true },
  post_cover: { folder: "posts", maxWidth: 1600 },
};

export interface StoredImage {
  /** Relative to STORAGE_ROOT, as stored in the database. */
  path: string;
  /** Same-origin URL for the browser — see `helpers/uploads.ts`. */
  url: string;
  width: number;
  height: number;
  bytes: number;
}

export async function processImage(
  buffer: Buffer,
  mimetype: string,
  purpose: ImagePurpose
): Promise<StoredImage> {
  if (!ALLOWED_IMAGE_MIME.has(mimetype)) {
    throw unsupportedMedia(
      "Upload a PNG, JPEG or WebP image. SVG files are not accepted."
    );
  }

  const spec = SPECS[purpose];

  let pipeline = sharp(buffer, { failOn: "error" })
    // Honour the EXIF orientation flag before stripping metadata, or portrait
    // photos come out sideways.
    .rotate();

  if (spec.trim) {
    // Crop uniform surrounding colour so logos of different padding line up.
    pipeline = pipeline.trim({ threshold: 12 });
  }

  pipeline = pipeline.resize({
    width: spec.maxWidth,
    ...(spec.maxHeight ? { height: spec.maxHeight } : {}),
    fit: "inside",
    withoutEnlargement: true,
  });

  let output: { data: Buffer; info: { width: number; height: number; size: number } };
  try {
    output = await pipeline.webp({ quality: 85, effort: 4 }).toBuffer({ resolveWithObject: true });
  } catch {
    // sharp failing to decode means it is not the image it claimed to be.
    throw unsupportedMedia("That file could not be read as an image.");
  }

  const dir = path.join(publicRoot(), spec.folder);
  await ensureDir(dir);

  const absolute = path.join(dir, generatedName(".webp"));
  await fs.writeFile(absolute, output.data);

  const stored = toStoredPath(absolute);

  return {
    path: stored,
    url: uploadUrl(stored)!,
    width: output.info.width,
    height: output.info.height,
    bytes: output.info.size,
  };
}

/** Absolute path on disk for a stored public image, for deletion. */
export function publicImageAbsolute(storedPath: string): string {
  return path.join(publicRoot(), storedPath.replace(/^public\//, ""));
}
