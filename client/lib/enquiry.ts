/**
 * Contact and quote-request submission, running entirely in the browser.
 *
 * The site is exported as static HTML (`output: "export"` in `next.config.ts`)
 * so it can be served from ordinary shared hosting. Static hosting has no
 * server, which means no server actions and no API route — the form has to
 * deliver itself. Both forms therefore validate here and POST the result
 * straight to `NEXT_PUBLIC_ENQUIRY_ENDPOINT`.
 *
 * That endpoint is public: it is compiled into the browser bundle and visible
 * to anyone who reads the page source. Use a service built to receive
 * submissions from a web page — Formspree, a Google Apps Script web app, a
 * Zapier or Make catch hook — never a URL that carries a secret or can do
 * anything beyond accepting an enquiry.
 *
 * When the variable is unset the submission is logged to the browser console
 * and the visitor is told to call or email instead, so nothing is ever
 * silently swallowed.
 */

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

const ENDPOINT = process.env.NEXT_PUBLIC_ENQUIRY_ENDPOINT ?? "";

function field(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function collect(formData: FormData, keys: string[]): Record<string, string> {
  return Object.fromEntries(keys.map((k) => [k, field(formData, k)]));
}

async function deliver(kind: string, payload: Record<string, string>) {
  if (!ENDPOINT) {
    console.info(`[${kind}] no NEXT_PUBLIC_ENQUIRY_ENDPOINT set`, payload);
    throw new Error("No enquiry endpoint configured");
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      kind,
      submittedAt: new Date().toISOString(),
      ...payload,
    }),
  });

  if (!res.ok) throw new Error(`Endpoint responded ${res.status}`);
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

  try {
    await deliver("enquiry", values);
  } catch (err) {
    console.error("[enquiry] delivery failed", err);
    return {
      status: "error",
      message:
        "Something went wrong sending your message. Please call us instead — we will pick up.",
      values,
    };
  }

  return {
    status: "success",
    message:
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

  try {
    await deliver("quote-request", values);
  } catch (err) {
    console.error("[quote-request] delivery failed", err);
    return {
      status: "error",
      message:
        "Something went wrong submitting your request. Please call or email us instead.",
      values,
    };
  }

  return {
    status: "success",
    message:
      "Your quote request has been received. Our engineering team will review the scope and respond within two working days.",
  };
}
