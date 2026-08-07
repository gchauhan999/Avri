import type { Metadata } from "next";

import Certifications from "@/components/sections/Certifications";
import ContactCTA from "@/components/sections/ContactCTA";
import Testimonials from "@/components/sections/Testimonials";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import { Check } from "@/components/ui/Icons";
import Media from "@/components/ui/Media";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Motion";
import PageHero from "@/components/ui/PageHero";
import { Eyebrow, Section, SectionHeading } from "@/components/ui/Section";
import { company, processSteps, stats } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description: `${company.name} is an electrical EPC and renewable energy company delivering substations, HT & LT works, solar plants, smart metering and EV charging infrastructure with in-house engineering and execution teams.`,
  path: "/about",
  keywords: ["about Avri Energy", "electrical EPC company profile"],
});

const capabilities = [
  "In-house design and drafting team",
  "Directly employed installation crews",
  "Panel assembly and pre-dispatch testing",
  "Calibrated test instruments and thermography",
  "Utility liaison and statutory approvals",
  "Dedicated post-commissioning service desk",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        breadcrumb="About Us"
        eyebrow="Who we are"
        title="An engineering-led electrical EPC and renewable energy company"
        lead={`${company.name} exists for a simple reason — too many electrical installations are built to pass inspection, not to last. We build the other kind.`}
      />

      {/* --------------------------------------------------------- Our story */}
      <Section>
        <div className="grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Our story"
              title="Built on site, not in a brochure"
            />
            <Reveal delay={0.08}>
              <div className="mt-8 space-y-5 text-base leading-relaxed text-ink-600">
                <p>
                  {company.name} began as an electrical contracting outfit
                  serving the industrial belt around Modinagar and Ghaziabad.
                  Our first customers were plant owners tired of tripping
                  panels, overheating cables, and contractors who disappeared
                  after the final payment.
                </p>
                <p>
                  We grew by doing the unglamorous things properly — correct
                  cable sizing, honest earthing, protection settings that were
                  genuinely calculated, and a phone that gets answered when
                  something fails at two in the morning. Word travelled, and so
                  did we: from wiring and panels into transformers, substations,
                  automation and, as the economics turned, into solar and EV
                  infrastructure.
                </p>
                <p>
                  Today we deliver turnkey EPC packages for utilities,
                  government departments, industry and infrastructure
                  developers. The engineering discipline has not changed — only
                  the size of the systems it is applied to.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal preset="right">
            <div className="rounded-3xl border border-ink-100 bg-ink-50/60 p-8">
              <Eyebrow>By the numbers</Eyebrow>
              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="text-3xl font-bold text-ink-900">
                      {s.value}
                    </dt>
                    <dd className="mt-1.5 text-sm leading-snug text-ink-500">
                      {s.label}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-8 border-t border-ink-200 pt-6 text-sm italic leading-relaxed text-ink-600">
                “{company.tagline}” is not a slogan we picked for a logo. It is
                the only thing our clients actually buy from us.
              </p>
            </div>

            <Media
              illustration="substation"
              alt={`${company.name} substation project`}
              ratio="aspect-[16/10]"
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="mt-6 ring-1 ring-ink-100"
            />
          </Reveal>
        </div>
      </Section>

      {/* ------------------------------------------------- Mission and vision */}
      <div className="bg-ink-900">
        <Section>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal preset="left">
              <Eyebrow tone="light">Our mission</Eyebrow>
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Make dependable power ordinary
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/70">
                To deliver electrical and renewable energy systems that are
                correctly engineered, properly installed and genuinely
                supported — so our clients can stop thinking about their power
                supply and get on with their business.
              </p>
            </Reveal>
            <Reveal preset="right">
              <Eyebrow tone="light">Our vision</Eyebrow>
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                India&apos;s most trusted energy infrastructure partner
              </h2>
              <p className="mt-5 text-base leading-relaxed text-white/70">
                To be the first call for electrical infrastructure across the
                regions we serve, and to move a meaningful share of that demand
                onto clean, self-generated energy along the way.
              </p>
            </Reveal>
          </div>
        </Section>
      </div>

      {/* ----------------------------------------------------- Capabilities */}
      <Section>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="Capabilities"
              title="What we bring to a project"
              lead="Enough capability in-house that your programme does not depend on somebody else's."
            />
            <Reveal delay={0.1}>
              <Media
                illustration="automation"
                alt="Panel assembly and testing"
                ratio="aspect-[16/10]"
                sizes="(min-width: 1024px) 44vw, 100vw"
                className="mt-10 ring-1 ring-ink-100"
              />
            </Reveal>
          </div>

          <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:content-start">
            {capabilities.map((c) => (
              <RevealItem key={c}>
                <div className="flex items-start gap-3.5 rounded-2xl border border-ink-100 bg-white px-5 py-4 text-sm font-medium text-ink-800">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {c}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Section>

      {/* ------------------------------------------------------------ Process */}
      <div className="bg-ink-50/60">
        <Section>
          <SectionHeading
            eyebrow="How we work"
            title="Six stages, no surprises"
            lead="The same disciplined sequence on a ten-lakh contract and a ten-crore one."
            align="center"
          />
          <RevealGroup
            as="ol"
            className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {processSteps.map((p) => (
              <RevealItem key={p.step} as="li">
                <div className="h-full rounded-3xl border border-ink-100 bg-white p-7">
                  <span className="font-mono text-2xl font-bold text-brand-200">
                    {p.step}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-ink-900">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-500">
                    {p.description}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Section>
      </div>

      <WhyChooseUs />
      <Certifications />
      <Testimonials />
      <ContactCTA />
    </>
  );
}
