/**
 * Free space on the volume holding the upload directory.
 *
 * Guards the one public endpoint that writes files. Without it, a flood of
 * 5 MB uploads eventually fills the disk — and a full disk does not just stop
 * applications, it takes MySQL and the whole site down with it. Better to turn
 * applicants away with an email address than to lose everything.
 */

import { statfs } from "node:fs/promises";
import { logger } from "../config/logger.js";

/**
 * Bytes available, or `null` if it cannot be determined.
 *
 * `null` means "carry on": a platform that will not report free space is not a
 * reason to refuse every application.
 */
export async function checkDiskSpace(directory: string): Promise<number | null> {
  try {
    const stats = await statfs(directory);
    return stats.bavail * stats.bsize;
  } catch (error) {
    logger.debug({ err: error, directory }, "could not read free disk space");
    return null;
  }
}
