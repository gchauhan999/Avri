import Link from "next/link";
import Media from "@/components/ui/Media";
import { HoverLift } from "@/components/ui/Motion";
import { formatDate } from "@/lib/careers";
import { categoryIllustration } from "@/lib/blog";
import type { PostSummary } from "@/lib/types";

/**
 * An article card.
 *
 * Falls back to the branded vector artwork when a post has no cover, using the
 * illustration that matches its category — so the grid never has a hole in it
 * and no new assets were needed.
 */
export default function PostCard({ post }: { post: PostSummary }) {
  return (
    <HoverLift>
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white transition-colors hover:border-brand-200">
        <Link href={`/blog/${post.slug}`} className="relative block">
          <Media
            src={post.cover ?? undefined}
            alt={post.coverAlt ?? post.title}
            illustration={categoryIllustration(post.categorySlug)}
            ratio="aspect-[16/10]"
            rounded="rounded-none"
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink-800 backdrop-blur">
            {post.categoryName}
          </span>
        </Link>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-lg font-bold leading-snug tracking-tight text-ink-900">
            <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-brand-600">
              {post.title}
            </Link>
          </h3>

          {post.excerpt ? (
            <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-500">{post.excerpt}</p>
          ) : (
            <div className="flex-1" />
          )}

          <p className="mt-4 text-xs text-ink-400">
            {post.publishedAt ? formatDate(post.publishedAt) : null}
            {post.publishedAt && post.readingMinutes ? " · " : null}
            {post.readingMinutes ? `${post.readingMinutes} min read` : null}
          </p>
        </div>
      </article>
    </HoverLift>
  );
}
