import { ArrowRight } from "@/components/ui/Icons";
import { ButtonLink } from "@/components/ui/Button";
import ClientLogo from "@/components/ui/ClientLogo";
import { RevealGroup, RevealItem } from "@/components/ui/Motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { getClients } from "@/lib/content";

/**
 * Client strip.
 *
 * Fetches its own data, in the same spirit as `<ServicesGrid limit={6} />` on
 * the home page — a sync server parent can render an async server child, so
 * `app/page.tsx` needs no change.
 *
 * Only clients that are both authorised and published come back from the API.
 * Until someone has entered a real one with written permission, this renders
 * nothing at all rather than a heading above an empty grid.
 */
export default async function Clients({
  limit,
  showAll = false,
}: {
  limit?: number;
  /** Adds a "view all" link when there are more than `limit`. */
  showAll?: boolean;
}) {
  const clients = await getClients();
  if (clients.length === 0) return null;

  const shown = limit ? clients.slice(0, limit) : clients;

  return (
    <Section className="border-y border-ink-100 bg-ink-50/60">
      <SectionHeading
        eyebrow="Clients"
        title="Trusted by utilities, government bodies and industry"
        align="center"
      />

      <RevealGroup className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((client) => (
          <RevealItem key={client.id}>
            <ClientLogo client={client} />
          </RevealItem>
        ))}
      </RevealGroup>

      {showAll && clients.length > shown.length ? (
        <div className="mt-10 text-center">
          <ButtonLink href="/clients" variant="outline">
            View all clients
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      ) : null}
    </Section>
  );
}
