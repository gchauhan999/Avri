/** Shared domain types for the Avri Energy site. */

import type { StaticImageData } from "next/image";

export interface NavItem {
  href: string;
  label: string;
  /** Nested links render as a dropdown in the desktop navbar. */
  children?: NavItem[];
}

/** Keys of the built-in vector illustrations in `components/ui/Illustration.tsx`. */
export type IllustrationKey =
  | "epc"
  | "htlt"
  | "substation"
  | "transformer"
  | "metering"
  | "energy"
  | "solar"
  | "automation"
  | "maintenance"
  | "industrial"
  | "street-light"
  | "ev"
  | "supply"
  | "utility"
  | "government"
  | "infrastructure"
  | "smart-city"
  | "commercial"
  | "residential"
  | "team";

/** A named person a visitor can write to directly, shown on the contact page. */
export interface KeyContact {
  name: string;
  /** Designation, e.g. "Sales Head". Omitted until we have it. */
  role?: string;
  email: string;
}

export interface Service {
  slug: string;
  title: string;
  /** One-line summary used on cards. */
  summary: string;
  /** Longer copy used on the service detail section. */
  description: string;
  /** Concrete scope items. */
  scope: string[];
  /** Optional photograph, e.g. "/assets/services/solar.jpg". */
  image?: string;
  illustration: IllustrationKey;
}

export interface Industry {
  slug: string;
  title: string;
  summary: string;
  /** What we typically deliver for this sector. */
  highlights: string[];
  image?: string;
  illustration: IllustrationKey;
}

export interface Project {
  slug: string;
  title: string;
  client: string;
  location: string;
  year: string;
  /** Matches a `Service.title` — drives the project filter. */
  category: string;
  scope: string;
  /** Headline figures, e.g. capacity or length. */
  facts: { label: string; value: string }[];
  image?: string;
  illustration: IllustrationKey;
  featured?: boolean;
}

/**
 * A catalogue item. The complete list lives in `lib/products.ts` — add entries
 * there and every page picks them up without a component change.
 */
export interface Product {
  id: string;
  /** URL segment: `/products/<slug>`. Must be unique. */
  slug: string;
  name: string;
  /** Must match an entry in `productCategories` (lib/products.ts). */
  category: string;
  /** One line, used on cards and as the meta description. */
  shortDescription: string;
  /** A paragraph or two for the detail page. */
  fullDescription: string;
  /** Technical specifications, rendered as a two-column table. */
  specifications: { label: string; value: string }[];
  applications: string[];
  /**
   * Usually filled in from the category (see `lib/product-images.ts`), which
   * imports the file statically so its URL is fingerprinted. Set a plain path
   * or a static import here to override it for a single product.
   */
  image?: string | StaticImageData;
  /** Vector artwork shown until a photograph is supplied. */
  illustration: IllustrationKey;
  /** Optional PDF in `public/assets/products/datasheets/`. */
  datasheet?: string;
  featured?: boolean;
}

export interface GalleryItem {
  id: string;
  caption: string;
  category: string;
  image?: string;
  illustration: IllustrationKey;
}

/**
 * A client, as returned by `GET /api/clients`.
 *
 * Unlike the rest of this file, clients live in the database rather than in
 * `lib/site.ts` — they are the one piece of editorial content that needs an
 * authorisation workflow, because publishing a company's logo without written
 * permission is a trademark risk. The API only ever returns authorised,
 * published rows, so there is no `authorized` flag to check here.
 */
export interface Client {
  id: number;
  name: string;
  slug: string;
  /** Absolute URL served by the API, or null for a wordmark fallback. */
  logo?: string | null;
  /** Measured when the logo was processed, so the plate never reflows. */
  logoWidth?: number | null;
  logoHeight?: number | null;
  website?: string | null;
  sector?: string | null;
}

/* -------------------------------------------------------------------------- */
/*  Careers — database-backed, managed in the admin panel                      */
/* -------------------------------------------------------------------------- */

export type EmploymentType = "full_time" | "part_time" | "contract" | "internship";

/** Summary shape, as returned by `GET /api/jobs`. */
export interface JobSummary {
  id: number;
  slug: string;
  title: string;
  department: string | null;
  location: string;
  employmentType: EmploymentType;
  experienceMin: number | null;
  experienceMax: number | null;
  openings: number;
  salaryRange: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: "month" | "year" | null;
  /** One line, used on the card and as the meta description. */
  summary: string;
  publishedAt: string | null;
  /** Past this date the role 404s and leaves the sitemap. */
  closesAt: string | null;
  updatedAt: string;
}

/** Full shape, as returned by `GET /api/jobs/:slug`. */
export interface Job extends JobSummary {
  description: string;
  responsibilities: string[] | null;
  requirements: string[] | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

/* -------------------------------------------------------------------------- */
/*  Blog / News — database-backed, written in the admin panel                  */
/* -------------------------------------------------------------------------- */

export interface PostCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  /** Published posts only, so the filter never offers an empty category. */
  postCount: number;
}

/** Card shape, as returned by `GET /api/posts`. */
export interface PostSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  cover: string | null;
  coverAlt: string | null;
  coverImageWidth: number | null;
  coverImageHeight: number | null;
  publishedAt: string | null;
  readingMinutes: number | null;
  isFeatured: boolean;
  authorName: string | null;
  categoryName: string;
  categorySlug: string;
}

/** Full article, as returned by `GET /api/posts/:slug`. */
export interface Post extends PostSummary {
  /** Sanitised server-side on write — see `server/src/services/sanitise.ts`. */
  body: string;
  updatedAt: string;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  canonicalUrl: string | null;
  related: PostSummary[];
}

export interface Certification {
  code: string;
  title: string;
  description: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
}

export interface Feature {
  title: string;
  description: string;
}

export interface Stat {
  value: string;
  label: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

export interface Faq {
  question: string;
  answer: string;
}
