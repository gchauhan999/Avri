import type { Metadata } from "next";

import QuoteForm from "@/components/forms/QuoteForm";
import { ButtonLink } from "@/components/ui/Button";
import { Check, Mail, Phone } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Motion";
import PageHero from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { company, contact, telHref } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Request a Quote",
  description: `Request a detailed quotation from ${company.name} for electrical EPC, substations, HT & LT works, solar, smart metering, automation, street lighting or EV charging infrastructure.`,
  path: "/request-a-quote",
  keywords: ["request electrical quote", "solar quotation", "EPC tender enquiry"],
});

const expectations = [
  "A named engineer assigned to your enquiry",
  "Site survey arranged at no cost, within our region",
  "Item-wise BOQ with makes and ratings clearly stated",
  "Written commercial proposal, no hidden line items",
  "Indicative programme with key milestones",
];

const steps = [
  {
    step: "01",
    title: "You submit the form",
    body: "Tell us the service, site location and scope. Attach nothing yet — we will ask for drawings if we need them.",
  },
  {
    step: "02",
    title: "We review and call",
    body: "An engineer reviews the requirement and calls to fill in the gaps, usually within one working day.",
  },
  {
    step: "03",
    title: "Survey, if needed",
    body: "For anything beyond straightforward supply, we visit the site and take our own measurements.",
  },
  {
    step: "04",
    title: "You receive the proposal",
    body: "A costed technical proposal with BOQ, scope boundaries and programme — typically within two working days.",
  },
];

/**
 * Prerendered to static HTML, so `?product=<slug>` cannot be read here — the
 * form reads it in the browser and pre-fills itself.
 */
export default function RequestQuotePage() {
  return (
    <>
      <PageHero
        breadcrumb="Request a Quote"
        eyebrow="Request a quote"
        title="Get a costed technical proposal"
        lead="Tell us what you are building. You will get a proper engineering response — not a templated price list."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          {/* Form */}
          <Reveal>
            <div className="rounded-3xl border border-ink-100 bg-white p-7 sm:p-10">
              <h2 className="text-xl font-bold text-ink-900">
                Project enquiry
              </h2>
              <p className="mt-2 text-sm text-ink-500">
                Fields marked <span className="text-accent-600">*</span> are
                required.
              </p>
              <div className="mt-8">
                <QuoteForm />
              </div>
            </div>
          </Reveal>

          {/* Side rail */}
          <Reveal preset="right">
            <div className="rounded-3xl bg-ink-900 p-8 text-white">
              <h2 className="text-lg font-bold">What you can expect</h2>
              <ul className="mt-6 space-y-3.5">
                {expectations.map((e) => (
                  <li key={e} className="flex gap-3 text-sm text-white/80">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/25 text-brand-300">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {e}
                  </li>
                ))}
              </ul>

              <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
                <a
                  href={telHref(contact.phones[0])}
                  className="flex items-center gap-3 text-sm font-semibold transition-colors hover:text-brand-300"
                >
                  <Phone className="h-4 w-4 text-brand-400" />
                  {contact.phones[0]}
                </a>
                <a
                  href={`mailto:${contact.salesEmail}`}
                  className="flex items-center gap-3 break-all text-sm font-semibold transition-colors hover:text-brand-300"
                >
                  <Mail className="h-4 w-4 text-brand-400" />
                  {contact.salesEmail}
                </a>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-ink-100 bg-ink-50/60 p-8">
              <h2 className="text-lg font-bold text-ink-900">
                Already have a tender or BOQ?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                Email the document directly and we will return an item-wise
                quotation against your specification.
              </p>
              <ButtonLink
                href={`mailto:${contact.salesEmail}`}
                variant="outline"
                className="mt-5"
              >
                Email Your Documents
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* ------------------------------------------------------- How it works */}
      <div className="bg-ink-50/60">
        <Section>
          <SectionHeading
            eyebrow="How it works"
            title="From enquiry to proposal in four steps"
            align="center"
          />
          <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <li key={s.step}>
                <Reveal>
                  <div className="h-full rounded-3xl border border-ink-100 bg-white p-7">
                    <span className="font-mono text-2xl font-bold text-brand-200">
                      {s.step}
                    </span>
                    <h3 className="mt-4 text-base font-bold text-ink-900">
                      {s.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-500">
                      {s.body}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </Section>
      </div>
    </>
  );
}
