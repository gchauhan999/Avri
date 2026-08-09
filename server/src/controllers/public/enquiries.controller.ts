/**
 * The contact and quote forms.
 *
 * `POST /api/enquiries` handles both. The validation rules live in
 * `validations/enquiry.validation.ts` and mirror `client/lib/enquiry.ts`
 * message for message — that copy runs in the browser and is trivially
 * bypassed, so this is the one that actually holds.
 */

import type { RequestHandler } from "express";
import { logger } from "../../config/logger.js";
import { clientIpFn, sourcePage, userAgent } from "../../helpers/request.js";
import { normalisePhone } from "../../helpers/validation.js";
import { Enquiry } from "../../models/index.js";
import type { EnquiryKind } from "../../models/enquiries.js";
import { send } from "../../services/mailer.js";
import { enquiryEmail } from "../../services/templates/enquiry.js";
import { enquirySchema } from "../../validations/enquiry.validation.js";

const successMessage = (kind: EnquiryKind) =>
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
async function notify(id: number): Promise<void> {
  const row = await Enquiry.findByPk(id);
  if (!row) return;

  const result = await send(enquiryEmail(row));

  await row.update({
    emailStatus: result.status,
    emailError: result.error ?? null,
    emailAttempts: row.emailAttempts + 1,
  });
}

/**
 * `forcedKind` is how `/quote` pins the stricter branch. Without it a caller
 * could post quote fields to `/api/enquiries` with `kind: "enquiry"` and skip
 * the extra required-field checks.
 */
export const submitEnquiry = (forcedKind?: EnquiryKind): RequestHandler =>
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

    const created = await Enquiry.create({
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
      // A SQL function, not a value — see `clientIpFn`.
      sourceIp: clientIpFn(req) as unknown as Buffer,
      userAgent: userAgent(req),
    });

    const id = created.id;

    // Deliberately not awaited — see `notify`.
    void notify(id).catch((error) => {
      logger.error({ err: error, id }, "enquiry notification failed");
    });

    res.status(201).json({ id, message: successMessage(data.kind) });
  };
