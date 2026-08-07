import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Section";
import {
  ArrowRight,
  Clock,
  Mail,
  Phone,
  Pin,
  socialIcons,
} from "@/components/ui/Icons";
import {
  company,
  contact,
  industries,
  legalNav,
  nav,
  services,
  socials,
  telHref,
} from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden bg-ink-900 text-white/70">
      {/* Soft brand glows */}
      <div
        aria-hidden="true"
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-accent-500/10 blur-3xl"
      />

      {/* Call-to-action band */}
      <div className="relative border-b border-white/10">
        <Container className="flex flex-col gap-6 py-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Planning an electrical or solar project?
            </h2>
            <p className="mt-2 max-w-xl text-sm">
              Share the scope and we will come back with a costed technical
              proposal, usually within two working days.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/request-a-quote"
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Request a Quote
              <ArrowRight />
            </Link>
            <a
              href={telHref(contact.phones[0])}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/10"
            >
              <Phone className="h-4 w-4" />
              {contact.phones[0]}
            </a>
          </div>
        </Container>
      </div>

      <Container className="relative grid gap-12 py-16 lg:grid-cols-12">
        {/* Brand */}
        <div className="lg:col-span-4">
          <div className="inline-flex rounded-xl bg-white px-4 py-3">
            <Image
              src="/assets/logo.png"
              alt={`${company.name} logo`}
              width={1600}
              height={800}
              className="h-11 w-auto"
            />
          </div>
          <p className="mt-6 max-w-sm text-sm leading-relaxed">
            {company.description}
          </p>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-white">
            {company.tagline}
          </p>

          {socials.length > 0 ? (
            <ul className="mt-7 flex flex-wrap gap-2.5">
              {socials.map((s) => {
                const Icon = socialIcons[s.label];
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={s.label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition-all hover:border-brand-400 hover:bg-brand-500 hover:text-white"
                    >
                      {Icon ? <Icon /> : s.label.charAt(0)}
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        {/* Company links */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
            Company
          </h2>
          <ul className="mt-5 space-y-3 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors hover:text-white">
                  {item.label}
                </Link>
                {item.children ? (
                  <ul className="mt-3 space-y-3 border-l border-white/10 pl-3.5">
                    {item.children
                      // The parent link already covers its own page.
                      .filter((child) => child.href !== item.href)
                      .map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="transition-colors hover:text-white"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                  </ul>
                ) : null}
              </li>
            ))}
            <li>
              <Link href="/request-a-quote" className="transition-colors hover:text-white">
                Request a Quote
              </Link>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div className="lg:col-span-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
            Services
          </h2>
          <ul className="mt-5 space-y-3 text-sm">
            {services.slice(0, 7).map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services#${s.slug}`}
                  className="transition-colors hover:text-white"
                >
                  {s.title}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/services"
                className="font-semibold text-brand-300 transition-colors hover:text-brand-200"
              >
                View all services
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="lg:col-span-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
            Reach Us
          </h2>
          <ul className="mt-5 space-y-4 text-sm">
            <li className="flex gap-3">
              <Pin className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
              <address className="not-italic leading-relaxed">
                {contact.addressLines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </address>
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
              <span className="flex flex-col gap-1">
                {contact.phones.map((p) => (
                  <a key={p} href={telHref(p)} className="transition-colors hover:text-white">
                    {p}
                  </a>
                ))}
                {contact.landline ? (
                  <a
                    href={telHref(contact.landline)}
                    className="transition-colors hover:text-white"
                  >
                    {contact.landline}
                  </a>
                ) : null}
              </span>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
              <a
                href={`mailto:${contact.email}`}
                className="break-all transition-colors hover:text-white"
              >
                {contact.email}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
              <span className="flex flex-col gap-1">
                {contact.hours.map((h) => (
                  <span key={h}>{h}</span>
                ))}
              </span>
            </li>
          </ul>
        </div>
      </Container>

      {/* Industries strip */}
      <div className="relative border-t border-white/10">
        <Container className="py-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
            Industries we serve
          </h2>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
            {industries.map((i) => (
              <li key={i.slug}>
                <Link
                  href={`/industries#${i.slug}`}
                  className="transition-colors hover:text-white"
                >
                  {i.title}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>

      <div className="relative border-t border-white/10">
        <Container className="flex flex-col gap-3 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {company.legalName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-5">
            {legalNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </div>
    </footer>
  );
}
