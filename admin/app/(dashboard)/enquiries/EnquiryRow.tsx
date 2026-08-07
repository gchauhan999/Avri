"use client";

import { useState, useTransition } from "react";
import { Badge, Button, Td } from "../../../components/ui";
import { formatDateTime, timeAgo } from "../../../lib/format";
import {
  deleteEnquiry,
  resendEnquiry,
  saveEnquiryNotes,
  setEnquiryStatus,
} from "../../actions/enquiries";
import type { Enquiry } from "./page";

const STATUS_TONE: Record<Enquiry["status"], "amber" | "blue" | "green" | "red" | "neutral"> = {
  new: "amber",
  contacted: "blue",
  quoted: "blue",
  won: "green",
  lost: "neutral",
  spam: "red",
};

const LABEL: Record<Enquiry["status"], string> = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  won: "Won",
  lost: "Lost",
  spam: "Spam",
};

/**
 * One row, expandable.
 *
 * The quote form has twelve optional fields, so showing everything inline
 * would make the table unreadable. The row carries what you scan for and the
 * detail opens underneath.
 */
export default function EnquiryRow({
  enquiry,
  statuses,
}: {
  enquiry: Enquiry;
  statuses: Enquiry["status"][];
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

  const about = enquiry.subject || enquiry.service || (enquiry.kind === "quote_request" ? "Quote request" : "General enquiry");

  const detail: [string, string | null][] = [
    ["Email", enquiry.email],
    ["Company", enquiry.company],
    ["Service", enquiry.service],
    ["Industry", enquiry.industry],
    ["Product", enquiry.product],
    ["Site location", enquiry.location],
    ["Capacity", enquiry.capacity],
    ["Budget", enquiry.budget],
    ["Timeline", enquiry.timeline],
    ["Submitted from", enquiry.sourcePage],
    ["Received", formatDateTime(enquiry.createdAt)],
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
            {enquiry.name}
          </button>
          {enquiry.kind === "quote_request" ? (
            <span className="ml-2 text-xs text-ink-400">Quote</span>
          ) : null}
        </Td>

        <Td>
          <a href={`tel:${enquiry.phone.replace(/[^\d+]/g, "")}`} className="hover:text-brand-600">
            {enquiry.phone}
          </a>
        </Td>

        <Td className="max-w-xs truncate">{about}</Td>

        <Td className="whitespace-nowrap text-ink-500">{timeAgo(enquiry.createdAt)}</Td>

        <Td>
          <div className="flex items-center gap-2">
            <Badge tone={STATUS_TONE[enquiry.status]}>{LABEL[enquiry.status]}</Badge>
            {/* A failed notification means somebody is waiting on an email that
                never arrived. The record is safe, but say so plainly. */}
            {enquiry.emailStatus === "failed" ? <Badge tone="red">Email failed</Badge> : null}
          </div>
        </Td>

        <Td className="text-right">
          <select
            aria-label={`Status for ${enquiry.name}`}
            value={enquiry.status}
            disabled={pending}
            onChange={(e) => run(() => setEnquiryStatus(enquiry.id, e.target.value))}
            className="h-8 rounded-lg border border-ink-200 bg-white px-2 text-xs font-semibold text-ink-700 focus:border-brand-500 focus:outline-none disabled:opacity-60"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {LABEL[s]}
              </option>
            ))}
          </select>
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
                    <dd className="font-medium text-ink-800">{value}</dd>
                  </div>
                ))}
            </dl>

            <div className="mt-4 rounded-lg border border-ink-200 bg-white p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
                Message
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-800">
                {enquiry.message}
              </p>
            </div>

            <NotesBox
              id={enquiry.id}
              initial={enquiry.adminNotes ?? ""}
              onError={setError}
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {enquiry.email ? (
                <a
                  href={`mailto:${enquiry.email}`}
                  className="inline-flex h-9 items-center rounded-lg border border-ink-200 bg-white px-3 text-sm font-semibold text-ink-700 hover:border-ink-300"
                >
                  Reply by email
                </a>
              ) : null}

              {enquiry.emailStatus === "failed" ? (
                <Button
                  variant="secondary"
                  className="h-9"
                  disabled={pending}
                  onClick={() => run(() => resendEnquiry(enquiry.id))}
                >
                  Resend notification
                </Button>
              ) : null}

              <Button
                variant="danger"
                className="h-9"
                disabled={pending}
                onClick={() => {
                  if (confirm(`Delete the enquiry from ${enquiry.name}? This cannot be undone.`)) {
                    run(() => deleteEnquiry(enquiry.id));
                  }
                }}
              >
                Delete
              </Button>
            </div>

            {enquiry.emailStatus === "failed" && enquiry.emailError ? (
              <p className="mt-3 text-xs text-ink-400">Last error: {enquiry.emailError}</p>
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
        htmlFor={`notes-${id}`}
        className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-400"
      >
        Internal notes
      </label>
      <textarea
        id={`notes-${id}`}
        rows={2}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        placeholder="Called on 7 Aug, sending a quote Monday…"
      />
      <div className="mt-2 flex items-center gap-3">
        <Button
          variant="secondary"
          className="h-8"
          disabled={pending || value === initial}
          onClick={() => {
            onError(null);
            startTransition(async () => {
              const result = await saveEnquiryNotes(id, value);
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
