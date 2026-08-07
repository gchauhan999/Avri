"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Counts come from `/api/admin/stats` and are rendered by the layout, so the
 * sidebar itself stays a thin presentational component.
 */
export interface NavCounts {
  enquiries?: number;
  applications?: number;
}

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/enquiries", label: "Enquiries", count: "enquiries" as const },
  { href: "/applications", label: "Applications", count: "applications" as const },
  { href: "/jobs", label: "Jobs" },
  { href: "/blog", label: "Blog posts" },
  { href: "/clients", label: "Clients" },
];

function isActive(pathname: string, href: string) {
  // Overview must match exactly, or it lights up on every page.
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function Sidebar({
  counts = {},
  orientation = "vertical",
}: {
  counts?: NavCounts;
  /** The same links run as a scrollable row in the mobile header. */
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Sections"
      className={orientation === "vertical" ? "flex flex-col gap-1" : "flex flex-row gap-1"}
    >
      {LINKS.map((link) => {
        const active = isActive(pathname, link.href);
        const count = link.count ? counts[link.count] : undefined;

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center justify-between gap-1 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-brand-50 text-brand-700"
                : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
            }`}
          >
            <span>{link.label}</span>
            {count ? (
              <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-accent-500 px-1.5 text-xs font-bold text-white">
                {count > 99 ? "99+" : count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
