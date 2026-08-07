import { Quote } from "@/components/ui/Icons";
import { RevealGroup, RevealItem } from "@/components/ui/Motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { testimonials } from "@/lib/site";

/** Client testimonials. */
export default function Testimonials() {
  return (
    <Section className="bg-ink-50/60">
      <SectionHeading
        eyebrow="Testimonials"
        title="What our clients say"
        align="center"
      />

      <RevealGroup className="mt-14 grid gap-6 lg:grid-cols-3">
        {testimonials.map((t) => (
          <RevealItem key={t.author + t.company}>
            <figure className="flex h-full flex-col rounded-3xl border border-ink-100 bg-white p-8">
              <Quote className="h-8 w-8 text-brand-200" />
              <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-ink-700">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-7 border-t border-ink-100 pt-5">
                <p className="text-sm font-bold text-ink-900">{t.author}</p>
                <p className="mt-0.5 text-xs text-ink-400">
                  {t.role}, {t.company}
                </p>
              </figcaption>
            </figure>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
