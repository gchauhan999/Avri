"use server";

/**
 * Sign in, sign out, change password.
 *
 * These run on the Next server and forward the request to Express, so the
 * session token is set by the API and never touched by client JavaScript.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "../../lib/api";

export interface AuthFormState {
  error?: string;
  fields?: Record<string, string>;
}

const apiOrigin = () => (process.env.API_ORIGIN ?? "http://127.0.0.1:4000").replace(/\/$/, "");

/**
 * Copy the API's session cookie onto this response.
 *
 * Any call that issues a new token has to do this. `apiServer` throws the
 * response headers away, so a route that quietly relies on it will leave the
 * browser holding the previous cookie — which the API then rejects, because
 * issuing a token means the old one is no longer the current version.
 */
async function copySessionCookie(res: Response): Promise<void> {
  const jar = await cookies();
  for (const raw of res.headers.getSetCookie()) {
    const [pair] = raw.split(";");
    const idx = pair.indexOf("=");
    const name = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    const lower = raw.toLowerCase();
    jar.set(name, value, {
      httpOnly: lower.includes("httponly"),
      secure: lower.includes("secure"),
      sameSite: "lax",
      path: "/",
    });
  }
}

/**
 * Login is one of two calls that cannot use `apiServer`: it needs the
 * `Set-Cookie` off the response so it can be written onto *this* response, and
 * the shared helper throws away the headers. `changePassword` is the other.
 */
export async function signIn(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!email || !password) {
    return { error: "Enter your email address and password." };
  }

  let res: Response;
  try {
    res = await fetch(`${apiOrigin()}/api/admin/auth/login`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Admin-Request": "1",
      },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return { error: "Could not reach the server. Is the API running?" };
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as
      | { error: { message: string; fields?: Record<string, string> } }
      | null;
    return {
      error: body?.error.message ?? "Sign-in failed.",
      ...(body?.error.fields ? { fields: body.error.fields } : {}),
    };
  }

  await copySessionCookie(res);

  // `next` comes from a query string, so only a same-site path is honoured —
  // otherwise it is an open redirect straight off the login page.
  const target = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  redirect(target);
}

export async function signOut(): Promise<void> {
  const jar = await cookies();
  const cookieHeader = jar.toString();

  await fetch(`${apiOrigin()}/api/admin/auth/logout`, {
    method: "POST",
    cache: "no-store",
    headers: { "X-Admin-Request": "1", ...(cookieHeader ? { Cookie: cookieHeader } : {}) },
  }).catch(() => {
    // Clearing our own cookie below is what actually signs them out here.
  });

  jar.delete(process.env.COOKIE_NAME ?? "avri_admin");
  redirect("/login");
}

export async function changePassword(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword !== confirmPassword) {
    return { error: "Those passwords do not match.", fields: { confirmPassword: "Does not match." } };
  }

  /**
   * Deliberately not `apiServerJson`. Changing a password bumps the account's
   * token version, which invalidates every token issued before it — including
   * the one in the browser right now. The API answers with a replacement
   * cookie, and if that is dropped the admin is signed out the moment they
   * succeed, then bounced between the login page and the dashboard.
   */
  const jar = await cookies();
  const cookieHeader = jar.toString();

  let res: Response;
  try {
    res = await fetch(`${apiOrigin()}/api/admin/auth/change-password`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Admin-Request": "1",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  } catch {
    return { error: "Could not reach the server. Is the API running?" };
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as
      | { error: { message: string; fields?: Record<string, string> } }
      | null;
    return {
      error: body?.error.message ?? "Could not change your password.",
      ...(body?.error.fields ? { fields: body.error.fields } : {}),
    };
  }

  await copySessionCookie(res);

  redirect("/");
}
