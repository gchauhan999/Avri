import type { Metadata } from "next";

import ContactForm from "@/components/forms/ContactForm";
import MapSection from "@/components/sections/MapSection";
import { ButtonLink } from "@/components/ui/Button";
import { Clock, Mail, Phone, Pin, WhatsApp } from "@/components/ui/Icons";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Motion";
import PageHero from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { company, contact, faqs, keyContacts, telHref, whatsappHref } from "@/lib/site";
import { localBusinessJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description: `Contact ${company.name} — ${contact.address}. Call ${contact.phones[0]}, email ${contact.email}, or send your requirement online.`,
  path: "/contact",
  keywords: ["contact electrical contractor", "electrical company Ghaziabad"],
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <PageHero
        breadcrumb="Contact"
        eyebrow="Get in touch"
        title="Let us talk about your requirement"
        lead="Call, write, or send the form below. A member of our engineering team — not a call centre — will get back to you."
      />

      {/* ------------------------------------------------------ Contact cards */}
      <Section className="pb-0">
        <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <RevealItem>
            <div className="h-full rounded-3xl border border-ink-100 bg-white p-7">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Pin />
              </span>
              <h2 className="mt-5 text-sm font-bold text-ink-900">Visit us</h2>
              <address className="mt-2.5 not-italic text-sm leading-relaxed text-ink-500">
                {contact.addressLines.map((l) => (
                  <span key={l} className="block">
                    {l}
                  </span>
                ))}
              </address>
            </div>
          </RevealItem>

          <RevealItem>
            <div className="h-full rounded-3xl border border-ink-100 bg-white p-7">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Phone />
              </span>
              <h2 className="mt-5 text-sm font-bold text-ink-900">Call us</h2>
              <div className="mt-2.5 flex flex-col gap-1.5 text-sm text-ink-500">
                {contact.phones.map((p) => (
                  <a
                    key={p}
                    href={telHref(p)}
                    className="font-semibold text-ink-800 transition-colors hover:text-brand-600"
                  >
                    {p}
                  </a>
                ))}
                {contact.landline ? (
                  <a
                    href={telHref(contact.landline)}
                    className="transition-colors hover:text-brand-600"
                  >
                    {contact.landline} <span className="text-ink-300">(landline)</span>
                  </a>
                ) : null}
              </div>
            </div>
          </RevealItem>

          <RevealItem>
            <div className="h-full rounded-3xl border border-ink-100 bg-white p-7">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Mail />
              </span>
              <h2 className="mt-5 text-sm font-bold text-ink-900">Write to us</h2>
              <div className="mt-2.5 flex flex-col gap-1.5 text-sm text-ink-500">
                <a
                  href={`mailto:${contact.email}`}
                  className="break-all font-semibold text-ink-800 transition-colors hover:text-brand-600"
                >
                  {contact.email}
                </a>
                <a
                  href={`mailto:${contact.salesEmail}`}
                  className="break-all transition-colors hover:text-brand-600"
                >
                  {contact.salesEmail}
                </a>
              </div>

              {keyContacts.length > 0 ? (
                <div className="mt-6 border-t border-ink-100 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
                    Or write directly to
                  </p>
                  <ul className="mt-3 flex flex-col gap-3 text-sm">
                    {keyContacts.map((person) => (
                      <li key={person.email}>
                        <span className="block font-semibold text-ink-800">
                          {person.name}
                          {person.role ? (
                            <span className="ml-1.5 font-normal text-ink-400">
                              — {person.role}
                            </span>
                          ) : null}
                        </span>
                        <a
                          href={`mailto:${person.email}`}
                          className="break-all text-ink-500 transition-colors hover:text-brand-600"
                        >
                          {person.email}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </RevealItem>

          <RevealItem>
            <div className="h-full rounded-3xl border border-ink-100 bg-white p-7">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Clock />
              </span>
              <h2 className="mt-5 text-sm font-bold text-ink-900">
                Office hours
              </h2>
              <div className="mt-2.5 flex flex-col gap-1.5 text-sm text-ink-500">
                {contact.hours.map((h) => (
                  <span key={h}>{h}</span>
                ))}
              </div>
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                >
                  <WhatsApp className="h-4 w-4" />
                  WhatsApp
                </a>
              ) : null}
            </div>
          </RevealItem>
        </RevealGroup>
      </Section>

      {/* --------------------------------------------------------------- Form */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="Enquiry form"
              title="Tell us what you need"
              lead="The more you share about load, site and timeline, the more useful our first response will be."
            />
            <Reveal delay={0.1} className="mt-10">
              <ContactForm />
            </Reveal>
          </div>

          <Reveal preset="right" className="lg:pt-6">
            <div className="rounded-3xl border border-ink-100 bg-ink-50/60 p-8">
              <h2 className="text-lg font-bold text-ink-900">
                Prefer to talk it through?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                For urgent breakdowns or site emergencies, call us directly
                rather than using the form — the phone is answered faster.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <ButtonLink href={telHref(contact.phones[0])} variant="dark">
                  <Phone className="h-4 w-4" />
                  {contact.phones[0]}
                </ButtonLink>
                <ButtonLink href="/request-a-quote" variant="outline">
                  Request a Detailed Quote
                </ButtonLink>
              </div>
            </div>

            {/* FAQ */}
            <div className="mt-8 rounded-3xl border border-ink-100 bg-white p-8">
              <h2 className="text-lg font-bold text-ink-900">
                Common questions
              </h2>
              <div className="mt-5 divide-y divide-ink-100">
                {faqs.map((f) => (
                  <details key={f.question} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-sm font-semibold text-ink-900">
                      {f.question}
                      <span
                        aria-hidden="true"
                        className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ink-200 text-ink-500 transition-transform group-open:rotate-45"
                      >
                        <svg viewBox="0 0 20 20" className="h-3 w-3">
                          <path
                            d="M10 4v12M4 10h12"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                    </summary>
                    <p className="mt-3 pr-10 text-sm leading-relaxed text-ink-500">
                      {f.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Section>

      <div className="bg-ink-50/60">
        <MapSection />
      </div>
    </>
  );
}
