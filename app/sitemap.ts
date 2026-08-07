import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
import { company, legalNav, navHrefs } from "@/lib/site";

/** Written once at build time — the static export has no server to run it. */
export const dynamic = "force-static";

/** All public routes, generated from the navigation config and the catalogue. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const primary = [...navHrefs, "/request-a-quote"];
  const legal = legalNav.map((n) => n.href);

  return [
    ...primary.map((href) => ({
      url: `${company.siteUrl}${href === "/" ? "" : href}`,
      lastModified: now,
      changeFrequency: (href === "/" ? "weekly" : "monthly") as
        | "weekly"
        | "monthly",
      priority: href === "/" ? 1 : 0.8,
    })),
    ...products.map((product) => ({
      url: `${company.siteUrl}/products/${product.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...legal.map((href) => ({
      url: `${company.siteUrl}${href}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
