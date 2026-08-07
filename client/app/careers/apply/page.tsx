import type { Metadata } from "next";
import ApplicationForm from "@/components/forms/ApplicationForm";
import { Check } from "@/components/ui/Icons";
import PageHero from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { getJobs } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { company, contact, hiringSteps, telHref } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Apply for a job",
  description: `Send your CV to ${company.name}. Apply for a current opening or register your interest for future roles.`,
  path: "/careers/apply",
  keywords: ["apply Avri Energy", "submit CV electrical engineer", "upload resume"],
});

export const revalidate = 300;

/**
 * The standalone apply page.
 *
 * Every open role also carries this form inline at the bottom of its own page,
 * which converts better — no navigation between reading and applying. This
 * page exists for the other case: someone who wants to be considered but has
 * not found a role that matches, and for `?job=<slug>` links from anywhere.
 */
export default async function ApplyPage() {
  const jobs = await getJobs();

  const trail = breadcrumbJsonLd([
    { label: "Careers", path: "/careers" },
    { label: "Apply", path: "/careers/apply" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(trail) }}
      />

      <PageHero
        breadcrumb={[{ label: "Careers", href: "/careers" }, { label: "Apply" }]}
        eyebrow="Apply"
        title="Send us your CV"
        lead={
          jobs.length > 0
            ? "Pick the role you are after, or apply speculatively — we keep good profiles on file."
            : "There are no openings listed right now, but we hire through the year. Send your CV and we will call you when something fits."
        }
      />

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-3xl border border-ink-100 p-7 sm:p-10">
            <ApplicationForm jobs={jobs} />
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl bg-ink-900 p-8">
              <h2 className="text-lg font-bold tracking-tight text-white">What happens next</h2>

              <ol className="mt-6 space-y-5">
                {hiringSteps.map((step) => (
                  <li key={step.step} className="flex gap-4">
                    <span className="font-mono text-xs font-semibold text-brand-400">
                      {step.step}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{step.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-white/60">
                        {step.description}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-8 border-t border-white/10 pt-6">
                <div className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
                  <p className="text-sm leading-relaxed text-white/70">
                    Your CV goes to our HR team only. We do not pass it to recruiters or third
                    parties.
                  </p>
                </div>

                <p className="mt-6 text-sm text-white/60">
                  Prefer email?{" "}
                  <a
                    href={`mailto:${contact.careersEmail}`}
                    className="font-semibold text-white hover:underline"
                  >
                    {contact.careersEmail}
                  </a>
                </p>
                {contact.phones[0] ? (
                  <p className="mt-1 text-sm text-white/60">
                    Or call{" "}
                    <a
                      href={telHref(contact.phones[0])}
                      className="font-semibold text-white hover:underline"
                    >
                      {contact.phones[0]}
                    </a>
                  </p>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </>
  );
}
