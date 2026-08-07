import type { Metadata } from "next";
import { company, contact, socials } from "./site";
import { EMPLOYMENT_SCHEMA } from "./careers";
import type { Job } from "./types";

/**
 * Absolute URL for a route path.
 *
 * `trailingSlash: true` in `next.config.ts` means the server actually serves
 * `/about/`, so a canonical of `/about` points at a URL that 308-redirects.
 * Search engines follow it, but they are being told the wrong address; this
 * keeps the two in step. Query strings keep their slash before the `?`.
 */
export function canonicalUrl(path: string): string {
  if (path === "/") return `${company.siteUrl}/`;
  const [route, query] = path.split("?");
  const withSlash = route.endsWith("/") ? route : `${route}/`;
  return `${company.siteUrl}${withSlash}${query ? `?${query}` : ""}`;
}

/**
 * Builds page metadata from a short description of the page, keeping titles,
 * canonicals and Open Graph tags consistent across the site.
 */
export function pageMetadata({
  title,
  description,
  path,
  keywords = [],
}: {
  title: string;
  description: string;
  /** Route path, e.g. "/services". */
  path: string;
  keywords?: string[];
}): Metadata {
  const url = canonicalUrl(path);

  return {
    title,
    description,
    keywords: [...baseKeywords, ...keywords],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: company.name,
      url,
      title: `${title} | ${company.name}`,
      description,
      images: [{ url: "/assets/logo.png", width: 1600, height: 800 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${company.name}`,
      description,
    },
  };
}

/**
 * BreadcrumbList schema for a nested page. Pass the trail without "Home" —
 * it is prepended here, mirroring the visible breadcrumb in `PageHero`.
 */
export function breadcrumbJsonLd(trail: { label: string; path: string }[]) {
  const items = [{ label: "Home", path: "/" }, ...trail];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: canonicalUrl(item.path),
    })),
  };
}

/**
 * JobPosting schema, for Google Jobs.
 *
 * Google requires `title`, `description` (the *complete* posting as HTML, not
 * a summary), `datePosted`, `hiringOrganization` and a `jobLocation` carrying
 * a full PostalAddress. `validThrough`, `employmentType`, `identifier` and
 * `baseSalary` are strongly recommended and included where we have them.
 *
 * Two operational rules matter as much as the markup, and both are enforced
 * elsewhere: a closed role must 404 rather than render, and must leave the
 * sitemap at the same time. Google demotes sites that leave expired postings
 * live.
 */
export function jobPostingJsonLd(job: Job) {
  const li = (item: string) => `<li>${escapeHtml(item)}</li>`;

  const description = [
    `<p>${escapeHtml(job.description).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>")}</p>`,
    job.responsibilities?.length
      ? `<h3>Responsibilities</h3><ul>${job.responsibilities.map(li).join("")}</ul>`
      : "",
    job.requirements?.length
      ? `<h3>Requirements</h3><ul>${job.requirements.map(li).join("")}</ul>`
      : "",
  ].join("");

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description,
    identifier: {
      "@type": "PropertyValue",
      name: company.name,
      value: job.slug,
    },
    datePosted: job.publishedAt ?? undefined,
    ...(job.closesAt ? { validThrough: job.closesAt } : {}),
    employmentType: EMPLOYMENT_SCHEMA[job.employmentType],
    hiringOrganization: {
      "@type": "Organization",
      name: company.name,
      sameAs: company.siteUrl,
      logo: `${company.siteUrl}/assets/logo.png`,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: job.location,
        addressLocality: contact.addressLines[1] ?? "Ghaziabad",
        addressRegion: contact.addressLines[2] ?? "Uttar Pradesh",
        ...(contact.postalCode ? { postalCode: contact.postalCode } : {}),
        addressCountry: "IN",
      },
    },
    ...(job.salaryMin
      ? {
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "INR",
            value: {
              "@type": "QuantitativeValue",
              minValue: job.salaryMin,
              maxValue: job.salaryMax ?? job.salaryMin,
              unitText: (job.salaryPeriod ?? "month").toUpperCase(),
            },
          },
        }
      : {}),
    ...(job.openings > 1 ? { totalJobOpenings: job.openings } : {}),
    directApply: true,
  };
}

/** Minimal escaping for the HTML embedded in JobPosting's description. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const baseKeywords = [
  "electrical EPC company",
  "turnkey electrical contractor",
  "HT LT electrical works",
  "substation erection",
  "distribution transformers",
  "smart metering solutions",
  "solar EPC India",
  "EV charging infrastructure",
  "electrical automation",
  "Ghaziabad electrical contractor",
];

/** Organization schema, rendered once in the root layout. */
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: company.name,
  legalName: company.legalName,
  slogan: company.tagline,
  description: company.description,
  foundingDate: company.foundedYear,
  url: company.siteUrl,
  logo: `${company.siteUrl}/assets/logo.png`,
  email: contact.email,
  telephone: contact.phones,
  ...(socials.length > 0 ? { sameAs: socials.map((s) => s.href) } : {}),
  address: {
    "@type": "PostalAddress",
    streetAddress: contact.addressLines[0] ?? contact.address,
    addressLocality: contact.addressLines[1] ?? "Ghaziabad",
    addressRegion: contact.addressLines[2] ?? "Uttar Pradesh",
    ...(contact.postalCode ? { postalCode: contact.postalCode } : {}),
    addressCountry: "IN",
  },
  contactPoint: contact.phones.map((phone) => ({
    "@type": "ContactPoint",
    telephone: phone,
    contactType: "sales",
    areaServed: "IN",
    availableLanguage: ["en", "hi"],
  })),
};

/** LocalBusiness schema, rendered on the contact page. */
export const localBusinessJsonLd = {
  ...organizationJsonLd,
  "@type": "LocalBusiness",
  openingHours: contact.hours,
  ...(contact.googleMap ? { hasMap: contact.googleMap } : {}),
};
