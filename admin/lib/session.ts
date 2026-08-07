/**
 * Who is signed in.
 *
 * Three layers guard the panel, in increasing order of trustworthiness:
 *
 *   1. `proxy.ts` — checks the cookie *exists* and redirects if not. No
 *      network call, so it is cheap, but it proves nothing about validity.
 *   2. `getSession()` here — asks the API who the cookie belongs to. This is
 *      the real gate for rendering, and it also supplies the admin's name.
 *   3. The API verifies the JWT on every single request regardless. Never
 *      trust layers 1 and 2: the API may be reachable directly.
 */

import { redirect } from "next/navigation";
import { ApiError, apiServer } from "./api";

export interface Session {
  id: number;
  name: string;
  email: string;
  role: "super_admin" | "editor";
  mustChangePassword: boolean;
}

/** Null when signed out or the session has been revoked. */
export async function getSession(): Promise<Session | null> {
  try {
    const { user } = await apiServer<{ user: Session }>("/api/admin/auth/me");
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    // A 500 or a connection refused is not "signed out" — let it surface as an
    // error rather than silently bouncing the user to the login page, which
    // would look like their password stopped working.
    throw error;
  }
}

/** For pages that must not render at all without a session. */
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
