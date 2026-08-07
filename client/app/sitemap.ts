import type { MetadataRoute } from "next";
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
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const primary = [...navHrefs, "/request-a-quote"];
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
    ...legal.map((href) => ({
      url: canonicalUrl(href),
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
