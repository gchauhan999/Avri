/**
 * Tells the public site to refresh a page immediately.
 *
 * Pages are cached with ISR, so a published article would otherwise appear
 * some minutes later — which reads as "the admin panel is broken" to whoever
 * just pressed Publish. This pings a Route Handler on the Next server that
 * calls `revalidateTag` / `revalidatePath`.
 *
 * Never awaited by a request handler and never throws: failing to refresh a
 * cache is not a reason to fail a save that has already happened. The page
 * still updates on its own when the ISR window elapses.
 */

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export async function revalidate(tags: string[] = [], paths: string[] = []): Promise<void> {
  if (!env.revalidateUrl || !env.revalidateSecret) {
    logger.debug("revalidation not configured — the site will refresh on its own schedule");
    return;
  }

  try {
    const res = await fetch(env.revalidateUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Revalidate-Secret": env.revalidateSecret,
      },
      body: JSON.stringify({ tags, paths }),
      // A slow website must not hold up the admin panel.
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      logger.warn({ status: res.status, tags, paths }, "revalidation refused");
      return;
    }
    logger.debug({ tags, paths }, "revalidated");
  } catch (error) {
    logger.warn({ err: error, tags, paths }, "revalidation failed");
  }
}
