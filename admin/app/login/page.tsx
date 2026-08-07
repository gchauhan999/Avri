import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

/**
 * `LoginForm` reads `?next=` with `useSearchParams`, which suspends during
 * prerender. Without this boundary the production build fails outright with
 * "Missing Suspense boundary with useSearchParams".
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-lg font-bold tracking-tight text-brand-600">Avri Energy</p>
          <p className="mt-1 text-sm text-ink-500">Admin panel</p>
        </div>

        <Suspense fallback={<div className="h-72 rounded-xl border border-ink-200 bg-white" />}>
          <LoginForm />
        </Suspense>

        <p className="mt-6 text-center text-xs text-ink-400">
          Signed-in sessions last eight hours.
        </p>
      </div>
    </main>
  );
}
