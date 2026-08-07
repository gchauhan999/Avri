import type { Metadata } from "next";
import Certifications from "@/components/sections/Certifications";
import ContactCTA from "@/components/sections/ContactCTA";
import Testimonials from "@/components/sections/Testimonials";
import ClientLogo from "@/components/ui/ClientLogo";
import { RevealGroup, RevealItem } from "@/components/ui/Motion";
import PageHero from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { getClients } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { company } from "@/lib/site";

/**
 * Flat `/clients` rather than `/about/clients`: every other About Us child is
 * already top-level (`/industries`, `/projects`, `/gallery`), and the navbar's
 * `isActivePath` matches on subtree, so a nested route would highlight two
 * links at once.
 */
export const metadata: Metadata = pageMetadata({
  title: "Clients",
  description: `Utilities, government bodies and industrial customers ${company.name} delivers for across India.`,
  path: "/clients",
  keywords: ["Avri Energy clients", "electrical EPC clients India", "utility contractor clients"],
});

/** Refreshed on publish via `/api/revalidate`; this is only the fallback. */
export const revalidate = 300;

export default async function ClientsPage() {
  const clients = await getClients();

  const trail = breadcrumbJsonLd([
    { label: "About Us", path: "/about" },
    { label: "Clients", path: "/clients" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(trail) }}
      />

      <PageHero
        breadcrumb={[{ label: "About Us", href: "/about" }, { label: "Clients" }]}
        eyebrow="Clients"
        title="Who we work for"
        lead="State utilities, municipal bodies, industrial plants and infrastructure developers — the organisations that trust us to keep the power on."
      />

      <Section>
        <SectionHeading
          eyebrow="Our customers"
          title="Long-term relationships, repeat work"
          lead="Most of our work comes from customers we have already delivered for. These are the organisations who have agreed to be named."
        />

        {clients.length === 0 ? (
          /**
           * The expected state on day one. A logo only appears once someone has
           * confirmed written permission in the admin panel, so an empty page
           * here means the process is working, not that something is broken.
           */
          <div className="mt-12 rounded-3xl border border-dashed border-ink-200 bg-ink-50/60 px-6 py-16 text-center">
            <p className="text-base font-semibold text-ink-800">Client list coming soon</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
              We only publish a client&rsquo;s name or logo once they have given us permission in
              writing. This page will fill out as those confirmations come in.
            </p>
          </div>
        ) : (
          <RevealGroup className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {clients.map((client) => (
              <RevealItem key={client.id}>
                <ClientLogo client={client} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}

        {clients.length > 0 ? (
          <p className="mt-10 text-center text-xs text-ink-400">
            Logos are shown with each organisation&rsquo;s permission and remain their property.
          </p>
        ) : null}
      </Section>

      <Certifications />
      <Testimonials />

      <ContactCTA
        title="Want to speak to a reference?"
        body="We can put you in touch with a customer running work comparable to yours."
      />
    </>
  );
}
