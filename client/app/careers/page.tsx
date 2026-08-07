import type { Metadata } from "next";
import CareersExplorer from "@/components/sections/CareersExplorer";
import ContactCTA from "@/components/sections/ContactCTA";
import { ButtonLink } from "@/components/ui/Button";
import { Check } from "@/components/ui/Icons";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Motion";
import PageHero from "@/components/ui/PageHero";
import { Eyebrow, Section, SectionHeading } from "@/components/ui/Section";
import { getJobs } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { careerBenefits, careerValues, company, contact, hiringSteps } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Careers",
  description: `Join ${company.name} — electrical EPC, substations, smart metering, solar and EV charging. Current openings and how to apply.`,
  path: "/careers",
  keywords: [
    "Avri Energy careers",
    "electrical engineer jobs India",
    "site engineer jobs Ghaziabad",
    "EPC jobs",
  ],
});

export const revalidate = 300;

export default async function CareersPage() {
  const jobs = await getJobs();

  const trail = breadcrumbJsonLd([
    { label: "About Us", path: "/about" },
    { label: "Careers", path: "/careers" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(trail) }}
      />

      <PageHero
        breadcrumb={[{ label: "About Us", href: "/about" }, { label: "Careers" }]}
        eyebrow="Careers"
        title="Build the grid, not just a CV"
        lead="Substations, smart metering, solar and EV charging — real sites, real responsibility, and engineers who will teach you properly."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="#openings">
            {jobs.length > 0
              ? `See ${jobs.length} open ${jobs.length === 1 ? "role" : "roles"}`
              : "See open roles"}
          </ButtonLink>
          <ButtonLink href="/careers/apply" variant="ghostLight">
            Send your CV
          </ButtonLink>
        </div>
      </PageHero>

      <Section>
        <SectionHeading
          eyebrow="Why us"
          title="What you get working here"
          lead="We are an engineering company, not a body shop. That shows up in what you do day to day."
        />

        <RevealGroup className="mt-12 grid gap-6 md:grid-cols-3">
          {careerValues.map((value, index) => (
            <RevealItem key={value.title}>
              <div className="h-full rounded-3xl border border-ink-100 bg-white p-7">
                <span className="font-mono text-xs font-semibold text-brand-500">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-lg font-bold tracking-tight text-ink-900">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{value.description}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <div className="bg-ink-900">
        <Section>
          <Eyebrow tone="light">Benefits</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            The practical side
          </h2>

          <RevealGroup className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {careerBenefits.map((benefit) => (
              <RevealItem key={benefit}>
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
                  <span className="text-sm text-white/80">{benefit}</span>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Section>
      </div>

      <Section id="openings">
        <SectionHeading
          eyebrow="Open roles"
          title="Current openings"
          lead="Every role below is live. Applications go straight to our HR team."
        />

        <Reveal className="mt-10">
          <CareersExplorer jobs={jobs} />
        </Reveal>
      </Section>

      <div className="border-y border-ink-100 bg-ink-50/60">
        <Section>
          <SectionHeading
            eyebrow="Process"
            title="How hiring works here"
            lead="No ghosting. If we are not going ahead, we will tell you."
          />

          <RevealGroup
            as="ol"
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {hiringSteps.map((step) => (
              <RevealItem as="li" key={step.step}>
                <div className="h-full rounded-3xl border border-ink-100 bg-white p-7">
                  <span className="font-mono text-xs font-semibold text-accent-600">
                    {step.step}
                  </span>
                  <h3 className="mt-3 text-base font-bold text-ink-900">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.description}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <p className="mt-10 text-center text-sm text-ink-500">
            Questions before applying? Write to{" "}
            <a
              href={`mailto:${contact.careersEmail}`}
              className="font-semibold text-brand-600 hover:underline"
            >
              {contact.careersEmail}
            </a>
            .
          </p>
        </Section>
      </div>

      <ContactCTA
        title="Not seeing your role?"
        body="Send your CV anyway. We hire through the year and keep good profiles on file."
      />
    </>
  );
}
