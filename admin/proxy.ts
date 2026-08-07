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

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const signedIn = request.cookies.has(COOKIE_NAME);

  // Already signed in and heading for the login page — send them onward.
  if (pathname === "/login") {
    if (signedIn) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  if (!signedIn) {
    const login = new URL("/login", request.url);
    // Remember where they were going, so sign-in returns them there.
    if (pathname !== "/") login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Everything except the login page, Next's own assets, and `/api` — which is
   * rewritten straight to Express and must stay reachable for the login POST
   * itself.
   */
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
