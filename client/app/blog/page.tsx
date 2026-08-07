import type { Metadata } from "next";
import Link from "next/link";
import ContactCTA from "@/components/sections/ContactCTA";
import { ButtonLink } from "@/components/ui/Button";
import Media from "@/components/ui/Media";
import { RevealGroup, RevealItem } from "@/components/ui/Motion";
import PageHero from "@/components/ui/PageHero";
import PostCard from "@/components/ui/PostCard";
import { Section } from "@/components/ui/Section";
import { blogHref, categoryIllustration } from "@/lib/blog";
import { formatDate } from "@/lib/careers";
import { getPostCategories, getPosts } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { company } from "@/lib/site";

type PageProps = {
  searchParams: Promise<{ category?: string; page?: string }>;
};

/**
 * Filters and pagination are real URLs read on the server, not client state —
 * the opposite of `/careers`, and for the opposite reason. The blog is the
 * site's SEO surface, so `/blog?category=solar` and page 2 have to be
 * crawlable pages with their own canonical and title. A careers list is five
 * items nobody searches for, where instant filtering is simply nicer.
 *
 * Reading `searchParams` makes this route dynamic, but the underlying fetch is
 * still cached for five minutes per query shape, so the database is barely
 * touched.
 */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { category, page } = await searchParams;
  const categories = await getPostCategories();
  const active = categories.find((c) => c.slug === category);
  const pageNumber = Math.max(1, Number(page) || 1);

  const title = active
    ? `${active.name} — Insights`
    : pageNumber > 1
      ? `Insights & News — page ${pageNumber}`
      : "Insights & News";

  return pageMetadata({
    title,
    description: active
      ? active.description ??
        `Articles on ${active.name.toLowerCase()} from ${company.name}.`
      : `Notes from the field on smart metering, solar, EV charging, government schemes and electrical safety — from ${company.name}.`,
    path: blogHref({ category: active?.slug, page: pageNumber }),
    keywords: [
      "smart metering India",
      "solar EPC insights",
      "EV charging infrastructure",
      "RDSS scheme",
      "electrical safety",
    ],
  });
}

export const revalidate = 300;

export default async function BlogPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);

  const categories = await getPostCategories();
  // Ignore an unknown category rather than showing an empty page for a typo.
  const category = categories.some((c) => c.slug === sp.category) ? sp.category! : "";
  const active = categories.find((c) => c.slug === category);

  const { items, featured, pageCount, total } = await getPosts({ category, page });

  // Only offer categories that actually have something in them.
  const chips = categories.filter((c) => c.postCount > 0);

  return (
    <>
      <PageHero
        breadcrumb="Blog"
        eyebrow="Insights"
        title={active ? active.name : "Notes from the field"}
        lead={
          active?.description ??
          "What we are seeing on site — smart metering rollouts, solar economics, EV charging, government schemes and the safety practices behind all of it."
        }
      />

      {featured ? (
        <div className="border-b border-ink-100 bg-ink-50/60">
          <Section>
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <Link href={`/blog/${featured.slug}`} className="block">
                <Media
                  src={featured.cover ?? undefined}
                  alt={featured.coverAlt ?? featured.title}
                  illustration={categoryIllustration(featured.categorySlug)}
                  ratio="aspect-[16/10]"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  priority
                />
              </Link>

              <div>
                <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  {featured.categoryName}
                </span>
                <h2 className="mt-4 text-3xl font-bold leading-tight tracking-tight text-ink-900">
                  <Link
                    href={`/blog/${featured.slug}`}
                    className="transition-colors hover:text-brand-600"
                  >
                    {featured.title}
                  </Link>
                </h2>
                {featured.excerpt ? (
                  <p className="mt-4 text-base leading-relaxed text-ink-600">{featured.excerpt}</p>
                ) : null}
                <p className="mt-4 text-sm text-ink-400">
                  {featured.publishedAt ? formatDate(featured.publishedAt) : null}
                  {featured.readingMinutes ? ` · ${featured.readingMinutes} min read` : null}
                </p>
                <div className="mt-6">
                  <ButtonLink href={`/blog/${featured.slug}`}>Read the article</ButtonLink>
                </div>
              </div>
            </div>
          </Section>
        </div>
      ) : null}

      <Section>
        {chips.length > 1 ? (
          <nav aria-label="Categories" className="flex flex-wrap gap-2">
            <CategoryChip href={blogHref()} active={!category}>
              All
            </CategoryChip>
            {chips.map((c) => (
              <CategoryChip
                key={c.slug}
                href={blogHref({ category: c.slug })}
                active={category === c.slug}
              >
                {c.name}
              </CategoryChip>
            ))}
          </nav>
        ) : null}

        <p className="mt-6 text-sm text-ink-500">
          {total} {total === 1 ? "article" : "articles"}
          {active ? ` in ${active.name}` : ""}
        </p>

        {items.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-ink-200 bg-white px-6 py-16 text-center">
            <p className="text-base font-semibold text-ink-800">
              {category ? "Nothing in this category yet" : "No articles published yet"}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
              We write about the work as it happens. Check back shortly.
            </p>
            {category ? (
              <div className="mt-6">
                <ButtonLink href={blogHref()} variant="outline">
                  See all articles
                </ButtonLink>
              </div>
            ) : null}
          </div>
        ) : (
          <RevealGroup className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => (
              <RevealItem key={post.id}>
                <PostCard post={post} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}

        {pageCount > 1 ? (
          <nav
            className="mt-12 flex items-center justify-center gap-2"
            aria-label="Article pages"
          >
            <PageLink category={category} page={page - 1} disabled={page <= 1}>
              Previous
            </PageLink>

            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={blogHref({ category, page: n })}
                aria-current={n === page ? "page" : undefined}
                className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-semibold transition-colors ${
                  n === page
                    ? "bg-brand-500 text-white"
                    : "border border-ink-200 bg-white text-ink-600 hover:border-brand-500"
                }`}
              >
                {n}
              </Link>
            ))}

            <PageLink category={category} page={page + 1} disabled={page >= pageCount}>
              Next
            </PageLink>
          </nav>
        ) : null}
      </Section>

      <ContactCTA
        title="Have a question about your site?"
        body="Our engineers answer these questions every day. Ask, and you will get a straight answer."
      />
    </>
  );
}

function CategoryChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-brand-500 text-white"
          : "border border-ink-200 bg-white text-ink-600 hover:border-brand-500 hover:text-brand-600"
      }`}
    >
      {children}
    </Link>
  );
}

function PageLink({
  category,
  page,
  disabled,
  children,
}: {
  category: string;
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="inline-flex h-10 items-center px-3 text-sm font-semibold text-ink-300">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={blogHref({ category, page })}
      className="inline-flex h-10 items-center rounded-full px-3 text-sm font-semibold text-brand-600 hover:underline"
    >
      {children}
    </Link>
  );
}
