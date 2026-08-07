import type { Metadata } from "next";
import Link from "next/link";
import { apiServer } from "../../../lib/api";
import { EmptyState, PageHeader, TableWrap, Th } from "../../../components/ui";
import EnquiryRow from "./EnquiryRow";

export const metadata: Metadata = { title: "Enquiries" };

export interface Enquiry {
  id: number;
  kind: "enquiry" | "quote_request";
  name: string;
  phone: string;
  email: string | null;
  company: string | null;
  subject: string | null;
  service: string | null;
  industry: string | null;
  product: string | null;
  location: string | null;
  capacity: string | null;
  budget: string | null;
  timeline: string | null;
  message: string;
  status: "new" | "contacted" | "quoted" | "won" | "lost" | "spam";
  adminNotes: string | null;
  emailStatus: "pending" | "sent" | "failed" | "skipped";
  emailError: string | null;
  sourcePage: string | null;
  createdAt: string;
}

interface Paged {
  items: Enquiry[];
  page: number;
  pageCount: number;
  total: number;
}

const KINDS = [
  { value: "", label: "All" },
  { value: "enquiry", label: "Contact" },
  { value: "quote_request", label: "Quote requests" },
];

const STATUSES = ["new", "contacted", "quoted", "won", "lost", "spam"] as const;

/**
 * Filters are links, not client state: it means a filtered inbox can be
 * bookmarked and shared, and the back button behaves.
 */
type PageProps = {
  searchParams: Promise<{ kind?: string; status?: string; q?: string; page?: string }>;
};

function buildQuery(current: Record<string, string | undefined>, patch: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...current, ...patch })) {
    if (v) params.set(k, v);
  }
  // A filter change should always land on page one.
  params.delete("page");
  const qs = params.toString();
  return qs ? `/enquiries?${qs}` : "/enquiries";
}

export default async function EnquiriesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  if (sp.kind) params.set("kind", sp.kind);
  if (sp.status) params.set("status", sp.status);
  if (sp.q) params.set("q", sp.q);
  if (sp.page) params.set("page", sp.page);

  const data = await apiServer<Paged>(`/api/admin/enquiries?${params.toString()}`);

  return (
    <>
      <PageHeader
        title="Enquiries"
        description={`${data.total} submission${data.total === 1 ? "" : "s"} from the contact and quote forms.`}
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {KINDS.map((k) => {
          const active = (sp.kind ?? "") === k.value;
          return (
            <Link
              key={k.value || "all"}
              href={buildQuery(sp, { kind: k.value })}
              aria-current={active ? "page" : undefined}
              className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-brand-500 text-white"
                  : "border border-ink-200 bg-white text-ink-600 hover:border-ink-300"
              }`}
            >
              {k.label}
            </Link>
          );
        })}

        <span className="mx-1 hidden h-5 w-px bg-ink-200 sm:block" />

        <Link
          href={buildQuery(sp, { status: sp.status === "new" ? "" : "new" })}
          className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
            sp.status === "new"
              ? "bg-accent-500 text-white"
              : "border border-ink-200 bg-white text-ink-600 hover:border-ink-300"
          }`}
        >
          Unread only
        </Link>

        <form action="/enquiries" className="ml-auto flex gap-2">
          {sp.kind ? <input type="hidden" name="kind" value={sp.kind} /> : null}
          {sp.status ? <input type="hidden" name="status" value={sp.status} /> : null}
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Name, phone, company…"
            className="h-9 w-56 rounded-lg border border-ink-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none"
          />
        </form>
      </div>

      {data.items.length === 0 ? (
        <EmptyState
          title="No enquiries here"
          description={
            sp.q || sp.status || sp.kind
              ? "Nothing matches those filters."
              : "Submissions from the contact and quote forms will appear here."
          }
        />
      ) : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Phone</Th>
                <Th>About</Th>
                <Th>Received</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((enquiry) => (
                <EnquiryRow key={enquiry.id} enquiry={enquiry} statuses={[...STATUSES]} />
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

      <p className="mt-6 text-xs text-ink-400">
        Newest first. Times shown in Asia/Kolkata.
      </p>
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
  if (disabled) {
    return <span className="text-sm text-ink-300">{children}</span>;
  }
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v && k !== "page") params.set(k, v);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();

  return (
    <Link
      href={qs ? `/enquiries?${qs}` : "/enquiries"}
      className="text-sm font-semibold text-brand-600 hover:underline"
    >
      {children}
    </Link>
  );
}
