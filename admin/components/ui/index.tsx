/**
 * The admin UI kit.
 *
 * One file on purpose: it is about a dozen small, boring components and they
 * are easier to keep visually consistent when they sit next to each other.
 * Nothing here is animated and nothing is clever — this is a tool for reading
 * tables, not a marketing page.
 */

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/* -------------------------------------------------------------------------- */
/*  Buttons                                                                    */
/* -------------------------------------------------------------------------- */

type Variant = "primary" | "secondary" | "danger" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 disabled:bg-brand-300",
  secondary: "border border-ink-200 bg-white text-ink-800 hover:border-ink-300 hover:bg-ink-50",
  danger: "border border-red-200 bg-white text-red-700 hover:border-red-300 hover:bg-red-50",
  ghost: "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
};

const BUTTON_BASE =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: Variant }) {
  return <button className={`${BUTTON_BASE} ${VARIANTS[variant]} ${className}`} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={`${BUTTON_BASE} ${VARIANTS[variant]} ${className}`} {...props} />;
}

/* -------------------------------------------------------------------------- */
/*  Layout                                                                     */
/* -------------------------------------------------------------------------- */

export function Card({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`rounded-xl border border-ink-200 bg-white ${className}`}
      {...props}
    />
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink-900">{title}</h1>
        {description ? <p className="mt-1 text-sm text-ink-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** Shown instead of a table when there is genuinely nothing yet. */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-ink-200 bg-white px-6 py-16 text-center">
      <p className="text-sm font-semibold text-ink-800">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Form controls                                                              */
/* -------------------------------------------------------------------------- */

const CONTROL =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-300 transition-colors focus:outline-none disabled:bg-ink-50";

const borderFor = (error?: string) =>
  error ? "border-red-400 focus:border-red-500" : "border-ink-200 focus:border-brand-500";

function Labelled({
  label,
  name,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-ink-800">
        {label}
        {required ? (
          <span className="text-accent-600" aria-hidden="true">
            {" "}
            *
          </span>
        ) : null}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

interface FieldBase {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

export function Input({
  label,
  name,
  error,
  hint,
  required,
  className = "",
  ...props
}: FieldBase & ComponentProps<"input">) {
  return (
    <div className={className}>
      <Labelled label={label} name={name} required={required} error={error} hint={hint}>
        <input
          id={name}
          name={name}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`${CONTROL} ${borderFor(error)}`}
          {...props}
        />
      </Labelled>
    </div>
  );
}

export function Textarea({
  label,
  name,
  error,
  hint,
  required,
  className = "",
  rows = 4,
  ...props
}: FieldBase & ComponentProps<"textarea">) {
  return (
    <div className={className}>
      <Labelled label={label} name={name} required={required} error={error} hint={hint}>
        <textarea
          id={name}
          name={name}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`${CONTROL} ${borderFor(error)} resize-y`}
          {...props}
        />
      </Labelled>
    </div>
  );
}

export function Select({
  label,
  name,
  error,
  hint,
  required,
  className = "",
  options,
  placeholder,
  ...props
}: FieldBase &
  ComponentProps<"select"> & {
    options: { value: string; label: string }[];
    placeholder?: string;
  }) {
  return (
    <div className={className}>
      <Labelled label={label} name={name} required={required} error={error} hint={hint}>
        <select
          id={name}
          name={name}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`${CONTROL} ${borderFor(error)}`}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Labelled>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Feedback                                                                   */
/* -------------------------------------------------------------------------- */

export function Alert({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "warning";
  children: ReactNode;
}) {
  const tones = {
    error: "border-red-200 bg-red-50 text-red-800",
    success: "border-brand-200 bg-brand-50 text-brand-800",
    warning: "border-accent-200 bg-accent-50 text-accent-800",
  } as const;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lg border px-4 py-3 text-sm ${tones[tone]}`}
    >
      {children}
    </div>
  );
}

/** Status pill. Colour carries meaning, but the label always says it too. */
export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "red" | "blue";
}) {
  const tones = {
    neutral: "bg-ink-100 text-ink-600",
    green: "bg-brand-50 text-brand-700",
    amber: "bg-accent-50 text-accent-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
  } as const;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tables                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Tables scroll inside their own container. Without this the page body scrolls
 * sideways on a laptop the moment a table has more than five columns.
 */
export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white">
      <table className="w-full min-w-[52rem] border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Th({ className = "", ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={`whitespace-nowrap border-b border-ink-100 bg-ink-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-500 ${className}`}
      {...props}
    />
  );
}

export function Td({ className = "", ...props }: ComponentProps<"td">) {
  return (
    <td className={`border-b border-ink-100 px-4 py-3 align-top text-ink-700 ${className}`} {...props} />
  );
}
