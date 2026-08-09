/**
 * First of three auth layers — see `lib/session.ts` for the other two.
 *
 * Note the filename: Next 16 renamed `middleware` to `proxy`. From
 * `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`:
 * "The `middleware` filename is deprecated, and has been renamed to `proxy`."
 * The runtime is Node and cannot be configured to edge.
 *
 * This only checks that a session cookie is *present*. It does not and cannot
 * verify it — that would mean a network call on every asset request. Its job
 * is to keep signed-out visitors out of the dashboard shell; the real check
 * happens in the layout, and the API re-checks everything anyway.
 */

import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = process.env.COOKIE_NAME ?? "avri_admin";

/**
 * Marker the dashboard layout adds when it finds the cookie is no longer good.
 *
 * Without it the two auth layers deadlock: this file sees a cookie and bounces
 * `/login` to the dashboard, the layout asks the API, gets a 401 and bounces
 * back to `/login`, forever. The layout cannot clear the cookie itself — a
 * Server Component may not write one — so it says so in the URL and this file
 * does the clearing.
 */
export const EXPIRED_PARAM = "expired";

/**
 * Redirect within the app.
 *
 * Built from `nextUrl.clone()` rather than `new URL(path, request.url)`: the
 * clone is a `NextURL` and carries `basePath`, so the target keeps its `/admin`
 * prefix. A plain URL drops it and the visitor lands on a 404 at the site root.
 */
function redirectTo(request: NextRequest, pathname: string, search?: URLSearchParams) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = search ? `?${search.toString()}` : "";
  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;

  const signedIn = request.cookies.has(COOKIE_NAME);

  if (pathname === "/login") {
    // A layout has just told us this cookie is dead. Let the login page render,
    // and bin the cookie on the way so the next request is honest.
    if (searchParams.has(EXPIRED_PARAM)) {
      const response = NextResponse.next();
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    // Already signed in and heading for the login page — send them onward.
    if (signedIn) return redirectTo(request, "/");
    return NextResponse.next();
  }

  if (!signedIn) {
    const params = new URLSearchParams();
    // Remember where they were going, so sign-in returns them there.
    if (pathname !== "/") params.set("next", `${pathname}${search}`);
    return redirectTo(request, "/login", params);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Everything except Next's own assets, `/uploads` — image files, which do not
   * need a cookie check each — and `/api`, which is rewritten straight to
   * Express and must stay reachable for the login POST itself.
   */
  matcher: ["/((?!api|uploads|_next/static|_next/image|favicon.ico).*)"],
};
