/**
 * The contact and quote forms.
 *
 * These rules mirror `client/lib/enquiry.ts` message for message — that copy
 * runs in the browser and is trivially bypassed, so this is the one that
 * actually holds.
 */

import { z } from "zod";
import {
  honeypot,
  name,
  optionalEmail,
  optionalText,
  phone,
} from "../helpers/validation.js";
import { pageQuery } from "../helpers/pagination.js";

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
export const enquirySchema = baseSchema.superRefine((value, ctx) => {
  if (value.kind !== "quote_request") return;

  if (!value.email) {
    ctx.addIssue({ code: "custom", path: ["email"], message: "Enter a valid email address." });
  }
  if (!value.service) {
    ctx.addIssue({
      code: "custom",
      path: ["service"],
      message: "Please select the service you need.",
    });
  }
  if (!value.location) {
    ctx.addIssue({
      code: "custom",
      path: ["location"],
      message: "Please tell us where the site is.",
    });
  }
});

const ENQUIRY_STATUS = z.enum(["new", "contacted", "quoted", "won", "lost", "spam"]);

export const adminEnquiryListQuery = pageQuery.extend({
  kind: z.enum(["enquiry", "quote_request"]).optional(),
  status: ENQUIRY_STATUS.optional(),
  q: z.string().trim().max(120).optional(),
});

export const enquiryUpdateSchema = z.object({
  status: ENQUIRY_STATUS.optional(),
  adminNotes: z.string().max(5000).optional(),
});
