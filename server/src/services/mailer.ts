/**
 * Outbound email.
 *
 * The governing rule: **a mail failure never fails a request.** Every
 * submission is written to the database first, and delivery is attempted
 * afterwards with the outcome recorded on the row (`email_status`). So if
 * Gmail is down, an applicant still gets "we have your application", the
 * record is still in the admin panel, and the message is retried later —
 * nothing is silently lost, which is the whole reason for storing as well as
 * emailing.
 */

import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export interface Attachment {
  filename: string;
  /** Absolute path; nodemailer streams it rather than buffering. */
  path: string;
}

export interface Message {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** So a reply from HR goes to the applicant, not to the website mailbox. */
  replyTo?: string;
  attachments?: Attachment[];
}

export type DeliveryStatus = "sent" | "failed" | "skipped";

export interface DeliveryResult {
  status: DeliveryStatus;
  error?: string;
}

let transporter: Transporter | null = null;

function getTransport(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.mail.host,
      port: env.mail.port,
      secure: env.mail.secure,
      auth: { user: env.mail.user, pass: env.mail.pass },
      pool: true,
      maxConnections: 2,
      maxMessages: 50,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }
  return transporter;
}

/**
 * Checked once at boot and only logged. A broken mailer must not stop the API
 * from serving job listings.
 */
export async function verifyTransport(): Promise<void> {
  if (!env.mail.enabled) {
    logger.info("MAIL_ENABLED=false — nothing will be sent; rows are marked 'skipped'");
    return;
  }
  try {
    await getTransport().verify();
    logger.info({ host: env.mail.host, user: env.mail.user }, "SMTP ready");
  } catch (error) {
    logger.error(
      { err: error, host: env.mail.host },
      "SMTP verification failed — submissions will still be stored, mail will be retried"
    );
  }
}

/**
 * Never throws. Callers record the returned status against the row rather than
 * letting a delivery problem reach the visitor.
 */
export async function send(message: Message): Promise<DeliveryResult> {
  if (!env.mail.enabled) return { status: "skipped" };

  if (!message.to) {
    return { status: "failed", error: "No recipient configured (check MAIL_HR_TO / MAIL_SALES_TO)" };
  }

  try {
    const info = await getTransport().sendMail({
      // Gmail rewrites From to the authenticated mailbox regardless, so this
      // is really only setting the display name.
      from: { name: env.mail.fromName, address: env.mail.from || env.mail.user },
      to: message.to,
      ...(env.mail.bcc ? { bcc: env.mail.bcc } : {}),
      ...(message.replyTo ? { replyTo: message.replyTo } : {}),
      subject: message.subject,
      text: message.text,
      html: message.html,
      ...(message.attachments?.length ? { attachments: message.attachments } : {}),
    });

    logger.info({ messageId: info.messageId, to: message.to }, "mail sent");
    return { status: "sent" };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    logger.error({ err: error, to: message.to }, "mail failed");
    return { status: "failed", error: reason.slice(0, 500) };
  }
}

export async function closeTransport(): Promise<void> {
  transporter?.close();
  transporter = null;
}
