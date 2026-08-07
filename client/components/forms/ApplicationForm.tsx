"use client";

import { useState, type FormEvent } from "react";
import {
  Field,
  FileField,
  FormAlert,
  FormSuccess,
  Honeypot,
  SelectField,
  SubmitButton,
  TextareaField,
} from "@/components/forms/Fields";
import { initialFormState, submitApplication } from "@/lib/enquiry";
import { contact } from "@/lib/site";
import type { JobSummary } from "@/lib/types";
import { useQueryParam } from "@/lib/use-query-param";

const EXPERIENCE = [
  "Fresher",
  "0 – 2 years",
  "2 – 5 years",
  "5 – 10 years",
  "10+ years",
];

/**
 * Apply for a role.
 *
 * Mounted in two places with the same code: inline at the bottom of a job
 * page (`job` supplied) and standalone at `/careers/apply` (`jobs` supplied,
 * with the role chosen from a dropdown or prefilled from `?job=`).
 */
export default function ApplicationForm({
  job,
  jobs = [],
}: {
  /** Set when embedded on a specific role's page. */
  job?: JobSummary;
  /** All open roles, for the standalone page's dropdown. */
  jobs?: JobSummary[];
}) {
  const [state, setState] = useState(initialFormState);
  const [pending, setPending] = useState(false);

  /**
   * `?job=<slug>` read in the browser via useQueryParam rather than
   * useSearchParams — the same trick QuoteForm uses for `?product=`. It reads
   * an empty snapshot on the server so the prerendered HTML matches, which
   * avoids both a hydration mismatch and the Suspense boundary that
   * useSearchParams would force on a prerendered page.
   */
  const slugFromQuery = useQueryParam("job");
  const matched = job ?? jobs.find((j) => j.slug === slugFromQuery);
  const prefill = matched?.title ?? "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState(await submitApplication(new FormData(event.currentTarget)));
    setPending(false);
  }

  if (state.status === "success") {
    return (
      <FormSuccess title="Application received" message={state.message}>
        <p className="mt-4 text-sm text-ink-500">
          You do not need to send your CV again. If you need to add anything, write to{" "}
          <a
            href={`mailto:${contact.careersEmail}`}
            className="font-semibold text-brand-600 hover:underline"
          >
            {contact.careersEmail}
          </a>
          .
        </p>
      </FormSuccess>
    );
  }

  const positionOptions = jobs.map((j) => j.title);
  const showDropdown = !job && positionOptions.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <FormAlert state={state} />

      {/* Links the application to the role without matching on title text. */}
      <input type="hidden" name="jobSlug" value={matched?.slug ?? slugFromQuery ?? ""} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="name" state={state} required autoComplete="name" />
        <Field
          label="Mobile number"
          name="phone"
          state={state}
          type="tel"
          inputMode="tel"
          required
          autoComplete="tel"
          placeholder="98765 43210"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Email"
          name="email"
          state={state}
          type="email"
          inputMode="email"
          required
          autoComplete="email"
        />

        {job ? (
          // The role is fixed by the page it is on, so it is shown read-only
          // rather than as an editable field that could disagree with the URL.
          <div>
            <span className="block text-sm font-semibold text-ink-800">Applying for</span>
            <p className="mt-2 rounded-xl border border-ink-100 bg-ink-50/60 px-4 py-3 text-sm font-semibold text-ink-800">
              {job.title}
            </p>
            <input type="hidden" name="position" value={job.title} />
          </div>
        ) : showDropdown ? (
          <SelectField
            label="Role"
            name="position"
            state={state}
            required
            options={[...positionOptions, "Other / speculative application"]}
            // Remount once the query string resolves after hydration, so the
            // prefill actually takes.
            key={prefill}
            defaultValue={prefill}
          />
        ) : (
          <Field
            label="Role you are interested in"
            name="position"
            state={state}
            required
            key={prefill}
            defaultValue={prefill}
            placeholder="Site Engineer"
          />
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField label="Experience" name="experience" state={state} options={EXPERIENCE} />
        <Field
          label="Current location"
          name="currentLocation"
          state={state}
          placeholder="Ghaziabad"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Current company" name="currentCompany" state={state} />
        <Field
          label="Notice period"
          name="noticePeriod"
          state={state}
          placeholder="Immediate / 30 days"
        />
      </div>

      <FileField label="Your CV" name="resume" state={state} required />

      <TextareaField
        label="Anything you would like to add"
        name="message"
        state={state}
        rows={4}
        placeholder="A line or two on why this role suits you."
      />

      <Honeypot />

      <div className="flex flex-wrap items-center gap-4 pt-1">
        <SubmitButton pending={pending}>Submit Application</SubmitButton>
        <p className="text-xs text-ink-400">
          Or email your CV to{" "}
          <a href={`mailto:${contact.careersEmail}`} className="font-semibold hover:text-brand-600">
            {contact.careersEmail}
          </a>
          .
        </p>
      </div>
    </form>
  );
}
