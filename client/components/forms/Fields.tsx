"use client";

import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import type { FormState } from "@/lib/enquiry";

const control =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-300 transition-colors focus:outline-none";

const border = (error?: string) =>
  error
    ? "border-red-400 focus:border-red-500"
    : "border-ink-200 focus:border-brand-500";

function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink-800">
      {children}
      {required ? (
        <span className="text-accent-600" aria-hidden="true">
          {" "}
          *
        </span>
      ) : null}
    </label>
  );
}

function ErrorText({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-red-600">
      {error}
    </p>
  );
}

export function Field({
  label,
  name,
  state,
  type = "text",
  required,
  placeholder,
  autoComplete,
  inputMode,
  defaultValue = "",
  className = "",
}: {
  label: string;
  name: string;
  state: FormState;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "email" | "url" | "numeric";
  /** Pre-filled value, used before the form has been submitted once. */
  defaultValue?: string;
  className?: string;
}) {
  const error = state.errors?.[name];
  return (
    <div className={className}>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        defaultValue={state.values?.[name] ?? defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`mt-2 ${control} ${border(error)}`}
      />
      <ErrorText id={`${name}-error`} error={error} />
    </div>
  );
}

export function SelectField({
  label,
  name,
  state,
  options,
  required,
  className = "",
  defaultValue,
}: {
  label: string;
  name: string;
  state: FormState;
  options: string[];
  required?: boolean;
  className?: string;
  /**
   * Pre-selected value, used before the form has been submitted once. The
   * apply form needs it to prefill the position from `?job=`; a value echoed
   * back after a failed submit still wins.
   */
  defaultValue?: string;
}) {
  const error = state.errors?.[name];
  return (
    <div className={className}>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <select
        id={name}
        name={name}
        defaultValue={state.values?.[name] ?? defaultValue ?? ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`mt-2 ${control} ${border(error)}`}
      >
        <option value="">Select an option</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ErrorText id={`${name}-error`} error={error} />
    </div>
  );
}

export function TextareaField({
  label,
  name,
  state,
  rows = 5,
  required,
  placeholder,
  className = "",
}: {
  label: string;
  name: string;
  state: FormState;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const error = state.errors?.[name];
  return (
    <div className={className}>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        defaultValue={state.values?.[name] ?? ""}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`mt-2 resize-y ${control} ${border(error)}`}
      />
      <ErrorText id={`${name}-error`} error={error} />
    </div>
  );
}

/** Hidden field that automated submissions tend to fill in. */
/** Accepted CV formats, shared with `submitApplication` and the server. */
export const RESUME_ACCEPT = ".pdf,.doc,.docx";
export const RESUME_MAX_MB = 5;

/**
 * File input for the CV upload.
 *
 * Same contract as the fields above — uncontrolled, error from
 * `state.errors[name]`, `aria-invalid` and `aria-describedby` — so it drops
 * into a form the same way. The real `<input type="file">` stays in the DOM
 * and stays uncontrolled, which is what lets `new FormData(form)` pick the
 * file up with no extra wiring.
 *
 * One thing that cannot work like the others: `state.values` cannot restore a
 * file after a failed submit, because browsers forbid writing `input.files`.
 * It does not matter in practice — on error the form stays mounted (only
 * success swaps in `FormSuccess`), so the input keeps its selection. Please
 * don't "fix" this by making it controlled.
 */
export function FileField({
  label,
  name,
  state,
  required,
  accept = RESUME_ACCEPT,
  maxSizeMb = RESUME_MAX_MB,
  hint = "PDF, DOC or DOCX · up to 5 MB",
  className = "",
}: {
  label: string;
  name: string;
  state: FormState;
  required?: boolean;
  accept?: string;
  maxSizeMb?: number;
  hint?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [local, setLocal] = useState("");
  const [dragging, setDragging] = useState(false);

  // A server-side error wins over anything we caught locally.
  const error = state.errors?.[name] ?? (local || undefined);
  const describedBy = error ? `${name}-error` : `${name}-hint`;

  const extensions = accept.split(",").map((a) => a.trim().toLowerCase());

  function problemWith(candidate: File): string {
    const ext = `.${candidate.name.split(".").pop()?.toLowerCase() ?? ""}`;
    // Checked on extension, not MIME type: Windows reports an empty `type` for
    // some .doc files, so the MIME check would reject a perfectly good CV.
    if (!extensions.includes(ext)) {
      return `Attach a ${extensions.map((e) => e.replace(".", "").toUpperCase()).join(", ")} file.`;
    }
    if (candidate.size > maxSizeMb * 1024 * 1024) {
      return `That file is over ${maxSizeMb} MB. Please attach a smaller one.`;
    }
    return "";
  }

  function take(next: File | null) {
    if (!next) {
      setFile(null);
      setLocal("");
      return;
    }
    const problem = problemWith(next);
    setLocal(problem);
    setFile(problem ? null : next);
  }

  function clear() {
    // `input.files` is read-only; clearing the value is the only way.
    if (inputRef.current) inputRef.current.value = "";
    setFile(null);
    setLocal("");
  }

  const sizeLabel = file
    ? file.size < 1024 * 1024
      ? `${Math.round(file.size / 1024)} KB`
      : `${(file.size / 1024 / 1024).toFixed(1)} MB`
    : "";

  return (
    <div className={className}>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>

      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept={accept}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={(event) => take(event.target.files?.[0] ?? null)}
        className="sr-only"
      />

      {file ? (
        <div className="mt-2 flex items-center justify-between gap-4 rounded-xl border border-ink-200 bg-white px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900">{file.name}</p>
            <p className="text-xs text-ink-400">{sizeLabel}</p>
          </div>
          <button
            type="button"
            onClick={clear}
            className="shrink-0 text-sm font-semibold text-ink-500 transition-colors hover:text-red-600"
          >
            Remove
          </button>
        </div>
      ) : (
        <label
          htmlFor={name}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            const dropped = event.dataTransfer.files?.[0];
            if (!dropped) return;
            // Assign through DataTransfer so the uncontrolled input really
            // holds the file and FormData picks it up on submit.
            if (inputRef.current) inputRef.current.files = event.dataTransfer.files;
            take(dropped);
          }}
          className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-8 text-center transition-colors ${
            dragging
              ? "border-brand-500 bg-brand-50"
              : error
                ? "border-red-400 bg-white"
                : "border-ink-200 bg-white hover:border-brand-500"
          }`}
        >
          <span className="text-sm font-semibold text-ink-800">
            Choose a file or drag it here
          </span>
          <span className="mt-1 text-xs text-ink-400">{hint}</span>
        </label>
      )}

      {error ? (
        <ErrorText id={`${name}-error`} error={error} />
      ) : (
        <p id={`${name}-hint`} className="mt-1.5 text-xs text-ink-400">
          {hint}
        </p>
      )}
    </div>
  );
}

export function Honeypot() {
  return (
    <div className="hidden" aria-hidden="true">
      <label htmlFor="company_website">Leave this field empty</label>
      <input
        id="company_website"
        name="company_website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}

/**
 * `pending` is passed in rather than read from `useFormStatus`, because the
 * forms submit through an `onSubmit` handler now — there is no server action
 * for that hook to observe on a statically exported site.
 */
export function SubmitButton({
  children,
  pending = false,
}: {
  children: ReactNode;
  pending?: boolean;
}) {
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Sending…
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export function FormAlert({ state }: { state: FormState }) {
  if (state.status === "idle") return null;

  const ok = state.status === "success";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-xl border px-5 py-4 text-sm ${
        ok
          ? "border-brand-200 bg-brand-50 text-brand-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {state.message}
    </div>
  );
}

/** Shared success panel shown once a form has been accepted. */
export function FormSuccess({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-brand-200 bg-brand-50 p-10 text-center">
      <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-7 w-7"
        >
          <path d="m5 12.5 5 5 9-10" />
        </svg>
      </span>
      <h3 className="mt-6 text-xl font-bold text-ink-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-600">
        {message}
      </p>
      {children}
    </div>
  );
}
