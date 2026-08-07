import type { Metadata } from "next";
import Link from "next/link";

import ContactCTA from "@/components/sections/ContactCTA";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight, Check } from "@/components/ui/Icons";
import Media from "@/components/ui/Media";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Motion";
import PageHero from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { company, processSteps, services } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Our Services",
  description:
    "Electrical EPC and turnkey projects, HT & LT works, substations, transformers, smart metering, energy management, solar, automation, O&M, street lighting, EV charging and equipment supply.",
  path: "/services",
  keywords: services.map((s) => s.title.toLowerCase()),
});

/** Service schema so search engines can list the individual offerings. */
const servicesJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: services.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Service",
      name: s.title,
      description: s.summary,
      provider: { "@type": "Organization", name: company.name },
      url: `${company.siteUrl}/services#${s.slug}`,
    },
  })),
};

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />

      <PageHero
        breadcrumb="Services"
        eyebrow="Our services"
        title="Turnkey electrical and energy services"
        lead="Thirteen service lines covering everything between the incoming supply and the last light fitting — engineered, executed and maintained by one accountable team."
      />

      {/* ------------------------------------------------------- Quick index */}
      <div className="border-b border-ink-100 bg-ink-50/60">
        <Section className="py-8 sm:py-10">
          <RevealGroup className="flex flex-wrap gap-2.5">
            {services.map((s) => (
              <RevealItem key={s.slug}>
                <Link
                  href={`#${s.slug}`}
                  className="inline-flex rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-600 transition-colors hover:border-brand-500 hover:text-brand-600"
                >
                  {s.title}
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </Section>
      </div>

      {/* ----------------------------------------------------- Service detail */}
      <Section className="pb-10">
        <div className="space-y-6">
          {services.map((service, index) => (
            <Reveal key={service.slug}>
              <article
                id={service.slug}
                className="scroll-mt-28 overflow-hidden rounded-3xl border border-ink-100 bg-white p-7 sm:p-10"
              >
                <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
                  <div className={index % 2 === 1 ? "lg:order-2" : undefined}>
                    <Media
                      illustration={service.illustration}
                      src={service.image}
                      alt={service.title}
                      ratio="aspect-[16/10]"
                      sizes="(min-width: 1024px) 44vw, 100vw"
                      className="ring-1 ring-ink-100"
                    />

                    <div className="mt-8 flex items-center gap-4">
                      <span className="font-mono text-sm font-bold text-brand-300">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="h-px flex-1 bg-ink-100" />
                    </div>

                    <h2 className="mt-5 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                      {service.title}
                    </h2>
                    <p className="mt-4 text-base leading-relaxed text-ink-600">
                      {service.description}
                    </p>

                    <ButtonLink
                      href="/request-a-quote"
                      variant="outline"
                      className="mt-8"
                    >
                      Enquire About This Service
                      <ArrowRight />
                    </ButtonLink>
                  </div>

                  <div
                    className={`self-start rounded-3xl bg-ink-50/70 p-7 sm:p-8 ${
                      index % 2 === 1 ? "lg:order-1" : ""
                    }`}
                  >
                    <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
                      Scope includes
                    </h3>
                    <ul className="mt-6 space-y-4">
                      {service.scope.map((point) => (
                        <li
                          key={point}
                          className="flex gap-3.5 text-sm leading-relaxed text-ink-700"
                        >
                          <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------ Process */}
      <div className="bg-ink-900">
        <Section>
          <SectionHeading
            tone="light"
            eyebrow="How we work"
            title="Six stages, no surprises"
            align="center"
          />
          <RevealGroup
            as="ol"
            className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {processSteps.map((p) => (
              <RevealItem key={p.step} as="li">
                <div className="h-full rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                  <span className="font-mono text-2xl font-bold text-brand-400">
                    {p.step}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-white">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {p.description}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Section>
      </div>

      <ContactCTA
        title="Tell us what needs powering"
        body="Send a drawing, a load list or a tender document. We will come back with a technically sound scope and a straight price."
      />
    </>
  );
}
