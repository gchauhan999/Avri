/**
 * Talking to the Avri API from the admin panel.
 *
 * Everything goes through `/api/...` on this origin, which `next.config.ts`
 * rewrites to the Express server. So:
 *   - the browser only ever sees one origin, and the session cookie is
 *     first-party,
 *   - `X-Admin-Request` is set in one place (it is the CSRF guard — see
 *     `server/src/middleware/require-admin-header.ts`),
 *   - server-side calls must forward the incoming cookie by hand, because a
 *     Server Component's `fetch` does not inherit it.
 */

import { cookies } from "next/headers";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;

  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    if (fields) this.fields = fields;
  }
}

interface ErrorBody {
  error: { code: string; message: string; fields?: Record<string, string> };
}

async function toError(res: Response): Promise<ApiError> {
  const body = (await res.json().catch(() => null)) as ErrorBody | null;
  return new ApiError(
    res.status,
    body?.error.code ?? "REQUEST_FAILED",
    body?.error.message ?? `Request failed (${res.status})`,
    body?.error.fields
  );
}

/* -------------------------------------------------------------------------- */
/*  Server side — Server Components and server actions                         */
/* -------------------------------------------------------------------------- */

/** Where the Next server reaches Express directly, skipping its own proxy. */
const serverOrigin = () => (process.env.API_ORIGIN ?? "http://127.0.0.1:4000").replace(/\/$/, "");

/**
 * Server-side request with the caller's session cookie attached.
 *
 * `cache: "no-store"` throughout: this is a dashboard, and a stale list of
 * applications is worse than a slightly slower page.
 */
export async function apiServer<T>(path: string, init: RequestInit = {}): Promise<T> {
  const cookieHeader = (await cookies()).toString();

  const res = await fetch(`${serverOrigin()}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "X-Admin-Request": "1",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...init.headers,
    },
  });

  if (!res.ok) throw await toError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** JSON body variant, for server actions. */
export async function apiServerJson<T>(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: unknown
): Promise<T> {
  return apiServer<T>(path, {
    method,
    ...(body === undefined
      ? {}
      : { body: JSON.stringify(body), headers: { "Content-Type": "application/json" } }),
  });
}

/*
 * Browser-side calls live in `lib/api-browser.ts`, not here.
 *
 * This module imports `next/headers`, which is server-only. A client component
 * importing anything from this file drags `next/headers` into the browser
 * bundle and the build fails outright.
 */
