import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight } from "@/components/ui/Icons";
import Media from "@/components/ui/Media";
import { HoverLift, RevealGroup, RevealItem } from "@/components/ui/Motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { services } from "@/lib/site";

/**
 * Grid of service cards. Reused on the home page (trimmed) and anywhere else a
 * service overview is needed.
 */
export default function ServicesGrid({
  limit,
  showViewAll = true,
  eyebrow = "What we do",
  title = "Complete electrical & energy services",
  lead = "Thirteen service lines covering everything between the incoming supply and the last light fitting — delivered by one accountable team.",
}: {
  limit?: number;
  showViewAll?: boolean;
  eyebrow?: string;
  title?: string;
  lead?: string;
}) {
  const items = limit ? services.slice(0, limit) : services;

  return (
    <Section className="bg-ink-50/60">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading eyebrow={eyebrow} title={title} lead={lead} />
        {showViewAll ? (
          <ButtonLink href="/services" variant="outline" className="shrink-0">
            All Services
            <ArrowRight />
          </ButtonLink>
        ) : null}
      </div>

      <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((service) => (
          <RevealItem key={service.slug}>
            <HoverLift className="h-full">
              <Link
                href={`/services#${service.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white transition-colors hover:border-brand-200 hover:shadow-xl hover:shadow-ink-900/5"
              >
                <Media
                  illustration={service.illustration}
                  src={service.image}
                  alt={service.title}
                  ratio="aspect-[16/9]"
                  rounded="rounded-none"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />

                <div className="flex flex-1 flex-col p-7">
                  <h3 className="text-lg font-bold text-ink-900 transition-colors group-hover:text-brand-600">
                    {service.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">
                    {service.summary}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-600">
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </HoverLift>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
