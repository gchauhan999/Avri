import Link from "next/link";
import { redirect } from "next/navigation";
import SignOutButton from "../../components/layout/SignOutButton";
import { getSession } from "../../lib/session";
import { EXPIRED_PARAM } from "../../proxy";

/**
 * Account pages: signed in, but outside the dashboard's gates.
 *
 * This group exists for one reason. `(dashboard)/layout.tsx` sends an admin who
 * still owes a password change to `/settings/password`. While that page lived
 * inside `(dashboard)`, the same layout ran for it and sent it to itself — an
 * endless redirect that the browser followed until the API rate limit stopped
 * it. Route groups do not change the URL, so the page keeps its path and simply
 * stops being subject to the rule that points at it.
 *
 * Deliberately no sidebar: while a change is being forced every link in it
 * would bounce straight back here.
 */
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect(`/login?${EXPIRED_PARAM}=1`);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-ink-200 bg-white px-5 py-3">
        <Link href="/" className="block">
          <span className="text-base font-bold tracking-tight text-brand-600">Avri Energy</span>
          <span className="mt-0.5 block text-xs text-ink-400">Admin panel</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-ink-500 sm:inline">{session.name}</span>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1 p-5 lg:p-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
