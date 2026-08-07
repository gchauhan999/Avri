import Link from "next/link";
import { redirect } from "next/navigation";
import Sidebar, { type NavCounts } from "../../components/layout/Sidebar";
import SignOutButton from "../../components/layout/SignOutButton";
import { getSession } from "../../lib/session";
import { apiServer } from "../../lib/api";

/**
 * The real auth gate.
 *
 * `proxy.ts` already bounced anyone without a cookie, but it only checked that
 * one exists. This asks the API who it belongs to, so an expired, revoked or
 * forged cookie stops here — before any protected page renders.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  // A bootstrap account on its seeded password can go exactly one place.
  if (session.mustChangePassword) redirect("/settings/password");

  // Badge counts. Failing to load them must not take the whole panel down.
  const counts = await apiServer<NavCounts>("/api/admin/stats/counts").catch(() => ({}));

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 shrink-0 border-r border-ink-200 bg-white lg:flex lg:flex-col">
        <div className="border-b border-ink-100 px-5 py-4">
          <Link href="/" className="block">
            <span className="text-base font-bold tracking-tight text-brand-600">Avri Energy</span>
            <span className="mt-0.5 block text-xs text-ink-400">Admin panel</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <Sidebar counts={counts} />
        </div>

        <div className="border-t border-ink-100 p-3">
          <Link
            href="/settings/password"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
          >
            Change password
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-ink-200 bg-white px-5 py-3">
          {/* The sidebar is desktop-only; on mobile this keeps a way home. */}
          <Link href="/" className="text-sm font-bold text-brand-600 lg:hidden">
            Avri Energy
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-ink-500 sm:inline">
              {session.name}
              {session.role === "super_admin" ? (
                <span className="ml-2 rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-600">
                  Super admin
                </span>
              ) : null}
            </span>
            <SignOutButton />
          </div>
        </header>

        {/* Mobile section nav, since the sidebar is hidden below lg. */}
        <div className="overflow-x-auto border-b border-ink-200 bg-white px-3 py-2 lg:hidden">
          <div className="min-w-max">
            <Sidebar counts={counts} orientation="horizontal" />
          </div>
        </div>

        <main className="flex-1 p-5 lg:p-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
