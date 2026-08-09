/**
 * The email HR receives when someone applies, and the acknowledgement the
 * applicant gets back.
 */

import { env } from "../../config/env.js";
import type { Application } from "../../models/applications.js";
import type { Message } from "../mailer.js";
import { button, layout, paragraphHtml, rowsHtml, rowsText, type Row } from "./layout.js";

/**
 * To HR, with the CV attached.
 *
 * `attachmentPath` is passed in rather than derived here so the caller can
 * resolve-and-verify it against STORAGE_ROOT first — this template should not
 * be the thing deciding which file to read off disk.
 */
export function applicationEmail(
  application: Application,
  attachment: { filename: string; path: string } | null
): Message {
  const rows: Row[] = [
    { label: "Applying for", value: application.jobTitleSnapshot },
    { label: "Name", value: application.fullName },
    { label: "Phone", value: application.phone },
    { label: "Email", value: application.email },
    { label: "Location", value: application.currentLocation },
    { label: "Experience", value: application.experienceYears ? `${application.experienceYears} years` : null },
    { label: "Current company", value: application.currentCompany },
    { label: "Notice period", value: application.noticePeriod },
    { label: "LinkedIn", value: application.linkedinUrl },
  ];

  const adminLink = `${env.publicSiteUrl}/admin/applications?id=${application.id}`;

  const html = layout({
    heading: `New application — ${application.jobTitleSnapshot}`,
    intro: `${application.fullName} has applied. Their CV is attached${
      attachment ? "" : " — or would be, but it could not be read from disk"
    }.`,
    body:
      rowsHtml(rows) +
      (application.coverLetter ? paragraphHtml("Their message", application.coverLetter) : "") +
      button("Open in the admin panel", adminLink),
  });

  const text = [
    `New application for ${application.jobTitleSnapshot}`,
    "",
    rowsText(rows),
    ...(application.coverLetter ? ["", "Their message:", application.coverLetter] : []),
    "",
    `Open in the admin panel: ${adminLink}`,
  ].join("\n");

  return {
    to: env.mail.hrTo,
    subject: `New application — ${application.jobTitleSnapshot} — ${application.fullName}`,
    html,
    text,
    // Hitting Reply should write to the candidate, not to the website mailbox.
    replyTo: application.email,
    ...(attachment ? { attachments: [attachment] } : {}),
  };
}

/**
 * To the applicant.
 *
 * Deliberately does not promise a reply by a specific date, and deliberately
 * does not attach their CV back to them.
 */
export function applicationAcknowledgement(application: Application): Message {
  const html = layout({
    heading: "We have your application",
    intro: `Thank you for applying for ${application.jobTitleSnapshot} at ${env.mail.fromName.replace(" Website", "")}.`,
    body: `
      <p style="margin:0 0 16px;color:#43464f;font-size:14px;line-height:1.7;">
        Our HR team reviews every application. If your profile fits what the role needs, someone
        will call you on ${application.phone}. If you have not heard from us within two weeks,
        please assume we have gone ahead with other candidates this time — and do apply again for
        future openings.
      </p>
      <p style="margin:0;color:#43464f;font-size:14px;line-height:1.7;">
        You do not need to send your CV again.
      </p>`,
  });

  const text = [
    "We have your application",
    "",
    `Thank you for applying for ${application.jobTitleSnapshot}.`,
    "",
    "Our HR team reviews every application. If your profile fits, someone will call you",
    `on ${application.phone}. If you have not heard from us within two weeks, please assume`,
    "we have gone ahead with other candidates this time.",
    "",
    "You do not need to send your CV again.",
  ].join("\n");

  return {
    to: application.email,
    subject: `We have your application — ${application.jobTitleSnapshot}`,
    html,
    text,
    ...(env.mail.hrTo ? { replyTo: env.mail.hrTo } : {}),
  };
}
