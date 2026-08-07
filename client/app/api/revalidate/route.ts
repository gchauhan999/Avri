/**
 * Cache invalidation hook.
 *
 * Called by the API when something is published so the page updates within
 * seconds instead of waiting out its ISR window. This route only exists
 * because the site is Node-rendered now — under `output: "export"` a POST
 * handler could not run at all.
 *
 * Guarded by a shared secret. Without one it is a free way for anyone to make
 * the site re-render every page on demand.
 */

import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

/** Only these may be invalidated, so a caller cannot ask for anything. */
const ALLOWED_TAGS = new Set(["clients", "jobs", "posts"]);

export async function POST(request: Request) {
  if (!env.revalidateSecret) {
    return NextResponse.json(
      { error: "Revalidation is not configured on this site." },
      { status: 503 }
    );
  }

  if (request.headers.get("x-revalidate-secret") !== env.revalidateSecret) {
    // Deliberately terse — no hint about whether the secret is merely wrong.
    return NextResponse.json({ error: "Not allowed." }, { status: 401 });
  }

  let body: { tags?: unknown; paths?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const tags = Array.isArray(body.tags)
    ? body.tags.filter((t): t is string => typeof t === "string" && ALLOWED_TAGS.has(t))
    : [];

  const paths = Array.isArray(body.paths)
    ? body.paths.filter(
        // Site-relative paths only. `//evil.com` is a valid URL to `new URL`
        // but must never reach revalidatePath.
        (p): p is string => typeof p === "string" && p.startsWith("/") && !p.startsWith("//")
      )
    : [];

  /**
   * `"max"` gives stale-while-revalidate: the tag is marked stale and the next
   * visitor is served the old copy while the new one is fetched behind them.
   *
   * Next 16 made this second argument required — the one-argument form expired
   * the entry immediately, so the next request paid for a blocking refetch. It
   * still compiles with the error suppressed, but the docs mark it deprecated
   * and it is the worse behaviour anyway.
   */
  for (const tag of tags) revalidateTag(tag, "max");
  for (const path of paths) revalidatePath(path);

  return NextResponse.json({ revalidated: { tags, paths } });
}
