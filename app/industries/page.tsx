import type { Metadata } from "next";
import Link from "next/link";

import ContactCTA from "@/components/sections/ContactCTA";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight, Check } from "@/components/ui/Icons";
import Media from "@/components/ui/Media";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Motion";
import PageHero from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { industries } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Industries We Serve",
  description:
    "Electrical EPC and renewable energy services for power utilities, government departments, CPWD, DISCOMs, renewable energy, industries, commercial buildings, residential projects, infrastructure and smart cities.",
  path: "/industries",
  keywords: industries.map((i) => i.title.toLowerCase()),
});

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        breadcrumb="Industries"
        eyebrow="Industries we serve"
        title="Sectors that cannot afford an outage"
        lead="We work across the full spread of India's power ecosystem — from utility networks and government contracts to factories, campuses, infrastructure and smart-city programmes."
      />

      {/* ------------------------------------------------------- Quick index */}
      <div className="border-b border-ink-100 bg-ink-50/60">
        <Section className="py-8 sm:py-10">
          <RevealGroup className="flex flex-wrap gap-2.5">
            {industries.map((i) => (
              <RevealItem key={i.slug}>
                <Link
                  href={`#${i.slug}`}
                  className="inline-flex rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-600 transition-colors hover:border-brand-500 hover:text-brand-600"
                >
                  {i.title}
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </Section>
      </div>

      {/* ----------------------------------------------------- Industry cards */}
      <Section>
        <RevealGroup className="grid gap-6 md:grid-cols-2">
          {industries.map((industry, index) => (
            <RevealItem key={industry.slug}>
              <article
                id={industry.slug}
                className="flex h-full scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white transition-colors hover:border-brand-200"
              >
                <Media
                  illustration={industry.illustration}
                  src={industry.image}
                  alt={industry.title}
                  ratio="aspect-[21/9]"
                  rounded="rounded-none"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />

                <div className="flex flex-1 flex-col p-8">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-bold tracking-tight text-ink-900">
                      {industry.title}
                    </h2>
                    <span className="font-mono text-sm font-bold text-ink-200">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-ink-500">
                    {industry.summary}
                  </p>

                  <ul className="mt-6 flex-1 space-y-3 border-t border-ink-100 pt-6">
                    {industry.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex gap-3 text-sm leading-relaxed text-ink-700"
                      >
                        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>

                  <ButtonLink
                    href="/request-a-quote"
                    variant="soft"
                    size="sm"
                    className="mt-7 self-start"
                  >
                    Discuss a project
                    <ArrowRight className="h-3.5 w-3.5" />
                  </ButtonLink>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      {/* ------------------------------------------------------------- Note */}
      <Section className="bg-ink-50/60 py-12 sm:py-16">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-ink-900">
            Not on the list?
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-500">
            The engineering is the same wherever the load sits. If you have an
            electrical or renewable energy requirement in a sector we have not
            named, tell us about it — we will be straight with you about whether
            we are the right partner for it.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/contact">
              Talk to Us
              <ArrowRight />
            </ButtonLink>
            <ButtonLink href="/services" variant="outline">
              View Our Services
            </ButtonLink>
          </div>
        </Reveal>
      </Section>

      <ContactCTA />
    </>
  );
}
