import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Build a folder of plain HTML instead of a Node application, so the site can
   * be uploaded to ordinary shared hosting (cPanel). `next build` then writes
   * `out/` — that folder's *contents* go in the web root.
   *
   * What this rules out, and why the code is written the way it is:
   *  - no server actions or API routes — the forms POST straight from the
   *    browser to `NEXT_PUBLIC_ENQUIRY_ENDPOINT` (`lib/enquiry.ts`),
   *  - no reading `searchParams` on the server — `?category=` and `?product=`
   *    are picked up in the browser instead,
   *  - no on-demand image optimisation, hence `unoptimized` below.
   *
   * Remove `output` and `images.unoptimized` to go back to a Node deployment
   * (Vercel, Netlify, or `next start`); everything else keeps working.
   */
  output: "export",

  /**
   * Every page becomes `<route>/index.html` rather than `<route>.html`, which
   * is what Apache serves for a directory URL without any rewrite rules.
   */
  trailingSlash: true,

  images: {
    // The optimiser is a server feature. Without it Next emits the original
    // file, so the source images in `public/assets/` are what visitors receive.
    unoptimized: true,

    // Kept for a future Node deployment; ignored while exporting.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
