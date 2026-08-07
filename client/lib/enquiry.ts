/**
 * Contact and quote submission.
 *
 * These validate in the browser and POST to the Avri API (`../server`), which
 * validates again, stores the enquiry and emails it. The server copy is the
 * one that counts — everything here is trivially bypassed — but running the
 * same rules client-side means a typo is caught before a round trip, and the
 * wording matches either way. The regexes and messages below are duplicated in
 * `server/src/lib/validation.ts`; change one, change both.
 *
 * `FormState` is deliberately unchanged from the version that posted to a
 * third-party form service, so `components/forms/Fields.tsx`, `ContactForm`
 * and `QuoteForm` did not have to change at all. The server returns validation
 * errors in the same `{ field: message }` shape, so a server-side rejection
 * renders under the right input.
 */

import { apiUrl, type ApiErrorBody } from "./api";

export interface FormState {
  status: "idle" | "success" | "error";
  message: string;
  /** Field name → error message. */
  errors?: Record<string, string>;
  /** Echoed back so a failed submit does not wipe what was typed. */
  values?: Record<string, string>;
}

export const initialFormState: FormState = { status: "idle", message: "" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** 10-digit Indian mobile, optionally prefixed with +91 or 0. */
const PHONE_RE = /^(?:\+?91[\s-]?|0)?[6-9]\d{9}$/;

function field(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function collect(formData: FormData, keys: string[]): Record<string, string> {
  return Object.fromEntries(keys.map((k) => [k, field(formData, k)]));
}

/** Bots fill hidden fields; humans do not. Treated as success so they stop. */
function isBot(formData: FormData): boolean {
  return Boolean(field(formData, "company_website"));
}

function invalid(
  errors: Record<string, string>,
  values: Record<string, string>
): FormState {
  return {
    status: "error",
    message: "Please correct the highlighted fields.",
    errors,
    values,
  };
}

/** The page the form was submitted from, for attribution in the dashboard. */
function currentPath(): string {
  return typeof window === "undefined" ? "" : window.location.pathname + window.location.search;
}

/**
 * POST JSON and translate the response into a `FormState`.
 *
 * A 422 carries per-field messages, which are handed straight back so they
 * render under the matching input. Anything else becomes the generic failure
 * message the caller supplies.
 */
async function deliver(
  path: string,
  payload: Record<string, string>
): Promise<{ ok: true; message?: string } | { ok: false; state: FormState }> {
  const values = payload;

  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...payload, source_page: currentPath() }),
    });
  } catch (error) {
    // Network-level failure: offline, DNS, CORS, API down.
    console.error("[enquiry] request failed", error);
    return { ok: false, state: { status: "error", message: "", values } };
  }

  if (res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    return { ok: true, ...(body.message ? { message: body.message } : {}) };
  }

  const body = (await res.json().catch(() => null)) as ApiErrorBody | null;

  if (res.status === 422 && body?.error.fields) {
    return {
      ok: false,
      state: {
        status: "error",
        message: body.error.message,
        errors: body.error.fields,
        values,
      },
    };
  }

  if (res.status === 429) {
    return {
      ok: false,
      state: { status: "error", message: body?.error.message ?? "", values },
    };
  }

  console.error("[enquiry] endpoint responded", res.status, body);
  return { ok: false, state: { status: "error", message: "", values } };
}

/** General contact form. */
export async function submitEnquiry(formData: FormData): Promise<FormState> {
  if (isBot(formData)) {
    return { status: "success", message: "Thank you. We will be in touch." };
  }

  const values = collect(formData, [
    "name",
    "phone",
    "email",
    "company",
    "subject",
    "message",
  ]);

  const errors: Record<string, string> = {};
  if (values.name.length < 2) errors.name = "Please enter your name.";
  if (!PHONE_RE.test(values.phone))
    errors.phone = "Enter a valid 10-digit mobile number.";
  if (values.email && !EMAIL_RE.test(values.email))
    errors.email = "Enter a valid email address.";
  if (values.message.length < 10)
    errors.message = "Please describe your requirement in a little more detail.";

  if (Object.keys(errors).length > 0) return invalid(errors, values);

  const result = await deliver("/api/enquiries", { ...values, kind: "enquiry" });

  if (!result.ok) {
    return {
      ...result.state,
      message:
        result.state.message ||
        "Something went wrong sending your message. Please call us instead — we will pick up.",
    };
  }

  return {
    status: "success",
    message:
      result.message ??
      "Thank you — your enquiry has reached us. Expect a call from our team within one working day.",
  };
}

/** Detailed quote request. */
export async function submitQuote(formData: FormData): Promise<FormState> {
  if (isBot(formData)) {
    return { status: "success", message: "Thank you. We will be in touch." };
  }

  const values = collect(formData, [
    "name",
    "phone",
    "email",
    "company",
    "service",
    "industry",
    "product",
    "location",
    "capacity",
    "budget",
    "timeline",
    "message",
  ]);

  const errors: Record<string, string> = {};
  if (values.name.length < 2) errors.name = "Please enter your name.";
  if (!PHONE_RE.test(values.phone))
    errors.phone = "Enter a valid 10-digit mobile number.";
  if (!EMAIL_RE.test(values.email))
    errors.email = "Enter a valid email address.";
  if (!values.service) errors.service = "Please select the service you need.";
  if (!values.location) errors.location = "Please tell us where the site is.";
  if (values.message.length < 10)
    errors.message = "A few more details will help us quote accurately.";

  if (Object.keys(errors).length > 0) return invalid(errors, values);

  const result = await deliver("/api/enquiries/quote", values);

  if (!result.ok) {
    return {
      ...result.state,
      message:
        result.state.message ||
        "Something went wrong submitting your request. Please call or email us instead.",
    };
  }

  return {
    status: "success",
    message:
      result.message ??
      "Your quote request has been received. Our engineering team will review the scope and respond within two working days.",
  };
}
