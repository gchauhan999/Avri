"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { Alert, Button, ButtonLink, Card, Input, Select, Textarea } from "../../../components/ui";
import { createJob, updateJob, type JobFormState } from "../../actions/jobs";

export interface JobDetail {
  id: number;
  title: string;
  department: string | null;
  location: string;
  employmentType: "full_time" | "part_time" | "contract" | "internship";
  experienceMin: number | null;
  experienceMax: number | null;
  openings: number;
  salaryRange: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryPeriod: "month" | "year" | null;
  summary: string;
  description: string;
  responsibilities: string[] | null;
  requirements: string[] | null;
  status: "draft" | "open" | "closed";
  closesAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : isNew ? "Create role" : "Save changes"}
    </Button>
  );
}

const TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
];

const STATUSES = [
  { value: "draft", label: "Draft — not visible on the site" },
  { value: "open", label: "Open — live on the careers page" },
  { value: "closed", label: "Closed — removed from the site" },
];

export default function JobForm({ job }: { job?: JobDetail }) {
  const isNew = !job;
  const router = useRouter();

  const action = isNew ? createJob : updateJob.bind(null, job.id);
  const [state, formAction] = useActionState<JobFormState, FormData>(action, {});

  useEffect(() => {
    if (state.ok) router.push("/jobs");
  }, [state.ok, router]);

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <Card className="space-y-5 p-6">
        <Input
          label="Job title"
          name="title"
          required
          defaultValue={job?.title ?? ""}
          error={state.fields?.title}
          placeholder="Site Engineer — Substations"
          hint="The URL is generated from this. Changing it later changes the URL."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Department"
            name="department"
            defaultValue={job?.department ?? ""}
            error={state.fields?.department}
            placeholder="Projects"
          />
          <Input
            label="Location"
            name="location"
            required
            defaultValue={job?.location ?? ""}
            error={state.fields?.location}
            placeholder="Ghaziabad, Uttar Pradesh"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Select
            label="Type"
            name="employmentType"
            options={TYPES}
            defaultValue={job?.employmentType ?? "full_time"}
          />
          <Input
            label="Openings"
            name="openings"
            type="number"
            min={1}
            defaultValue={String(job?.openings ?? 1)}
            error={state.fields?.openings}
          />
          <Input
            label="Applications close"
            name="closesAt"
            type="date"
            defaultValue={job?.closesAt ?? ""}
            error={state.fields?.closesAt}
            hint="Optional. After this the role disappears from the site."
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Experience from (years)"
            name="experienceMin"
            type="number"
            min={0}
            max={60}
            defaultValue={job?.experienceMin === null ? "" : String(job?.experienceMin ?? "")}
            error={state.fields?.experienceMin}
          />
          <Input
            label="Experience to (years)"
            name="experienceMax"
            type="number"
            min={0}
            max={60}
            defaultValue={job?.experienceMax === null ? "" : String(job?.experienceMax ?? "")}
            error={state.fields?.experienceMax}
          />
        </div>
      </Card>

      <Card className="space-y-5 p-6">
        <Textarea
          label="One-line summary"
          name="summary"
          required
          rows={2}
          defaultValue={job?.summary ?? ""}
          error={state.fields?.summary}
          hint="Shown on the card and used as the page description in Google."
        />

        <Textarea
          label="About the role"
          name="description"
          required
          rows={8}
          defaultValue={job?.description ?? ""}
          error={state.fields?.description}
          hint="Plain text. Leave a blank line between paragraphs."
        />

        <Textarea
          label="What they'll do"
          name="responsibilities"
          rows={6}
          defaultValue={(job?.responsibilities ?? []).join("\n")}
          error={state.fields?.responsibilities}
          hint="One per line. Rendered as a bullet list."
        />

        <Textarea
          label="What we're looking for"
          name="requirements"
          rows={6}
          defaultValue={(job?.requirements ?? []).join("\n")}
          error={state.fields?.requirements}
          hint="One per line."
        />
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="text-sm font-bold text-ink-900">Salary</h2>
        <p className="-mt-3 text-sm text-ink-500">
          Optional. The figures feed the structured data that makes this role eligible for Google
          Jobs; the free-text range is what visitors see.
        </p>

        <Input
          label="Displayed range"
          name="salaryRange"
          defaultValue={job?.salaryRange ?? ""}
          error={state.fields?.salaryRange}
          placeholder="₹4 – 6 LPA"
        />

        <div className="grid gap-5 sm:grid-cols-3">
          <Input
            label="Minimum"
            name="salaryMin"
            type="number"
            min={0}
            defaultValue={job?.salaryMin === null ? "" : String(job?.salaryMin ?? "")}
          />
          <Input
            label="Maximum"
            name="salaryMax"
            type="number"
            min={0}
            defaultValue={job?.salaryMax === null ? "" : String(job?.salaryMax ?? "")}
          />
          <Select
            label="Per"
            name="salaryPeriod"
            options={[
              { value: "month", label: "Month" },
              { value: "year", label: "Year" },
            ]}
            defaultValue={job?.salaryPeriod ?? "month"}
          />
        </div>
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="text-sm font-bold text-ink-900">Search listing</h2>
        <p className="-mt-3 text-sm text-ink-500">
          Optional. Leave blank and the title and summary above are used.
        </p>

        <Input
          label="Page title"
          name="seoTitle"
          defaultValue={job?.seoTitle ?? ""}
          maxLength={200}
        />
        <Textarea
          label="Meta description"
          name="seoDescription"
          rows={2}
          maxLength={320}
          defaultValue={job?.seoDescription ?? ""}
        />
      </Card>

      <Card className="p-6">
        <Select
          label="Status"
          name="status"
          options={STATUSES}
          defaultValue={job?.status ?? "draft"}
          className="max-w-sm"
        />
      </Card>

      <div className="flex items-center gap-3">
        <SubmitButton isNew={isNew} />
        <ButtonLink href="/jobs" variant="secondary">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
