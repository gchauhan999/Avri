import { Clock, Mail, Phone, Pin } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { company, contact, telHref } from "@/lib/site";

/**
 * Google Map embed plus the office details beside it.
 * The map URL comes from NEXT_PUBLIC_GOOGLE_MAP; if it is unset the map is
 * skipped rather than rendering an empty frame.
 */
export default function MapSection({
  heading = true,
}: {
  heading?: boolean;
}) {
  return (
    <Section>
      {heading ? (
        <SectionHeading
          eyebrow="Find us"
          title="Visit our office"
          lead="We are based in Modinagar, Ghaziabad and work across Delhi NCR and West Uttar Pradesh."
        />
      ) : null}

      <div className={`grid gap-8 lg:grid-cols-[1.6fr_1fr] ${heading ? "mt-12" : ""}`}>
        <Reveal preset="left">
          {contact.googleMap ? (
            <div className="overflow-hidden rounded-3xl border border-ink-100">
              <iframe
                src={contact.googleMap}
                title={`${company.name} office location`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[420px] w-full border-0"
              />
            </div>
          ) : (
            <div className="flex h-[420px] items-center justify-center rounded-3xl border border-dashed border-ink-200 bg-ink-50 text-sm text-ink-400">
              Set NEXT_PUBLIC_GOOGLE_MAP in .env to show the map.
            </div>
          )}
        </Reveal>

        <Reveal preset="right">
          <div className="flex h-full flex-col gap-6 rounded-3xl border border-ink-100 bg-white p-8">
            <div className="flex gap-4">
              <Pin className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
              <div>
                <h3 className="text-sm font-bold text-ink-900">Office</h3>
                <address className="mt-1.5 not-italic text-sm leading-relaxed text-ink-500">
                  {contact.addressLines.map((l) => (
                    <span key={l} className="block">
                      {l}
                    </span>
                  ))}
                </address>
              </div>
            </div>

            <div className="flex gap-4">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
              <div>
                <h3 className="text-sm font-bold text-ink-900">Phone</h3>
                <div className="mt-1.5 flex flex-col gap-1 text-sm text-ink-500">
                  {contact.phones.map((p) => (
                    <a key={p} href={telHref(p)} className="transition-colors hover:text-brand-600">
                      {p}
                    </a>
                  ))}
                  {contact.landline ? (
                    <a
                      href={telHref(contact.landline)}
                      className="transition-colors hover:text-brand-600"
                    >
                      {contact.landline}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
              <div>
                <h3 className="text-sm font-bold text-ink-900">Email</h3>
                <a
                  href={`mailto:${contact.email}`}
                  className="mt-1.5 block break-all text-sm text-ink-500 transition-colors hover:text-brand-600"
                >
                  {contact.email}
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
              <div>
                <h3 className="text-sm font-bold text-ink-900">Office hours</h3>
                <div className="mt-1.5 flex flex-col gap-1 text-sm text-ink-500">
                  {contact.hours.map((h) => (
                    <span key={h}>{h}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
