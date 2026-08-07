/**
 * Reading database-backed content from the API.
 *
 * Each function carries its own cache tag, so `/api/revalidate` can drop
 * exactly what changed when something is published in the admin panel.
 */

import { apiFind, apiGet } from "./api";
import type { Client, Job, JobSummary, Post, PostCategory, PostSummary } from "./types";

/**
 * Authorised, published clients only.
 *
 * The API already filters on both flags. Filtering again here is deliberate
 * belt-and-braces: showing a company's logo without permission is a trademark
 * problem, and one careless change to a SELECT should not be all that stands
 * between us and it.
 */
export async function getClients(): Promise<Client[]> {
  const clients = await apiGet<Client[]>("/api/clients", [], {
    revalidate: 1800,
    tags: ["clients"],
  });
  return clients.filter((client) => client.name);
}

/* -------------------------------------------------------------------------- */
/*  Careers                                                                    */
/* -------------------------------------------------------------------------- */

/** Open roles only — the API will not return drafts or closed ones. */
export async function getJobs(): Promise<JobSummary[]> {
  return apiGet<JobSummary[]>("/api/jobs", [], { revalidate: 300, tags: ["jobs"] });
}

/**
 * One role, or null when it genuinely does not exist.
 *
 * `apiFind` rather than `apiGet`: a detail page must not render "not found"
 * because of a transient 502, because ISR would cache that 404 and the page
 * would stay missing long after the API recovered. Only a real 404 returns
 * null; anything else throws to the error boundary.
 */
export async function getJob(slug: string): Promise<Job | null> {
  return apiFind<Job>(`/api/jobs/${encodeURIComponent(slug)}`, {
    revalidate: 300,
    tags: ["jobs", `job:${slug}`],
  });
}

/** Slugs and timestamps for the sitemap. */
export async function getJobIndex(): Promise<{ slug: string; updatedAt: string }[]> {
  return apiGet<{ slug: string; updatedAt: string }[]>("/api/jobs/index", [], {
    revalidate: 3600,
    tags: ["jobs"],
  });
}

/* -------------------------------------------------------------------------- */
/*  Blog                                                                       */
/* -------------------------------------------------------------------------- */

export interface PostList {
  items: PostSummary[];
  page: number;
  pageCount: number;
  total: number;
  /** Only present on an unfiltered first page. */
  featured: PostSummary | null;
}

const EMPTY_LIST: PostList = {
  items: [],
  page: 1,
  pageCount: 1,
  total: 0,
  featured: null,
};

export async function getPosts({
  category = "",
  page = 1,
  limit = 9,
}: { category?: string; page?: number; limit?: number } = {}): Promise<PostList> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (page > 1) params.set("page", String(page));
  params.set("limit", String(limit));

  return apiGet<PostList>(`/api/posts?${params.toString()}`, EMPTY_LIST, {
    revalidate: 300,
    tags: ["posts"],
  });
}

/** Strict: a transient failure must throw, not cache a 404. See `apiFind`. */
export async function getPost(slug: string): Promise<Post | null> {
  return apiFind<Post>(`/api/posts/${encodeURIComponent(slug)}`, {
    revalidate: 300,
    tags: ["posts", `post:${slug}`],
  });
}

export async function getPostCategories(): Promise<PostCategory[]> {
  return apiGet<PostCategory[]>("/api/post-categories", [], {
    revalidate: 1800,
    tags: ["posts"],
  });
}

export async function getPostIndex(): Promise<{ slug: string; updatedAt: string }[]> {
  return apiGet<{ slug: string; updatedAt: string }[]>("/api/posts/index", [], {
    revalidate: 3600,
    tags: ["posts"],
  });
}
