/**
 * Browser-side API calls.
 *
 * Kept apart from `lib/api.ts` deliberately: that file imports `next/headers`
 * to forward the session cookie, and `next/headers` is server-only. A client
 * component importing anything from it drags `next/headers` into the browser
 * bundle and the build fails.
 *
 * Used for file uploads, which go straight from the browser to the API rather
 * than through a server action — that avoids routing binaries through the Next
 * server and sidesteps the server-action body size limit.
 */

export class BrowserApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "BrowserApiError";
    this.status = status;
    this.code = code;
    if (fields) this.fields = fields;
  }
}

interface ErrorBody {
  error: { code: string; message: string; fields?: Record<string, string> };
}

/**
 * Relative URL so the request passes through the `/api/*` rewrite and stays
 * same-origin; `credentials: "include"` so the session cookie rides along;
 * `X-Admin-Request` because the API's CSRF guard requires it.
 */
export async function apiBrowser<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/admin${path}`, {
    ...init,
    credentials: "include",
    headers: {
      Accept: "application/json",
      "X-Admin-Request": "1",
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ErrorBody | null;
    throw new BrowserApiError(
      res.status,
      body?.error.code ?? "REQUEST_FAILED",
      body?.error.message ?? `Request failed (${res.status})`,
      body?.error.fields
    );
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
