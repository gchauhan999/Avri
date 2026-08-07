/**
 * Blog helpers.
 */

import type { IllustrationKey } from "./types";

/**
 * Cover fallback per category, reusing the vector artwork that already exists
 * in `components/ui/Illustration.tsx`. An article without a photograph still
 * gets something on-brand rather than an empty frame, and no new assets were
 * needed.
 */
const CATEGORY_ILLUSTRATION: Record<string, IllustrationKey> = {
  "smart-metering": "metering",
  solar: "solar",
  "ev-charging": "ev",
  "government-schemes": "government",
  "electrical-safety": "maintenance",
};

export function categoryIllustration(slug: string): IllustrationKey {
  return CATEGORY_ILLUSTRATION[slug] ?? "energy";
}

/** Builds a `/blog` URL, dropping empty values and page 1. */
export function blogHref({ category, page }: { category?: string; page?: number } = {}): string {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/blog?${qs}` : "/blog";
}
