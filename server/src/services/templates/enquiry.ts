/**
 * Notification for a contact-form enquiry or a quote request.
 */

import { env } from "../../config/env.js";
import type { Enquiry } from "../../models/enquiries.js";
import type { Message } from "../mailer.js";
import { button, layout, paragraphHtml, rowsHtml, rowsText, type Row } from "./layout.js";

export function enquiryEmail(enquiry: Enquiry): Message {
  const isQuote = enquiry.kind === "quote_request";
  const label = isQuote ? "quote request" : "enquiry";

  const rows: Row[] = [
    { label: "Name", value: enquiry.name },
    { label: "Phone", value: enquiry.phone },
    { label: "Email", value: enquiry.email },
    { label: "Company", value: enquiry.company },
    { label: "Subject", value: enquiry.subject },
    { label: "Service", value: enquiry.service },
    { label: "Industry", value: enquiry.industry },
    { label: "Product", value: enquiry.product },
    { label: "Site location", value: enquiry.location },
    { label: "Capacity", value: enquiry.capacity },
    { label: "Budget", value: enquiry.budget },
    { label: "Timeline", value: enquiry.timeline },
    { label: "Submitted from", value: enquiry.sourcePage },
  ];

  const adminLink = `${env.publicSiteUrl}/admin/enquiries?id=${enquiry.id}`;

  const html = layout({
    heading: `New ${label} — ${enquiry.name}`,
    intro: `${enquiry.name} got in touch through the website. Their phone number is ${enquiry.phone}.`,
    body:
      rowsHtml(rows) +
      paragraphHtml("Message", enquiry.message) +
      button("Open in the admin panel", adminLink),
  });

  const text = [
    `New ${label} from ${enquiry.name}`,
    "",
    rowsText(rows),
    "",
    "Message:",
    enquiry.message,
    "",
    `Open in the admin panel: ${adminLink}`,
  ].join("\n");

  return {
    to: env.mail.salesTo,
    subject: `New ${label} — ${enquiry.name} (${enquiry.phone})`,
    html,
    text,
    // So hitting Reply writes to the enquirer rather than the website mailbox.
    ...(enquiry.email ? { replyTo: enquiry.email } : {}),
  };
}
