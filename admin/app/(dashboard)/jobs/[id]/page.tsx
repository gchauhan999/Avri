import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, apiServer } from "../../../../lib/api";
import { PageHeader } from "../../../../components/ui";
import JobForm, { type JobDetail } from "../JobForm";

type PageProps = { params: Promise<{ id: string }> };

interface JobWithSlug extends JobDetail {
  slug: string;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const job = await apiServer<JobWithSlug>(`/api/admin/jobs/${id}`);
    return { title: job.title };
  } catch {
    return { title: "Job" };
  }
}

export default async function EditJobPage({ params }: PageProps) {
  const { id } = await params;

  let job: JobWithSlug;
  try {
    job = await apiServer<JobWithSlug>(`/api/admin/jobs/${id}`);
  } catch (error) {
    // Only a real 404 is "not found"; a 500 should surface as an error.
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <>
      <PageHeader
        title={job.title}
        description={
          job.status === "open" ? "Live on the careers page." : "Not currently shown on the site."
        }
        action={
          job.status === "open" && siteUrl ? (
            <Link
              href={`${siteUrl}/careers/${job.slug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center rounded-lg border border-ink-200 bg-white px-4 text-sm font-semibold text-ink-800 hover:border-ink-300"
            >
              View on the site
            </Link>
          ) : undefined
        }
      />
      <div className="max-w-3xl">
        <JobForm job={job} />
      </div>
    </>
  );
}
