/**
 * Display formatting.
 *
 * The time zone is pinned. Without it the server (UTC) and the browser (IST)
 * format the same timestamp differently and React logs a hydration mismatch —
 * and an enquiry that arrived at 00:30 IST shows yesterday's date.
 */

const DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const DATE_TIME = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "Asia/Kolkata",
});

/** MySQL hands back "2026-08-07 11:04:22" — parsed as UTC, as it is stored. */
function toDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  return new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
}

export const formatDate = (value: string | Date) => DATE.format(toDate(value));
export const formatDateTime = (value: string | Date) => DATE_TIME.format(toDate(value));

/** "3 hours ago", falling back to a date once it stops being useful. */
export function timeAgo(value: string | Date): string {
  const then = toDate(value).getTime();
  const seconds = Math.round((Date.now() - then) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return formatDate(value);
}

export const bytes = (n: number) =>
  n < 1024 * 1024 ? `${Math.round(n / 1024)} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
