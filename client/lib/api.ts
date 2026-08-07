/**
 * Talking to the Avri API.
 *
 * Two readers, because list pages and detail pages should fail differently:
 *
 *  - `apiGet` is fail-soft. If the API is unreachable, `/clients`, `/blog` and
 *    `/careers` render their empty state. The rest of the site is file-driven
 *    and unaffected, so an API outage should not take down the services and
 *    products pages with it.
 *
 *  - `apiFind` is strict. A detail page must not call `notFound()` because of
 *    a transient 502 — ISR would cache that 404 and the article would stay
 *    missing long after the API recovered. So only a real 404 returns null;
 *    anything else throws and hits `error.tsx`.
 */

import { env } from "./env";

/** Server renders go over the loopback; the browser uses the public origin. */
const base = () => (typeof window === "undefined" ? env.apiInternalUrl : env.apiUrl);

export const apiUrl = (path: string) => `${base()}${path}`;

export interface ApiErrorBody {
  error: { code: string; message: string; fields?: Record<string, string> };
}

interface FetchOptions {
  /** Seconds. Passed straight to Next's data cache. */
  revalidate?: number;
  /** Cache tags, so `/api/revalidate` can invalidate on publish. */
  tags?: string[];
}

async function request(path: string, { revalidate = 300, tags = [] }: FetchOptions) {
  return fetch(apiUrl(path), {
    headers: { Accept: "application/json" },
    next: { revalidate, ...(tags.length ? { tags } : {}) },
  });
}

/**
 * List reader. Returns `fallback` rather than throwing, so a page renders its
 * empty state instead of a 500.
 */
export async function apiGet<T>(
  path: string,
  fallback: T,
  options: FetchOptions = {}
): Promise<T> {
  try {
    const res = await request(path, options);
    if (!res.ok) throw new Error(`${path} responded ${res.status}`);
    return (await res.json()) as T;
  } catch (error) {
    console.error("[api] falling back for", path, error);
    return fallback;
  }
}

/**
 * Detail reader. `null` means the row genuinely is not there; anything else
 * throws so the error boundary shows and ISR caches nothing.
 */
export async function apiFind<T>(path: string, options: FetchOptions = {}): Promise<T | null> {
  const res = await request(path, options);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`${path} responded ${res.status}`);
  return (await res.json()) as T;
}
