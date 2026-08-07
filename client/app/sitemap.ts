import type { MetadataRoute } from "next";
import { getJobIndex, getPostIndex } from "@/lib/content";
import { products } from "@/lib/products";
import { canonicalUrl } from "@/lib/seo";
import { legalNav, navHrefs } from "@/lib/site";

/**
 * Regenerated hourly rather than pinned at build time: job openings and blog
 * posts come from the database, so the sitemap has to be able to change
 * without a redeploy.
 */
export const revalidate = 3600;

/** All public routes, generated from the navigation config and the catalogue. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  /**
   * Open roles only — `getJobIndex` excludes drafts, closed roles and any
   * whose closing date has passed. Those pages 404, and advertising a URL that
   * 404s is worse than omitting it.
   *
   * Fail-soft: if the API is unreachable this returns an empty list rather
   * than throwing, so an outage costs us the job URLs, not the whole sitemap.
   */
  const [jobs, articles] = await Promise.all([getJobIndex(), getPostIndex()]);

  const primary = [...navHrefs, "/request-a-quote", "/careers/apply"];
  const legal = legalNav.map((n) => n.href);

  // Every URL goes through `canonicalUrl` so the sitemap advertises exactly the
  // address each page names as its canonical — trailing slash included.
  return [
    ...primary.map((href) => ({
      url: canonicalUrl(href),
      lastModified: now,
      changeFrequency: (href === "/" ? "weekly" : "monthly") as
        | "weekly"
        | "monthly",
      priority: href === "/" ? 1 : 0.8,
    })),
    ...products.map((product) => ({
      url: canonicalUrl(`/products/${product.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...jobs.map((job) => ({
      url: canonicalUrl(`/careers/${job.slug}`),
      lastModified: new Date(job.updatedAt.replace(" ", "T") + "Z"),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...articles.map((article) => ({
      url: canonicalUrl(`/blog/${article.slug}`),
      lastModified: new Date(article.updatedAt.replace(" ", "T") + "Z"),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...legal.map((href) => ({
      url: canonicalUrl(href),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
