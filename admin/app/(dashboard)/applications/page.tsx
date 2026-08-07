import type { Metadata } from "next";
import Link from "next/link";
import { apiServer } from "../../../lib/api";
import { EmptyState, PageHeader, TableWrap, Th } from "../../../components/ui";
import ApplicationRow from "./ApplicationRow";

export const metadata: Metadata = { title: "Applications" };

export interface Application {
  id: number;
  jobId: number | null;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string;
  currentLocation: string | null;
  experienceYears: string | null;
  currentCompany: string | null;
  noticePeriod: string | null;
  linkedinUrl: string | null;
  coverLetter: string | null;
  resumeOriginalName: string;
  resumeSizeBytes: number;
  status: "new" | "shortlisted" | "interviewing" | "rejected" | "hired";
  adminNotes: string | null;
  emailStatus: "pending" | "sent" | "failed" | "skipped";
  emailError: string | null;
  createdAt: string;
}

interface Paged {
  items: Application[];
  page: number;
  pageCount: number;
  total: number;
}

const STATUSES = ["new", "shortlisted", "interviewing", "rejected", "hired"] as const;

type PageProps = {
  searchParams: Promise<{ jobId?: string; status?: string; q?: string; page?: string }>;
};

export default async function ApplicationsPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const params = new URLSearchParams();
  for (const key of ["jobId", "status", "q", "page"] as const) {
    if (sp[key]) params.set(key, sp[key]!);
  }

  const [data, jobs] = await Promise.all([
    apiServer<Paged>(`/api/admin/applications?${params.toString()}`),
    apiServer<{ items: { id: number; title: string; count: number }[] }>(
      "/api/admin/applications/jobs"
    ),
  ]);

  const activeJob = sp.jobId ? jobs.items.find((j) => String(j.id) === sp.jobId) : undefined;

  return (
    <>
      <PageHeader
        title="Applications"
        description={
          activeJob
            ? `${data.total} for ${activeJob.title}.`
            : `${data.total} application${data.total === 1 ? "" : "s"} received.`
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link
          href="/applications"
          aria-current={!sp.status && !sp.jobId ? "page" : undefined}
          className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
            !sp.status && !sp.jobId
              ? "bg-brand-500 text-white"
              : "border border-ink-200 bg-white text-ink-600 hover:border-ink-300"
          }`}
        >
          All
        </Link>

        {STATUSES.map((status) => {
          const active = sp.status === status;
          const query = new URLSearchParams();
          if (sp.jobId) query.set("jobId", sp.jobId);
          if (!active) query.set("status", status);
          const qs = query.toString();

          return (
            <Link
              key={status}
              href={qs ? `/applications?${qs}` : "/applications"}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize transition-colors ${
                active
                  ? "bg-brand-500 text-white"
                  : "border border-ink-200 bg-white text-ink-600 hover:border-ink-300"
              }`}
            >
              {status}
            </Link>
          );
        })}

        <form action="/applications" className="ml-auto flex items-center gap-2">
          {sp.status ? <input type="hidden" name="status" value={sp.status} /> : null}

          {jobs.items.length > 0 ? (
            <select
              name="jobId"
              defaultValue={sp.jobId ?? ""}
              aria-label="Filter by role"
              className="h-9 rounded-lg border border-ink-200 bg-white px-2 text-sm focus:border-brand-500 focus:outline-none"
            >
              <option value="">All roles</option>
              {jobs.items.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} ({job.count})
                </option>
              ))}
            </select>
          ) : null}

          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Name, email, phone…"
            className="h-9 w-52 rounded-lg border border-ink-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            className="h-9 rounded-lg border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-700 hover:border-ink-300"
          >
            Filter
          </button>
        </form>
      </div>

      {data.items.length === 0 ? (
        <EmptyState
          title="No applications here"
          description={
            sp.q || sp.status || sp.jobId
              ? "Nothing matches those filters."
              : "Applications submitted through the careers page will appear here, and HR is emailed a copy with the CV attached."
          }
        />
      ) : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th>Applicant</Th>
                <Th>Role</Th>
                <Th>Experience</Th>
                <Th>Received</Th>
                <Th>Status</Th>
                <Th className="text-right">CV</Th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((application) => (
                <ApplicationRow
                  key={application.id}
                  application={application}
                  statuses={[...STATUSES]}
                />
              ))}
            </tbody>
          </TableWrap>

          {data.pageCount > 1 ? (
            <nav className="mt-5 flex items-center justify-between" aria-label="Pagination">
              <PageLink sp={sp} page={data.page - 1} disabled={data.page <= 1}>
                Previous
              </PageLink>
              <span className="text-sm text-ink-500">
                Page {data.page} of {data.pageCount}
              </span>
              <PageLink sp={sp} page={data.page + 1} disabled={data.page >= data.pageCount}>
                Next
              </PageLink>
            </nav>
          ) : null}
        </>
      )}
    </>
  );
}

function PageLink({
  sp,
  page,
  disabled,
  children,
}: {
  sp: Record<string, string | undefined>;
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) return <span className="text-sm text-ink-300">{children}</span>;

  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v && k !== "page") params.set(k, v);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();

  return (
    <Link
      href={qs ? `/applications?${qs}` : "/applications"}
      className="text-sm font-semibold text-brand-600 hover:underline"
    >
      {children}
    </Link>
  );
}
