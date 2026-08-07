"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Alert, Button, ButtonLink, Card, Input } from "../../../components/ui";
import ImageUpload from "../../../components/ImageUpload";
import { createClient, updateClient, type ClientFormState } from "../../actions/clients";
import type { AdminClient } from "./page";

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : isNew ? "Add client" : "Save changes"}
    </Button>
  );
}

export default function ClientForm({ client }: { client?: AdminClient }) {
  const isNew = !client;
  const router = useRouter();

  const action = isNew ? createClient : updateClient.bind(null, client.id);
  const [state, formAction] = useActionState<ClientFormState, FormData>(action, {});

  // Authorisation drives the rest of the form, so it is controlled.
  const [authorized, setAuthorized] = useState(client?.isAuthorized ?? false);

  useEffect(() => {
    if (state.ok) router.push("/clients");
  }, [state.ok, router]);

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <Card className="space-y-5 p-6">
        <Input
          label="Client name"
          name="name"
          required
          defaultValue={client?.name ?? ""}
          error={state.fields?.name}
          placeholder="Uttar Pradesh Power Corporation Ltd"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Sector"
            name="sector"
            defaultValue={client?.sector ?? ""}
            error={state.fields?.sector}
            placeholder="State utility"
          />
          <Input
            label="Website"
            name="websiteUrl"
            type="url"
            defaultValue={client?.websiteUrl ?? ""}
            error={state.fields?.websiteUrl}
            placeholder="https://example.com"
          />
        </div>

        <ImageUpload
          endpoint="/api/admin/clients/logo"
          label="Logo"
          hint="PNG, JPEG or WebP · up to 3 MB · transparent background works best"
          initial={
            client?.logoPath && client.logo
              ? {
                  path: client.logoPath,
                  url: client.logo,
                  width: client.logoWidth,
                  height: client.logoHeight,
                }
              : null
          }
        />

        <Input
          label="Display order"
          name="sortOrder"
          type="number"
          defaultValue={String(client?.sortOrder ?? 0)}
          hint="Lower numbers appear first. Ties fall back to alphabetical."
          error={state.fields?.sortOrder}
          className="max-w-40"
        />
      </Card>

      {/*
        Separated from the details above on purpose. This is a legal
        declaration, not a display preference, and it should not read like one.
      */}
      <Card className="space-y-5 border-accent-200 bg-accent-50/40 p-6">
        <div>
          <h2 className="text-sm font-bold text-ink-900">Permission to display</h2>
          <p className="mt-1 text-sm text-ink-600">
            Only tick this if you hold written permission from the client to show their name and
            logo. Their logo is their trademark; publishing it without consent is a real risk to the
            company.
          </p>
        </div>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="isAuthorized"
            checked={authorized}
            onChange={(e) => setAuthorized(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm font-semibold text-ink-800">
            We have written permission to display this client
          </span>
        </label>

        <Input
          label="How permission was given"
          name="authorizationNote"
          required={authorized}
          disabled={!authorized}
          defaultValue={client?.authorizationNote ?? ""}
          error={state.fields?.authorizationNote}
          placeholder="Email from R. Kumar (Procurement), 4 March 2026"
          hint="Recorded so anyone can check later who approved this, and when."
        />

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={client?.isPublished ?? false}
            disabled={!authorized}
            className="mt-0.5 h-4 w-4 rounded border-ink-300 text-brand-500 focus:ring-brand-500 disabled:opacity-40"
          />
          <span className="text-sm text-ink-800">
            Show on the website
            {!authorized ? (
              <span className="ml-2 text-xs text-ink-400">(authorise it first)</span>
            ) : null}
          </span>
        </label>

        {state.fields?.isPublished ? (
          <p className="text-xs font-medium text-red-600">{state.fields.isPublished}</p>
        ) : null}
      </Card>

      <div className="flex items-center gap-3">
        <SubmitButton isNew={isNew} />
        <ButtonLink href="/clients" variant="secondary">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
