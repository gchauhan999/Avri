import type { NextConfig } from "next";

/**
 * The public site runs as a Node application (`next start`), not a folder of
 * static HTML.
 *
 * It used to be `output: "export"` so it could be uploaded to cPanel. That was
 * dropped when the site gained a careers section and a blog: under a static
 * export a crawler receives an empty shell and the article text only appears
 * after JavaScript runs, which is exactly the wrong trade for the pages whose
 * whole purpose is to rank. Job and article pages are now rendered on the
 * server from the API and cached with ISR (`export const revalidate`).
 *
 * What that unlocks, and what the code now assumes:
 *  - pages may read `searchParams` on the server (`/blog?category=…` is a real,
 *    crawlable URL rather than browser-side filtering),
 *  - Route Handlers work, so `/api/revalidate` can publish a post instantly,
 *  - `next/image` optimises again — see `images` below.
 *
 * Deployment consequence: this needs a Node host. Plain static hosting can no
 * longer serve it, and `client/public/.htaccess` was deleted with the export.
 */
const nextConfig: NextConfig = {
  /**
   * Kept from the static-export era on purpose. Every indexed URL already ends
   * in a slash; turning this off would 308-redirect the whole site at once for
   * no gain.
   */
  trailingSlash: true,

  images: {
    /**
     * `unoptimized: true` is gone with the export. The ~50 product photographs
     * in `lib/product-images.ts` are static imports, so Next knows their
     * intrinsic size and can emit correctly-sized AVIF/WebP from the 17 MB of
     * JPEGs in `public/assets`.
     */
    formats: ["image/avif", "image/webp"],

    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],

    // Uploaded logos and covers are proxied through `/uploads` below, so the
    // optimiser treats them as local paths — no remotePattern needed for the
    // API host, and its origin never appears in the page source.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  /**
   * Blog covers and client logos are written to the API's disk, not to
   * `public/`. Proxying them keeps every image same-origin: no CORS headers to
   * get right, no second hostname in the CSP, and `next/image` can optimise
   * them like any local file.
   */
  async rewrites() {
    const api = (process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000").replace(/\/$/, "");
    return [{ source: "/uploads/:path*", destination: `${api}/uploads/:path*` }];
  },
};

export default nextConfig;
