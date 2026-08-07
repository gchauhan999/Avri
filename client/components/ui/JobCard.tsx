import Link from "next/link";
import { HoverLift } from "@/components/ui/Motion";
import type { JobSummary } from "@/lib/types";
import { employmentLabel, experienceLabel, postedAgo } from "@/lib/careers";

/**
 * A role, as a card. Text-only and denser than ProjectCard — job listings have
 * no imagery, and padding it out with artwork would only push the useful
 * information below the fold.
 */
export default function JobCard({ job }: { job: JobSummary }) {
  const facts = [job.location, employmentLabel(job.employmentType), experienceLabel(job)].filter(
    Boolean
  );

  return (
    <HoverLift>
      <Link
        href={`/careers/${job.slug}`}
        className="flex h-full flex-col rounded-3xl border border-ink-100 bg-white p-6 transition-colors hover:border-brand-200"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          {job.department ? (
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              {job.department}
            </span>
          ) : (
            <span />
          )}
          {job.publishedAt ? (
            <span className="text-xs text-ink-400">{postedAgo(job.publishedAt)}</span>
          ) : null}
        </div>

        <h3 className="mt-4 text-lg font-bold tracking-tight text-ink-900">{job.title}</h3>

        <p className="mt-1.5 text-xs text-ink-400">{facts.join(" · ")}</p>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-500">{job.summary}</p>

        <p className="mt-5 text-sm font-semibold text-brand-600">
          View role &amp; apply <span aria-hidden="true">→</span>
        </p>
      </Link>
    </HoverLift>
  );
}
