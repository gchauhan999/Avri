import type { NextConfig } from "next";

/**
 * The admin panel.
 *
 * Served at `avrienergy.com/admin`, behind the same reverse proxy as the
 * public site. That single decision removes most of the usual auth friction:
 * the session cookie is first-party, there is no cross-site cookie problem,
 * and the API origin never appears in the page source.
 */
const nextConfig: NextConfig = {
  /**
   * Every route is prefixed. `next/link` applies this automatically, so links
   * are still written as `/jobs` and render as `/admin/jobs`.
   *
   * Note this is baked in at build time — changing it needs a rebuild.
   */
  basePath: "/admin",

  /**
   * Proxy the API through this app so the browser only ever talks to one
   * origin. Consequences worth spelling out:
   *   - the session cookie is first-party, so no SameSite=None and no
   *     third-party-cookie blocking to work around,
   *   - there is no CORS configuration on the browser path to get wrong,
   *   - `API_ORIGIN` is server-only and never reaches the bundle.
   */
  async rewrites() {
    const api = (process.env.API_ORIGIN ?? "http://127.0.0.1:4000").replace(/\/$/, "");
    return [{ source: "/api/:path*", destination: `${api}/api/:path*` }];
  },

  images: {
    // Uploaded logos and covers come back through the proxy above, so they are
    // same-origin paths as far as next/image is concerned.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
