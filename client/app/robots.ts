import type { MetadataRoute } from "next";
import { company } from "@/lib/site";

/** Written once at build time — the static export has no server to run it. */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${company.siteUrl}/sitemap.xml`,
  };
}
