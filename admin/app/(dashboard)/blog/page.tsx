import type { Metadata } from "next";
import Link from "next/link";
import { apiServer } from "../../../lib/api";
import { ButtonLink, EmptyState, PageHeader, TableWrap, Th } from "../../../components/ui";
import PostRow from "./PostRow";

export const metadata: Metadata = { title: "Blog posts" };

export interface AdminPost {
  id: number;
  slug: string;
  title: string;
  status: "draft" | "published" | "archived";
  publishedAt: string | null;
  isFeatured: boolean;
  readingMinutes: number | null;
  authorName: string | null;
  updatedAt: string;
  categoryName: string;
  categoryId: number;
}

interface Paged {
  items: AdminPost[];
  page: number;
  pageCount: number;
  total: number;
}

const TABS = [
  { value: "", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "archived", label: "Archived" },
];

type PageProps = { searchParams: Promise<{ status?: string; page?: string }> };

export default async function BlogPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const params = new URLSearchParams();
  if (sp.status) params.set("status", sp.status);
  if (sp.page) params.set("page", sp.page);

  const data = await apiServer<Paged>(`/api/admin/posts?${params.toString()}`);

  return (
    <>
      <PageHeader
        title="Blog posts"
        description="Articles on smart metering, solar, EV charging, government schemes and electrical safety."
        action={<ButtonLink href="/blog/new">Write an article</ButtonLink>}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const active = (sp.status ?? "") === tab.value;
          return (
            <Link
              key={tab.value || "all"}
              href={tab.value ? `/blog?status=${tab.value}` : "/blog"}
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

      {data.items.length === 0 ? (
        <EmptyState
          title={sp.status ? "Nothing here" : "No articles yet"}
          description={
            sp.status
              ? "No articles with that status."
              : "Write about the work — a rollout you finished, a scheme customers keep asking about, a safety practice worth explaining. These pages are what bring people to the site from Google."
          }
          action={sp.status ? undefined : <ButtonLink href="/blog/new">Write the first one</ButtonLink>}
        />
      ) : (
        <>
          <TableWrap>
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Category</Th>
                <Th>Author</Th>
                <Th>Published</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((post) => (
                <PostRow key={post.id} post={post} />
              ))}
            </tbody>
          </TableWrap>

          {data.pageCount > 1 ? (
            <nav className="mt-5 flex items-center justify-between" aria-label="Pagination">
              {data.page > 1 ? (
                <Link
                  href={`/blog?${new URLSearchParams({
                    ...(sp.status ? { status: sp.status } : {}),
                    ...(data.page - 1 > 1 ? { page: String(data.page - 1) } : {}),
                  }).toString()}`}
                  className="text-sm font-semibold text-brand-600 hover:underline"
                >
                  Previous
                </Link>
              ) : (
                <span className="text-sm text-ink-300">Previous</span>
              )}

              <span className="text-sm text-ink-500">
                Page {data.page} of {data.pageCount}
              </span>

              {data.page < data.pageCount ? (
                <Link
                  href={`/blog?${new URLSearchParams({
                    ...(sp.status ? { status: sp.status } : {}),
                    page: String(data.page + 1),
                  }).toString()}`}
                  className="text-sm font-semibold text-brand-600 hover:underline"
                >
                  Next
                </Link>
              ) : (
                <span className="text-sm text-ink-300">Next</span>
              )}
            </nav>
          ) : null}
        </>
      )}
    </>
  );
}
