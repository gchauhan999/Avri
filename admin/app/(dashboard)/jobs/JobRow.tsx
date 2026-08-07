"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Badge, Button, Td } from "../../../components/ui";
import { formatDate } from "../../../lib/format";
import { deleteJob, setJobStatus } from "../../actions/jobs";
import type { AdminJob } from "./page";

const TYPE_LABEL: Record<AdminJob["employmentType"], string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
};

const STATUS_TONE = { draft: "neutral", open: "green", closed: "red" } as const;

export default function JobRow({ job }: { job: AdminJob }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ ok?: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) setError(result.error);
    });
  };

  // A closing date in the past means the role is already gone from the site,
  // even though the row still says "open". Worth flagging rather than leaving
  // someone to wonder why nobody is applying.
  const expired =
    job.status === "open" && job.closesAt !== null && new Date(job.closesAt) < new Date();

  return (
    <>
      <tr>
        <Td>
          <Link href={`/jobs/${job.id}`} className="font-semibold text-ink-900 hover:text-brand-600">
            {job.title}
          </Link>
          <span className="mt-0.5 block text-xs text-ink-400">
            {TYPE_LABEL[job.employmentType]}
            {job.openings > 1 ? ` · ${job.openings} openings` : ""}
            {job.publishedAt ? ` · posted ${formatDate(job.publishedAt)}` : ""}
          </span>
        </Td>

        <Td className="text-ink-500">{job.department ?? "—"}</Td>
        <Td className="text-ink-500">{job.location}</Td>

        <Td>
          {job.applicationCount > 0 ? (
            <Link
              href={`/applications?jobId=${job.id}`}
              className="font-semibold text-brand-600 hover:underline"
            >
              {job.applicationCount}
            </Link>
          ) : (
            <span className="text-ink-400">0</span>
          )}
        </Td>

        <Td>
          <div className="flex flex-col items-start gap-1">
            <Badge tone={STATUS_TONE[job.status]}>
              {job.status === "draft" ? "Draft" : job.status === "open" ? "Open" : "Closed"}
            </Badge>
            {expired ? <Badge tone="amber">Closing date passed</Badge> : null}
          </div>
        </Td>

        <Td className="text-right">
          <div className="flex justify-end gap-2">
            <select
              aria-label={`Status for ${job.title}`}
              value={job.status}
              disabled={pending}
              onChange={(e) =>
                run(() => setJobStatus(job.id, e.target.value as AdminJob["status"]))
              }
              className="h-8 rounded-lg border border-ink-200 bg-white px-2 text-xs font-semibold text-ink-700 focus:border-brand-500 focus:outline-none disabled:opacity-60"
            >
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>

            <Link
              href={`/jobs/${job.id}`}
              className="inline-flex h-8 items-center rounded-lg border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-700 hover:border-ink-300"
            >
              Edit
            </Link>

            <Button
              variant="danger"
              className="h-8 px-3 text-xs"
              disabled={pending}
              onClick={() => {
                const warning =
                  job.applicationCount > 0
                    ? `Delete "${job.title}"? Its ${job.applicationCount} application${
                        job.applicationCount === 1 ? "" : "s"
                      } will be kept — they stay under Applications with the role name recorded.`
                    : `Delete "${job.title}"?`;
                if (confirm(warning)) run(() => deleteJob(job.id));
              }}
            >
              Delete
            </Button>
          </div>
        </Td>
      </tr>

      {error ? (
        <tr>
          <td colSpan={6} className="border-b border-ink-100 bg-red-50 px-4 py-2">
            <p className="text-sm text-red-800">{error}</p>
          </td>
        </tr>
      ) : null}
    </>
  );
}
