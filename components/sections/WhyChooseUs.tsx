import { RevealGroup, RevealItem } from "@/components/ui/Motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { whyChooseUs } from "@/lib/site";

/** "Why Choose Us" feature grid. */
export default function WhyChooseUs() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Why choose us"
        title="Trusted where downtime is expensive"
        lead="Utilities, government departments and industrial clients keep coming back for the same reasons."
        align="center"
      />

      <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {whyChooseUs.map((item, i) => (
          <RevealItem key={item.title}>
            <div className="group h-full rounded-3xl border border-ink-100 bg-white p-8 transition-colors hover:border-brand-200">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 font-mono text-sm font-bold text-brand-600 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 text-lg font-bold text-ink-900">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                {item.description}
              </p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
