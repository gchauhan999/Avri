"use client";

import type { ReactNode } from "react";
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
}: {
  label: string;
  name: string;
  state: FormState;
  options: string[];
  required?: boolean;
  className?: string;
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
        defaultValue={state.values?.[name] ?? ""}
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
