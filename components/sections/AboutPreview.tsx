import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight, Check } from "@/components/ui/Icons";
import Media from "@/components/ui/Media";
import { Reveal } from "@/components/ui/Motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { company } from "@/lib/site";

const points = [
  "Licensed electrical contractor with in-house design capability",
  "Execution teams on our own payroll, not subcontracted out",
  "Quality, safety and environment systems on every site",
  "Long-term operations and maintenance support after handover",
];

/** "About Company" block on the home page. */
export default function AboutPreview() {
  return (
    <Section>
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal preset="left">
          <Media
            illustration="team"
            alt={`${company.name} engineering team`}
            ratio="aspect-[4/3]"
            sizes="(min-width: 1024px) 46vw, 100vw"
            className="ring-1 ring-ink-100"
          />
        </Reveal>

        <div>
          <SectionHeading
            eyebrow="About the company"
            title="An engineering-led power infrastructure partner"
            lead={`${company.name} delivers electrical EPC and renewable energy projects for utilities, government departments, industry and infrastructure developers. We take a project from concept to energisation — and stay on to maintain it.`}
          />

          <Reveal delay={0.1}>
            <ul className="mt-9 space-y-4">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3.5 text-sm text-ink-700">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href="/about">
                More About Us
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/projects" variant="outline">
                See Our Projects
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
