import Image from "next/image";
import { RevealGroup, RevealItem } from "@/components/ui/Motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { clients } from "@/lib/site";

/**
 * Client strip. Each entry renders its logo when one is supplied in
 * `lib/site.ts` (e.g. "/assets/clients/utility.png"), and a clean wordmark
 * plate otherwise.
 */
export default function Clients() {
  return (
    <Section className="border-y border-ink-100 bg-ink-50/60">
      <SectionHeading
        eyebrow="Clients"
        title="Trusted by utilities, government bodies and industry"
        align="center"
      />

      <RevealGroup className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {clients.map((client) => (
          <RevealItem key={client.name}>
            <div className="flex h-24 items-center justify-center rounded-2xl border border-ink-100 bg-white px-6 transition-colors hover:border-brand-200">
              {client.logo ? (
                <Image
                  src={client.logo}
                  alt={client.name}
                  width={200}
                  height={80}
                  loading="lazy"
                  className="max-h-12 w-auto object-contain opacity-70 transition-opacity hover:opacity-100"
                />
              ) : (
                <span className="text-center text-sm font-semibold uppercase tracking-wide text-ink-400">
                  {client.name}
                </span>
              )}
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

      <p className="mt-8 text-center text-xs text-ink-400">
        Client names are indicative. Add real logos to{" "}
        <code className="rounded bg-white px-1.5 py-0.5">
          public/assets/clients/
        </code>{" "}
        and reference them in <code className="rounded bg-white px-1.5 py-0.5">lib/site.ts</code>.
      </p>
    </Section>
  );
}
