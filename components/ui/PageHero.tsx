import Link from "next/link";
import type { ReactNode } from "react";
import { Container, Eyebrow } from "./Section";
import { Reveal } from "./Motion";

export interface Crumb {
  label: string;
  /** Omit on the current page — it renders as plain text. */
  href?: string;
}

/** Shared hero band used at the top of every inner page. */
export default function PageHero({
  eyebrow,
  title,
  lead,
  breadcrumb,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  /** A single label, or a trail for nested pages. "Home" is prepended. */
  breadcrumb: string | Crumb[];
  children?: ReactNode;
}) {
  const trail: Crumb[] =
    typeof breadcrumb === "string" ? [{ label: breadcrumb }] : breadcrumb;

  return (
    <div className="relative isolate overflow-hidden bg-ink-900">
      {/* Brand glows */}
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-32 h-[26rem] w-[26rem] rounded-full bg-brand-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-accent-500/12 blur-3xl"
      />
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <defs>
          <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M48 0H0v48"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-white/[0.06]"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      <Container className="relative py-16 sm:py-24">
        <Reveal>
          <nav
            aria-label="Breadcrumb"
            className="mb-8 flex flex-wrap items-center text-xs text-white/50"
          >
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            {trail.map((crumb, index) => (
              <span key={crumb.label} className="flex items-center">
                <span className="px-2" aria-hidden="true">
                  /
                </span>
                {crumb.href && index < trail.length - 1 ? (
                  <Link
                    href={crumb.href}
                    className="transition-colors hover:text-white"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span
                    className="text-white"
                    aria-current={index === trail.length - 1 ? "page" : undefined}
                  >
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>

          <Eyebrow tone="light">{eyebrow}</Eyebrow>

          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {title}
          </h1>

          {lead ? (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
              {lead}
            </p>
          ) : null}

          {children ? <div className="mt-9">{children}</div> : null}
        </Reveal>
      </Container>
    </div>
  );
}
