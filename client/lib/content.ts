/**
 * Reading database-backed content from the API.
 *
 * Each function carries its own cache tag, so `/api/revalidate` can drop
 * exactly what changed when something is published in the admin panel.
 */

import { apiFind, apiGet } from "./api";
import type { Client, Job, JobSummary } from "./types";

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
