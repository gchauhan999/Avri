/**
 * Streams a résumé from the API to the browser.
 *
 * Downloads cannot go straight to the API. Every admin endpoint requires the
 * `X-Admin-Request` header — that is the CSRF guard, and the reason it exists
 * is that a custom header is the one thing an HTML form cannot set (see
 * `server/src/middlewares/require-admin-header.ts`). But an `<a href>` cannot
 * set one either, so a plain link to the API is refused with
 * CSRF_CHECK_FAILED.
 *
 * Fetching the file into memory with JavaScript and handing back a blob URL
 * would work, but it buffers a whole CV in the tab and throws away the
 * filename the API took care to set. Proxying it here keeps the guard intact,
 * keeps the link a plain navigation, and streams the bytes straight through.
 */

import { cookies } from "next/headers";

const apiOrigin = () => (process.env.API_ORIGIN ?? "http://127.0.0.1:4000").replace(/\/$/, "");

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext): Promise<Response> {
  const { id } = await params;

  // Numeric only: this value is pasted into the upstream path.
  if (!/^\d+$/.test(id)) {
    return new Response("Not found.", { status: 404 });
  }

  const cookieHeader = (await cookies()).toString();

  let upstream: Response;
  try {
    upstream = await fetch(`${apiOrigin()}/api/admin/applications/${id}/resume`, {
      cache: "no-store",
      headers: {
        "X-Admin-Request": "1",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
    });
  } catch {
    return new Response("Could not reach the server.", { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    // The API answers with JSON; a download is not the place to render it.
    const message =
      upstream.status === 401
        ? "Your session has expired. Sign in and try again."
        : upstream.status === 404
          ? "That file is no longer available."
          : "The download failed.";
    return new Response(message, { status: upstream.status });
  }

  const headers = new Headers();
  // Content-Disposition is the whole point — it carries the applicant's name
  // and the original extension, and makes the browser save rather than render.
  for (const name of ["content-type", "content-disposition", "content-length"]) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("X-Content-Type-Options", "nosniff");
  // Personal data: keep it out of any shared cache.
  headers.set("Cache-Control", "private, no-store");

  return new Response(upstream.body, { status: 200, headers });
}
