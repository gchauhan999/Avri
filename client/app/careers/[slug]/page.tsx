import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ApplicationForm from "@/components/forms/ApplicationForm";
import ContactCTA from "@/components/sections/ContactCTA";
import { ButtonLink } from "@/components/ui/Button";
import { Check } from "@/components/ui/Icons";
import JobCard from "@/components/ui/JobCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Motion";
import PageHero from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { employmentLabel, experienceLabel, formatDate } from "@/lib/careers";
import { getJob, getJobs } from "@/lib/content";
import { breadcrumbJsonLd, jobPostingJsonLd, pageMetadata } from "@/lib/seo";
import { company, contact } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

/**
 * No `generateStaticParams` and no `dynamicParams = false`, unlike
 * `/products/[slug]`. Openings live in the database and change without a
 * deploy, so any slug renders on demand and ISR caches the result. Publishing
 * a role in the admin panel calls `/api/revalidate`, so it is live at once.
 */
export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return { title: "Position not found" };

  return pageMetadata({
    title: job.seoTitle ?? `${job.title} — ${job.location}`,
    description: job.seoDescription ?? job.summary,
    path: `/careers/${job.slug}`,
    keywords: [
      job.title.toLowerCase(),
      ...(job.department ? [`${job.department.toLowerCase()} jobs`] : []),
      `electrical jobs ${job.location}`,
    ],
  });
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const job = await getJob(slug);

  /**
   * A closed or expired role 404s rather than rendering. Leaving expired
   * JobPosting markup live gets a site demoted in Google Jobs, and it wastes
   * the time of anyone who lands on it from an old link.
   */
  if (!job) notFound();

  const others = (await getJobs()).filter((other) => other.slug !== job.slug).slice(0, 3);

  const facts: { label: string; value: string }[] = [
    ...(job.department ? [{ label: "Department", value: job.department }] : []),
    { label: "Location", value: job.location },
    { label: "Type", value: employmentLabel(job.employmentType) },
    ...(experienceLabel(job) ? [{ label: "Experience", value: experienceLabel(job) }] : []),
    ...(job.openings > 1 ? [{ label: "Openings", value: String(job.openings) }] : []),
    ...(job.salaryRange ? [{ label: "Salary", value: job.salaryRange }] : []),
    ...(job.publishedAt ? [{ label: "Posted", value: formatDate(job.publishedAt) }] : []),
    ...(job.closesAt ? [{ label: "Applications close", value: formatDate(job.closesAt) }] : []),
  ];

  const schema = [
    jobPostingJsonLd(job),
    breadcrumbJsonLd([
      { label: "About Us", path: "/about" },
      { label: "Careers", path: "/careers" },
      { label: job.title, path: `/careers/${job.slug}` },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <PageHero
        breadcrumb={[
          { label: "About Us", href: "/about" },
          { label: "Careers", href: "/careers" },
          { label: job.title },
        ]}
        eyebrow={job.department ?? "Open role"}
        title={job.title}
        lead={job.summary}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="#apply">Apply now</ButtonLink>
          <ButtonLink href="/careers" variant="ghostLight">
            All openings
          </ButtonLink>
        </div>
      </PageHero>

      <Section>
        <div className="grid gap-12 lg:grid-cols-[18rem_1fr]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border border-ink-100 bg-ink-50/60 p-7">
              <dl className="space-y-4">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-xs uppercase tracking-wide text-ink-400">{fact.label}</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-ink-900">{fact.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-7">
                <ButtonLink href="#apply" className="w-full">
                  Apply for this role
                </ButtonLink>
              </div>

              <p className="mt-4 text-center text-xs text-ink-400">
                or email{" "}
                <a
                  href={`mailto:${contact.careersEmail}?subject=${encodeURIComponent(job.title)}`}
                  className="font-semibold hover:text-brand-600"
                >
                  {contact.careersEmail}
                </a>
              </p>
            </div>
          </aside>

          <div>
            <Reveal>
              <h2 className="text-2xl font-bold tracking-tight text-ink-900">About the role</h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-ink-600">
                {job.description.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </Reveal>

            {job.responsibilities?.length ? (
              <Reveal delay={0.06} className="mt-10">
                <h2 className="text-xl font-bold tracking-tight text-ink-900">
                  What you&rsquo;ll do
                </h2>
                <ul className="mt-4 space-y-3">
                  {job.responsibilities.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                      <span className="text-sm leading-relaxed text-ink-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}

            {job.requirements?.length ? (
              <Reveal delay={0.1} className="mt-10">
                <h2 className="text-xl font-bold tracking-tight text-ink-900">
                  What we&rsquo;re looking for
                </h2>
                <ul className="mt-4 space-y-3">
                  {job.requirements.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" />
                      <span className="text-sm leading-relaxed text-ink-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}

            <Reveal delay={0.14} className="mt-10">
              <div className="rounded-3xl bg-ink-900 p-8">
                <p className="text-sm leading-relaxed text-white/75">
                  Not sure you tick every box? Apply anyway. {company.name} has taken on plenty of
                  engineers who were short on one requirement and strong everywhere else.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      <div id="apply" className="scroll-mt-28 border-y border-ink-100 bg-ink-50/60">
        <Section>
          <div className="mx-auto max-w-3xl">
            <SectionHeading
              eyebrow="Apply"
              title={`Apply for ${job.title}`}
              lead="Takes two minutes. Attach your CV as a PDF or Word document."
              align="center"
            />
            <div className="mt-10 rounded-3xl border border-ink-100 bg-white p-7 sm:p-10">
              <ApplicationForm job={job} />
            </div>
          </div>
        </Section>
      </div>

      {others.length > 0 ? (
        <Section>
          <SectionHeading eyebrow="Also hiring" title="Other open roles" />
          <RevealGroup className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((other) => (
              <RevealItem key={other.id}>
                <JobCard job={other} />
              </RevealItem>
            ))}
          </RevealGroup>
        </Section>
      ) : null}

      <ContactCTA
        title="Questions about this role?"
        body="Call us or write to our HR team — we would rather answer than have you guess."
      />
    </>
  );
}
