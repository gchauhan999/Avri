import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, apiServer } from "../../../../lib/api";
import { PageHeader } from "../../../../components/ui";
import PostForm, { type Category, type PostDetail } from "../PostForm";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const post = await apiServer<PostDetail>(`/api/admin/posts/${id}`);
    return { title: post.title };
  } catch {
    return { title: "Article" };
  }
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;

  let post: PostDetail;
  try {
    post = await apiServer<PostDetail>(`/api/admin/posts/${id}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const { items: categories } = await apiServer<{ items: Category[] }>(
    "/api/admin/posts/categories"
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <>
      <PageHeader
        title={post.title}
        description={post.status === "published" ? "Live on the blog." : "Not published."}
        action={
          post.status === "published" && siteUrl ? (
            <Link
              href={`${siteUrl}/blog/${post.slug}/`}
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
        <PostForm post={post} categories={categories} />
      </div>
    </>
  );
}
