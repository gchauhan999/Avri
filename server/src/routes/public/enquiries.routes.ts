/**
 * The contact and quote forms.
 *
 * `POST /api/enquiries` handles both. The rules here mirror
 * `client/lib/enquiry.ts` message for message — that copy runs in the browser
 * and is trivially bypassed, so this is the one that actually holds.
 */

import { Router, type RequestHandler } from "express";
import { z } from "zod";
import { db } from "../../db/client.js";
import { enquiries, type Enquiry } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { logger } from "../../lib/logger.js";
import { clientIpSql, sourcePage, userAgent } from "../../lib/request.js";
import {
  honeypot,
  name,
  normalisePhone,
  optionalEmail,
  optionalText,
  phone,
} from "../../lib/validation.js";
import { enquiryWrite } from "../../middleware/rate-limit.js";
import { send } from "../../services/mailer.js";
import { enquiryEmail } from "../../services/templates/enquiry.js";

export const enquiriesRouter = Router();

const baseSchema = z.object({
  kind: z.enum(["enquiry", "quote_request"]).default("enquiry"),
  name,
  phone,
  email: optionalEmail,
  company: optionalText(180),
  subject: optionalText(200),
  service: optionalText(160),
  industry: optionalText(160),
  product: optionalText(200),
  location: optionalText(200),
  capacity: optionalText(120),
  budget: optionalText(120),
  timeline: optionalText(120),
  message: z
    .string()
    .trim()
    .min(10, "Please describe your requirement in a little more detail.")
    .max(5000, "That message is too long. Please summarise it."),
  company_website: honeypot,
  source_page: optionalText(300),
});

/**
 * A quote request asks for more, so it validates more. Expressed as a refine
 * rather than two schemas so the shared fields cannot drift apart.
 */
const enquirySchema = baseSchema.superRefine((value, ctx) => {
  if (value.kind !== "quote_request") return;

  if (!value.email) {
    ctx.addIssue({ code: "custom", path: ["email"], message: "Enter a valid email address." });
  }
  if (!value.service) {
    ctx.addIssue({ code: "custom", path: ["service"], message: "Please select the service you need." });
  }
  if (!value.location) {
    ctx.addIssue({ code: "custom", path: ["location"], message: "Please tell us where the site is." });
  }
});

const successMessage = (kind: Enquiry["kind"]) =>
  kind === "quote_request"
    ? "Your quote request has been received. Our engineering team will review the scope and respond within two working days."
    : "Thank you — your enquiry has reached us. Expect a call from our team within one working day.";

/**
 * Deliver in the background and record the outcome on the row.
 *
 * Never awaited by the request handler: the visitor has already been told
 * "received", which is true — the row exists. If SMTP is down the row is
 * flagged `failed`, badged in the dashboard, and retried.
 */
async function notify(id: number) {
  const [row] = await db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1);
  if (!row) return;

  const result = await send(enquiryEmail(row));

  await db
    .update(enquiries)
    .set({
      emailStatus: result.status,
      emailError: result.error ?? null,
      emailAttempts: row.emailAttempts + 1,
    })
    .where(eq(enquiries.id, id));
}

/**
 * `forcedKind` is how `/quote` pins the stricter branch. Without it a caller
 * could post quote fields to `/api/enquiries` with `kind: "enquiry"` and skip
 * the extra required-field checks.
 */
const submit = (forcedKind?: Enquiry["kind"]): RequestHandler =>
  async function handleEnquiry(req, res) {
    const data = enquirySchema.parse(
      forcedKind ? { ...req.body, kind: forcedKind } : req.body
    );

    /**
     * Honeypot. `Honeypot()` renders a hidden `company_website` input that a
     * human never sees. Answering with a normal success and writing nothing is
     * deliberate: a bot that gets an error simply retries without the field.
     */
    if (data.company_website) {
      logger.debug({ ip: req.ip }, "honeypot triggered on enquiry");
      res.status(201).json({ message: successMessage(data.kind) });
      return;
    }

    const [result] = await db.insert(enquiries).values({
      kind: data.kind,
      name: data.name,
      phone: data.phone,
      phoneNormalised: normalisePhone(data.phone),
      email: data.email || null,
      company: data.company || null,
      subject: data.subject || null,
      service: data.service || null,
      industry: data.industry || null,
      product: data.product || null,
      location: data.location || null,
      capacity: data.capacity || null,
      budget: data.budget || null,
      timeline: data.timeline || null,
      message: data.message,
      sourcePage: sourcePage(data.source_page),
      sourceIp: clientIpSql(req) as never,
      userAgent: userAgent(req),
    });

    const id = result.insertId;

    // Deliberately not awaited — see `notify`.
    void notify(id).catch((error) => {
      logger.error({ err: error, id }, "enquiry notification failed");
    });

    res.status(201).json({ id, message: successMessage(data.kind) });
  };

/** The contact form. `kind` comes from the body and defaults to "enquiry". */
enquiriesRouter.post("/", enquiryWrite, submit());

/** The quote form. Same handler with the stricter branch pinned on. */
enquiriesRouter.post("/quote", enquiryWrite, submit("quote_request"));
