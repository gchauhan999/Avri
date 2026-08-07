/**
 * Display helpers for job listings.
 */

import type { EmploymentType, JobSummary } from "./types";

const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
};

/** Google's JobPosting vocabulary, which differs from ours. */
export const EMPLOYMENT_SCHEMA: Record<EmploymentType, string> = {
  full_time: "FULL_TIME",
  part_time: "PART_TIME",
  contract: "CONTRACTOR",
  internship: "INTERN",
};

export const employmentLabel = (type: EmploymentType) => EMPLOYMENT_LABELS[type] ?? "Full-time";

export function experienceLabel(job: Pick<JobSummary, "experienceMin" | "experienceMax">): string {
  const { experienceMin: min, experienceMax: max } = job;
  if (min === null && max === null) return "";
  if (min !== null && max !== null) {
    return min === 0 && max === 0 ? "Fresher" : `${min}–${max} years`;
  }
  if (min !== null) return min === 0 ? "Fresher welcome" : `${min}+ years`;
  return `Up to ${max} years`;
}

/**
 * Time zone pinned to Asia/Kolkata. Without it the server (UTC) and the
 * browser (IST) can format the same date differently, which React reports as
 * a hydration mismatch.
 */
const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

/** MySQL DATETIME comes back as "2026-08-07 11:04:22" and is stored in UTC. */
function toDate(value: string): Date {
  return new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
}

export const formatDate = (value: string) => DATE.format(toDate(value));

/** "Posted today" for a while, then the date — vague ages read as stale. */
export function postedAgo(value: string): string {
  const days = Math.floor((Date.now() - toDate(value).getTime()) / 86_400_000);
  if (days <= 0) return "Posted today";
  if (days === 1) return "Posted yesterday";
  if (days < 30) return `Posted ${days} days ago`;
  return `Posted ${formatDate(value)}`;
}
