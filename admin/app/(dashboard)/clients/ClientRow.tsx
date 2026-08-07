"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Badge, Button, Td } from "../../../components/ui";
import { formatDate } from "../../../lib/format";
import { deleteClient, setClientPublished } from "../../actions/clients";
import type { AdminClient } from "./page";

export default function ClientRow({ client }: { client: AdminClient }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (fn: () => Promise<{ ok?: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await fn();
      if (result.error) setError(result.error);
    });
  };

  return (
    <>
      <tr>
        <Td>
          <div className="flex h-10 w-20 items-center justify-center rounded border border-ink-100 bg-white p-1">
            {client.logo ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={client.logo} alt="" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="text-[10px] uppercase tracking-wide text-ink-300">No logo</span>
            )}
          </div>
        </Td>

        <Td>
          <Link
            href={`/clients/${client.id}`}
            className="font-semibold text-ink-900 hover:text-brand-600"
          >
            {client.name}
          </Link>
          {client.websiteUrl ? (
            <span className="mt-0.5 block truncate text-xs text-ink-400">{client.websiteUrl}</span>
          ) : null}
        </Td>

        <Td className="text-ink-500">{client.sector ?? "—"}</Td>

        <Td>
          {client.isAuthorized ? (
            <>
              <Badge tone="green">Authorised</Badge>
              {client.authorizedAt ? (
                <span className="mt-1 block text-xs text-ink-400">
                  {formatDate(client.authorizedAt)}
                </span>
              ) : null}
            </>
          ) : (
            <Badge tone="neutral">Not authorised</Badge>
          )}
        </Td>

        <Td>
          {/*
            The switch is the whole point of this screen, so it is inline rather
            than buried in an edit form. Turning it on for an unauthorised
            client is refused by the API and by a database CHECK constraint —
            the message below is that refusal, made readable.
          */}
          <label className="inline-flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={client.isPublished}
              disabled={pending || !client.isAuthorized}
              onChange={(e) => run(() => setClientPublished(client.id, e.target.checked))}
              className="h-4 w-4 rounded border-ink-300 text-brand-500 focus:ring-brand-500 disabled:opacity-40"
            />
            <span className={`text-sm ${client.isPublished ? "text-ink-800" : "text-ink-400"}`}>
              {client.isPublished ? "Live" : "Hidden"}
            </span>
          </label>
          {!client.isAuthorized ? (
            <span className="mt-1 block text-xs text-ink-400">Authorise it first</span>
          ) : null}
        </Td>

        <Td className="text-right">
          <div className="flex justify-end gap-2">
            <Link
              href={`/clients/${client.id}`}
              className="inline-flex h-8 items-center rounded-lg border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-700 hover:border-ink-300"
            >
              Edit
            </Link>
            <Button
              variant="danger"
              className="h-8 px-3 text-xs"
              disabled={pending}
              onClick={() => {
                if (confirm(`Delete ${client.name}? This also removes the logo file.`)) {
                  run(() => deleteClient(client.id));
                }
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
