"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Badge, Button, Td } from "../../../components/ui";
import { formatDate } from "../../../lib/format";
import { deletePost, setPostStatus } from "../../actions/posts";
import type { AdminPost } from "./page";

const TONE = { draft: "neutral", published: "green", archived: "red" } as const;
const LABEL = { draft: "Draft", published: "Published", archived: "Archived" } as const;

export default function PostRow({ post }: { post: AdminPost }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ ok?: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) setError(result.error);
    });
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  // Published, but dated in the future — held back until then, which is not
  // obvious from the status alone.
  const scheduled =
    post.status === "published" && post.publishedAt !== null && new Date(post.publishedAt) > new Date();

  return (
    <>
      <tr>
        <Td>
          <Link href={`/blog/${post.id}`} className="font-semibold text-ink-900 hover:text-brand-600">
            {post.title}
          </Link>
          <span className="mt-0.5 block text-xs text-ink-400">
            /{post.slug}
            {post.readingMinutes ? ` · ${post.readingMinutes} min read` : ""}
          </span>
        </Td>

        <Td className="text-ink-500">{post.categoryName}</Td>
        <Td className="text-ink-500">{post.authorName ?? "—"}</Td>

        <Td className="whitespace-nowrap text-ink-500">
          {post.publishedAt ? formatDate(post.publishedAt) : "—"}
        </Td>

        <Td>
          <div className="flex flex-col items-start gap-1">
            <Badge tone={TONE[post.status]}>{LABEL[post.status]}</Badge>
            {post.isFeatured ? <Badge tone="amber">Featured</Badge> : null}
            {scheduled ? <Badge tone="blue">Scheduled</Badge> : null}
          </div>
        </Td>

        <Td className="text-right">
          <div className="flex justify-end gap-2">
            <select
              aria-label={`Status for ${post.title}`}
              value={post.status}
              disabled={pending}
              onChange={(e) => run(() => setPostStatus(post.id, e.target.value as AdminPost["status"]))}
              className="h-8 rounded-lg border border-ink-200 bg-white px-2 text-xs font-semibold text-ink-700 focus:border-brand-500 focus:outline-none disabled:opacity-60"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>

            {post.status === "published" && siteUrl ? (
              <a
                href={`${siteUrl}/blog/${post.slug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center rounded-lg border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-700 hover:border-ink-300"
              >
                View
              </a>
            ) : null}

            <Link
              href={`/blog/${post.id}`}
              className="inline-flex h-8 items-center rounded-lg border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-700 hover:border-ink-300"
            >
              Edit
            </Link>

            <Button
              variant="danger"
              className="h-8 px-3 text-xs"
              disabled={pending}
              onClick={() => {
                if (confirm(`Delete "${post.title}"? This cannot be undone.`)) {
                  run(() => deletePost(post.id));
                }
              }}
            >
              Delete
            </Button>
          </div>
        </Td>
      </tr>

      {error ? (
        <tr>
          <td colSpan={6} className="border-b border-ink-100 bg-red-50 px-4 py-2">
            <p className="text-sm text-red-800">{error}</p>
          </td>
        </tr>
      ) : null}
    </>
  );
}
