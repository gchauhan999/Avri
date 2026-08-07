import type { Metadata } from "next";
import Link from "next/link";
import { apiServer } from "../../lib/api";
import { timeAgo } from "../../lib/format";
import { Alert, Badge, Card, PageHeader } from "../../components/ui";

export const metadata: Metadata = { title: "Overview" };

interface Overview {
  counts: {
    unreadEnquiries: number;
    newApplications: number;
    openJobs: number;
    draftPosts: number;
    failedMail: number;
  };
  recentEnquiries: {
    id: number;
    kind: "enquiry" | "quote_request";
    name: string;
    phone: string;
    subject: string | null;
    service: string | null;
    status: string;
    createdAt: string;
  }[];
  recentApplications: {
    id: number;
    fullName: string;
    jobTitle: string;
    status: string;
    createdAt: string;
  }[];
}

function Tile({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-ink-200 bg-white p-5 transition-colors hover:border-brand-300"
    >
      <p className="text-2xl font-bold tracking-tight text-ink-900">{value}</p>
      <p className="mt-1 text-sm text-ink-500">{label}</p>
    </Link>
  );
}

export default async function OverviewPage() {
  const data = await apiServer<Overview>("/api/admin/stats");
  const { counts, recentEnquiries, recentApplications } = data;

  return (
    <>
      <PageHeader title="Overview" description="What needs attention today." />

      {counts.failedMail > 0 ? (
        <div className="mb-6">
          <Alert tone="warning">
            {counts.failedMail} notification{counts.failedMail === 1 ? "" : "s"} could not be
            emailed. Nothing is lost — every submission is stored here — but nobody was alerted by
            email. Check the SMTP settings, then use “Resend” on the affected rows.
          </Alert>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tile label="Unread enquiries" value={counts.unreadEnquiries} href="/enquiries?status=new" />
        <Tile
          label="New applications"
          value={counts.newApplications}
          href="/applications?status=new"
        />
        <Tile label="Open roles" value={counts.openJobs} href="/jobs?status=open" />
        <Tile label="Draft articles" value={counts.draftPosts} href="/blog?status=draft" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink-900">Latest enquiries</h2>
            <Link href="/enquiries" className="text-sm font-semibold text-brand-600 hover:underline">
              View all
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">Nothing yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {recentEnquiries.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/enquiries?id=${e.id}`}
                    className="-mx-2 flex items-start justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-ink-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink-900">
                        {e.name}
                      </span>
                      <span className="block truncate text-xs text-ink-500">
                        {e.subject || e.service || "General enquiry"} · {e.phone}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      {e.status === "new" ? <Badge tone="amber">New</Badge> : null}
                      <span className="mt-1 block text-xs text-ink-400">{timeAgo(e.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink-900">Latest applications</h2>
            <Link
              href="/applications"
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-400">Nothing yet.</p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {recentApplications.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/applications?id=${a.id}`}
                    className="-mx-2 flex items-start justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-ink-50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink-900">
                        {a.fullName}
                      </span>
                      <span className="block truncate text-xs text-ink-500">{a.jobTitle}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      {a.status === "new" ? <Badge tone="amber">New</Badge> : null}
                      <span className="mt-1 block text-xs text-ink-400">{timeAgo(a.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
