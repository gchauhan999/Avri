/**
 * Offset pagination for the admin lists.
 *
 * Deliberately simple. Cursor pagination is better at scale, but an SME's
 * enquiry inbox will not reach the page count where that matters, and
 * prev/next over `LIMIT ... OFFSET` is far easier to reason about.
 */

import { z } from "zod";

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
});

export interface Paged<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  pageCount: number;
}

export function paged<T>(items: T[], total: number, page: number, limit: number): Paged<T> {
  return {
    items,
    page,
    limit,
    total,
    pageCount: Math.max(1, Math.ceil(total / limit)),
  };
}

export const offsetOf = (page: number, limit: number) => (page - 1) * limit;
