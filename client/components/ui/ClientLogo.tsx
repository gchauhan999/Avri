import Image from "next/image";
import type { Client } from "@/lib/types";

/**
 * One client plate — logo when we have one, a wordmark otherwise.
 *
 * Extracted so the home-page strip and the full `/clients` page cannot drift
 * apart visually.
 */
export default function ClientLogo({ client }: { client: Client }) {
  const plate = (
    <div className="flex h-24 items-center justify-center rounded-2xl border border-ink-100 bg-white px-6 transition-colors hover:border-brand-200">
      {client.logo ? (
        <Image
          src={client.logo}
          alt={client.name}
          // Real dimensions come from the API, measured when the logo was
          // processed, so the box never reflows once the image loads.
          width={client.logoWidth ?? 200}
          height={client.logoHeight ?? 80}
          loading="lazy"
          className="max-h-12 w-auto object-contain opacity-70 transition-opacity hover:opacity-100"
        />
      ) : (
        <span className="text-center text-sm font-semibold uppercase tracking-wide text-ink-400">
          {client.name}
        </span>
      )}
    </div>
  );

  if (!client.website) return plate;

  return (
    <a
      href={client.website}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      aria-label={`${client.name} (opens in a new tab)`}
    >
      {plate}
    </a>
  );
}
