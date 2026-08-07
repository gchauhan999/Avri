import type { Metadata } from "next";
import { company, contact, socials } from "./site";

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
  const url = `${company.siteUrl}${path === "/" ? "" : path}`;

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
      item: `${company.siteUrl}${item.path === "/" ? "" : item.path}`,
    })),
  };
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
