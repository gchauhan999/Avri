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
    return [
      { source: "/api/:path*", destination: `${api}/api/:path*` },
      /**
       * Uploaded logos and covers. The API returns them as `/uploads/…` paths
       * rather than absolute URLs, so these are what make them resolve —
       * without them every preview in the editor is a broken image.
       *
       * Two entries because `basePath` cuts both ways. A `src="/uploads/x"` in
       * the markup is root-relative, so the browser asks for `/uploads/x`, not
       * `/admin/uploads/x` — and by default every rewrite source is prefixed
       * with the basePath. `basePath: false` covers the URL the browser
       * actually requests; the prefixed one covers anything asking under
       * `/admin`.
       *
       * In production both paths land on the same reverse proxy and the public
       * site already serves `/uploads`, so this matters most in development,
       * where the two apps are on different ports.
       */
      { source: "/uploads/:path*", destination: `${api}/uploads/:path*` },
      { source: "/uploads/:path*", destination: `${api}/uploads/:path*`, basePath: false },
    ];
  },

  images: {
    // Uploaded logos and covers come back through the rewrite above, so they
    // are same-origin paths as far as next/image is concerned.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
