import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight } from "@/components/ui/Icons";
import Media from "@/components/ui/Media";
import { HoverLift, RevealGroup, RevealItem } from "@/components/ui/Motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { industries } from "@/lib/site";

/** Compact grid of the sectors we serve. */
export default function IndustriesGrid({
  showViewAll = true,
}: {
  showViewAll?: boolean;
}) {
  return (
    <Section className="bg-ink-900">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          tone="light"
          eyebrow="Industries we serve"
          title="Built for the sectors that cannot afford an outage"
          lead="From utility networks and government contracts to factories, campuses and smart-city programmes."
        />
        {showViewAll ? (
          <ButtonLink href="/industries" variant="ghostLight" className="shrink-0">
            All Industries
            <ArrowRight />
          </ButtonLink>
        ) : null}
      </div>

      <RevealGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {industries.map((industry) => (
          <RevealItem key={industry.slug}>
            <HoverLift className="h-full">
              <Link
                href={`/industries#${industry.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-colors hover:border-brand-400/50 hover:bg-white/[0.08]"
              >
                <Media
                  illustration={industry.illustration}
                  src={industry.image}
                  alt={industry.title}
                  ratio="aspect-[16/10]"
                  rounded="rounded-none"
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-sm font-bold text-white">
                    {industry.title}
                  </h3>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-white/55">
                    {industry.summary}
                  </p>
                  <ArrowRight className="mt-4 h-4 w-4 text-brand-400 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </HoverLift>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
