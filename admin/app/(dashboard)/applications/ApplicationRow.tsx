"use client";

import { useState, useTransition } from "react";
import { Badge, Button, Td } from "../../../components/ui";
import { bytes, formatDateTime, timeAgo } from "../../../lib/format";
import {
  deleteApplication,
  resendApplication,
  saveApplicationNotes,
  setApplicationStatus,
} from "../../actions/applications";
import type { Application } from "./page";

const TONE: Record<Application["status"], "amber" | "blue" | "green" | "red" | "neutral"> = {
  new: "amber",
  shortlisted: "blue",
  interviewing: "blue",
  rejected: "neutral",
  hired: "green",
};

const LABEL: Record<Application["status"], string> = {
  new: "New",
  shortlisted: "Shortlisted",
  interviewing: "Interviewing",
  rejected: "Rejected",
  hired: "Hired",
};

export default function ApplicationRow({
  application,
  statuses,
}: {
  application: Application;
  statuses: Application["status"][];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ ok?: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) setError(result.error);
    });
  };

  const detail: [string, string | null][] = [
    ["Email", application.email],
    ["Phone", application.phone],
    ["Location", application.currentLocation],
    ["Current company", application.currentCompany],
    ["Notice period", application.noticePeriod],
    ["LinkedIn", application.linkedinUrl],
    ["Applied", formatDateTime(application.createdAt)],
    ["CV file", `${application.resumeOriginalName} · ${bytes(application.resumeSizeBytes)}`],
  ];

  return (
    <>
      <tr className={open ? "bg-ink-50" : undefined}>
        <Td>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="text-left font-semibold text-ink-900 hover:text-brand-600"
          >
            {application.fullName}
          </button>
          <span className="mt-0.5 block truncate text-xs text-ink-400">{application.email}</span>
        </Td>

        <Td className="text-ink-500">{application.jobTitle}</Td>

        <Td className="whitespace-nowrap text-ink-500">
          {application.experienceYears ? `${Number(application.experienceYears)} yrs` : "—"}
        </Td>

        <Td className="whitespace-nowrap text-ink-500">{timeAgo(application.createdAt)}</Td>

        <Td>
          <div className="flex flex-col items-start gap-1">
            <Badge tone={TONE[application.status]}>{LABEL[application.status]}</Badge>
            {application.emailStatus === "failed" ? <Badge tone="red">Email failed</Badge> : null}
          </div>
        </Td>

        <Td className="text-right">
          {/*
            A plain link, not a fetch, so the browser saves the file itself and
            no CV is buffered in the tab.

            It points at this app's own route rather than the API, because the
            API refuses anything without the `X-Admin-Request` header and a
            navigation cannot send one. `app/downloads/…/resume/route.ts` adds
            it server-side and streams the response through.
          */}
          <a
            href={`/admin/downloads/applications/${application.id}/resume`}
            className="inline-flex h-8 items-center rounded-lg bg-brand-500 px-3 text-xs font-semibold text-white hover:bg-brand-600"
          >
            Download CV
          </a>
        </Td>
      </tr>

      {open ? (
        <tr className="bg-ink-50">
          <td colSpan={6} className="border-b border-ink-100 px-4 pb-5 pt-1">
            {error ? (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {error}
              </p>
            ) : null}

            <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {detail
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="flex gap-2 text-sm">
                    <dt className="shrink-0 text-ink-400">{label}</dt>
                    <dd className="min-w-0 break-words font-medium text-ink-800">{value}</dd>
                  </div>
                ))}
            </dl>

            {application.coverLetter ? (
              <div className="mt-4 rounded-lg border border-ink-200 bg-white p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Their message
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-800">
                  {application.coverLetter}
                </p>
              </div>
            ) : null}

            <NotesBox
              id={application.id}
              initial={application.adminNotes ?? ""}
              onError={setError}
            />

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <label className="text-sm text-ink-500">
                Status
                <select
                  value={application.status}
                  disabled={pending}
                  onChange={(e) => run(() => setApplicationStatus(application.id, e.target.value))}
                  className="ml-2 h-9 rounded-lg border border-ink-200 bg-white px-2 text-sm font-semibold text-ink-700 focus:border-brand-500 focus:outline-none disabled:opacity-60"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {LABEL[s]}
                    </option>
                  ))}
                </select>
              </label>

              <a
                href={`mailto:${application.email}?subject=${encodeURIComponent(
                  `Your application — ${application.jobTitle}`
                )}`}
                className="inline-flex h-9 items-center rounded-lg border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-700 hover:border-ink-300"
              >
                Email them
              </a>

              <a
                href={`tel:${application.phone.replace(/[^\d+]/g, "")}`}
                className="inline-flex h-9 items-center rounded-lg border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-700 hover:border-ink-300"
              >
                Call
              </a>

              {application.emailStatus === "failed" ? (
                <Button
                  variant="secondary"
                  className="h-9"
                  disabled={pending}
                  onClick={() => run(() => resendApplication(application.id))}
                >
                  Resend to HR
                </Button>
              ) : null}

              <Button
                variant="danger"
                className="ml-auto h-9"
                disabled={pending}
                onClick={() => {
                  if (
                    confirm(
                      `Delete ${application.fullName}'s application? Their CV file is deleted too. This cannot be undone.`
                    )
                  ) {
                    run(() => deleteApplication(application.id));
                  }
                }}
              >
                Delete
              </Button>
            </div>

            {application.emailStatus === "failed" && application.emailError ? (
              <p className="mt-3 text-xs text-ink-400">Last error: {application.emailError}</p>
            ) : null}
          </td>
        </tr>
      ) : null}
    </>
  );
}

function NotesBox({
  id,
  initial,
  onError,
}: {
  id: number;
  initial: string;
  onError: (message: string | null) => void;
}) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-4">
      <label
        htmlFor={`app-notes-${id}`}
        className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400"
      >
        Internal notes
      </label>
      <textarea
        id={`app-notes-${id}`}
        rows={2}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        placeholder="Spoke on 7 Aug, scheduling a technical round…"
        className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
      />
      <div className="mt-2 flex items-center gap-3">
        <Button
          variant="secondary"
          className="h-8"
          disabled={pending || value === initial}
          onClick={() => {
            onError(null);
            startTransition(async () => {
              const result = await saveApplicationNotes(id, value);
              if (result.error) onError(result.error);
              else setSaved(true);
            });
          }}
        >
          {pending ? "Saving…" : "Save notes"}
        </Button>
        {saved ? <span className="text-xs text-brand-600">Saved</span> : null}
      </div>
    </div>
  );
}
