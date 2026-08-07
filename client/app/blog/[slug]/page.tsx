import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContactCTA from "@/components/sections/ContactCTA";
import { ButtonLink } from "@/components/ui/Button";
import Media from "@/components/ui/Media";
import { RevealGroup, RevealItem } from "@/components/ui/Motion";
import PageHero from "@/components/ui/PageHero";
import PostCard from "@/components/ui/PostCard";
import { Section, SectionHeading } from "@/components/ui/Section";
import ShareLinks from "@/components/ui/ShareLinks";
import { blogHref, categoryIllustration } from "@/lib/blog";
import { formatDate } from "@/lib/careers";
import { getPost } from "@/lib/content";
import { articleJsonLd, breadcrumbJsonLd, canonicalUrl, pageMetadata } from "@/lib/seo";
import { company, contact, telHref } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

/**
 * Like `/careers/[slug]`, no `generateStaticParams`: articles are written in
 * the admin panel and must go live without a deploy. Any slug renders on
 * demand, ISR caches it, and publishing calls `/api/revalidate` so it appears
 * within seconds.
 */
export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article not found" };

  const meta = pageMetadata({
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? `An article from ${company.name}.`,
    path: `/blog/${post.slug}`,
    keywords: post.seoKeywords ? post.seoKeywords.split(",").map((k) => k.trim()) : [],
  });

  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      section: post.categoryName,
      ...(post.authorName ? { authors: [post.authorName] } : {}),
      ...(post.cover
        ? { images: [{ url: post.cover, alt: post.coverAlt ?? post.title }] }
        : {}),
    },
    // An author can override the canonical when a piece is syndicated.
    ...(post.canonicalUrl ? { alternates: { canonical: post.canonicalUrl } } : {}),
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const schema = [
    articleJsonLd(post),
    breadcrumbJsonLd([
      { label: "Blog", path: "/blog" },
      { label: post.categoryName, path: blogHref({ category: post.categorySlug }) },
      { label: post.title, path: `/blog/${post.slug}` },
    ]),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <PageHero
        breadcrumb={[
          { label: "Blog", href: "/blog" },
          { label: post.categoryName, href: blogHref({ category: post.categorySlug }) },
          { label: post.title },
        ]}
        eyebrow={post.categoryName}
        title={post.title}
      >
        <p className="mt-6 text-sm text-white/60">
          {post.authorName ? `${post.authorName} · ` : ""}
          {post.publishedAt ? formatDate(post.publishedAt) : null}
          {post.readingMinutes ? ` · ${post.readingMinutes} min read` : null}
        </p>
      </PageHero>

      <Section>
        {post.cover ? (
          <div className="-mt-20 mb-12">
            <Media
              src={post.cover}
              alt={post.coverAlt ?? post.title}
              illustration={categoryIllustration(post.categorySlug)}
              ratio="aspect-[16/9]"
              sizes="(min-width: 1024px) 70vw, 100vw"
              priority
            />
          </div>
        ) : null}

        <div className="grid gap-12 lg:grid-cols-[1fr_16rem]">
          {/*
            The HTML is sanitised on the server when the article is saved (see
            server/src/services/sanitise.ts), so what reaches here is already
            an allow-listed subset — no script, no style, no event handlers.
          */}
          <div
            className="article-body max-w-2xl"
            dangerouslySetInnerHTML={{ __html: post.body }}
          />

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <ShareLinks url={canonicalUrl(`/blog/${post.slug}`)} title={post.title} />

            <div className="mt-8 rounded-3xl bg-ink-900 p-6">
              <p className="text-sm font-semibold text-white">Talk to an engineer</p>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Questions about how this applies to your site? Ask someone who does the work.
              </p>
              <div className="mt-5">
                <ButtonLink href="/contact" variant="ghostLight" size="sm">
                  Get in touch
                </ButtonLink>
              </div>
              {contact.phones[0] ? (
                <p className="mt-4 text-xs text-white/50">
                  or call{" "}
                  <a href={telHref(contact.phones[0])} className="font-semibold text-white/80">
                    {contact.phones[0]}
                  </a>
                </p>
              ) : null}
            </div>

            <p className="mt-6 text-xs text-ink-400">
              Filed under{" "}
              <Link
                href={blogHref({ category: post.categorySlug })}
                className="font-semibold text-brand-600 hover:underline"
              >
                {post.categoryName}
              </Link>
            </p>
          </aside>
        </div>
      </Section>

      {post.related.length > 0 ? (
        <div className="border-t border-ink-100 bg-ink-50/60">
          <Section>
            <SectionHeading eyebrow="Keep reading" title={`More on ${post.categoryName}`} />
            <RevealGroup className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {post.related.map((related) => (
                <RevealItem key={related.id}>
                  <PostCard post={related} />
                </RevealItem>
              ))}
            </RevealGroup>
          </Section>
        </div>
      ) : null}

      <ContactCTA />
    </>
  );
}
