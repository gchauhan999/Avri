import type { Metadata } from "next";
import Link from "next/link";
import { apiServer } from "../../../lib/api";
import { ButtonLink, EmptyState, PageHeader, TableWrap, Th } from "../../../components/ui";
import JobRow from "./JobRow";

export const metadata: Metadata = { title: "Jobs" };

export interface AdminJob {
  id: number;
  slug: string;
  title: string;
  department: string | null;
  location: string;
  employmentType: "full_time" | "part_time" | "contract" | "internship";
  status: "draft" | "open" | "closed";
  openings: number;
  publishedAt: string | null;
  closesAt: string | null;
  createdAt: string;
  applicationCount: number;
}

type PageProps = { searchParams: Promise<{ status?: string }> };

const TABS = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "draft", label: "Drafts" },
  { value: "closed", label: "Closed" },
];

export default async function JobsPage({ searchParams }: PageProps) {
  const { status } = await searchParams;
  const query = status ? `?status=${encodeURIComponent(status)}` : "";

  const { items } = await apiServer<{ items: AdminJob[] }>(`/api/admin/jobs${query}`);

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Openings shown on the careers page. Drafts are invisible to visitors."
        action={<ButtonLink href="/jobs/new">Post a role</ButtonLink>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const active = (status ?? "") === tab.value;
          return (
            <Link
              key={tab.value || "all"}
              href={tab.value ? `/jobs?status=${tab.value}` : "/jobs"}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-brand-500 text-white"
                  : "border border-ink-200 bg-white text-ink-600 hover:border-ink-300"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={status ? "Nothing here" : "No roles yet"}
          description={
            status
              ? "No roles with that status."
              : "Post your first opening. Save it as a draft while you write it, then set it to Open when it is ready."
          }
          action={status ? undefined : <ButtonLink href="/jobs/new">Post a role</ButtonLink>}
        />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Title</Th>
              <Th>Department</Th>
              <Th>Location</Th>
              <Th>Applications</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {items.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
