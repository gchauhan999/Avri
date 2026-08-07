import { RevealGroup, RevealItem } from "@/components/ui/Motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { certifications } from "@/lib/site";

/** Certifications and registrations. */
export default function Certifications() {
  return (
    <Section>
      <SectionHeading
        eyebrow="Certifications"
        title="Accredited, licensed and compliant"
        lead="The approvals and management systems that let us bid, execute and invoice on institutional contracts."
        align="center"
      />

      <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((cert) => (
          <RevealItem key={cert.code}>
            <div className="flex h-full gap-5 rounded-3xl border border-ink-100 bg-white p-7 transition-colors hover:border-accent-200">
              <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-50 text-center text-[11px] font-bold leading-tight text-accent-700">
                {cert.code}
              </span>
              <div>
                <h3 className="text-base font-bold text-ink-900">
                  {cert.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500">
                  {cert.description}
                </p>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      <p className="mt-8 text-center text-xs text-ink-400">
        Placeholder list — replace with your actual certificate numbers and
        validity dates in <code className="rounded bg-ink-50 px-1.5 py-0.5">lib/site.ts</code>.
      </p>
    </Section>
  );
}
