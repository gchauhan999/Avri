/**
 * Shared shell for notification emails.
 *
 * Table-based and inline-styled on purpose: Outlook and several Indian webmail
 * clients still do not honour flexbox, grid or a `<style>` block.
 */

import { env } from "../../config/env.js";

const BRAND = "#1E7F3F";
const INK = "#171717";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";

export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export interface Row {
  label: string;
  value: string | number | null | undefined;
}

/**
 * A label/value table. Empty values are dropped rather than rendered as "—":
 * the quote form has twelve optional fields and a wall of dashes buries the
 * three that were filled in.
 */
export function rowsHtml(rows: Row[]): string {
  const filled = rows.filter((r) => r.value !== null && r.value !== undefined && String(r.value).trim() !== "");
  if (filled.length === 0) return "";

  const cells = filled
    .map(
      (r) => `
      <tr>
        <td style="padding:8px 16px 8px 0;vertical-align:top;color:${MUTED};font-size:13px;white-space:nowrap;">${escapeHtml(r.label)}</td>
        <td style="padding:8px 0;vertical-align:top;color:${INK};font-size:14px;font-weight:600;">${escapeHtml(String(r.value))}</td>
      </tr>`
    )
    .join("");

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">${cells}</table>`;
}

export function rowsText(rows: Row[]): string {
  return rows
    .filter((r) => r.value !== null && r.value !== undefined && String(r.value).trim() !== "")
    .map((r) => `${r.label}: ${r.value}`)
    .join("\n");
}

/** A block of user-written prose, with newlines preserved. */
export function paragraphHtml(title: string, body: string): string {
  return `
    <div style="margin-top:24px;padding-top:20px;border-top:1px solid ${BORDER};">
      <p style="margin:0 0 8px;color:${MUTED};font-size:13px;">${escapeHtml(title)}</p>
      <div style="color:${INK};font-size:14px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(body)}</div>
    </div>`;
}

export function button(label: string, href: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
      <tr><td style="border-radius:9999px;background:${BRAND};">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 26px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:9999px;">${escapeHtml(label)}</a>
      </td></tr>
    </table>`;
}

export function layout({
  heading,
  intro,
  body,
}: {
  heading: string;
  intro?: string;
  body: string;
}): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#f5f5f5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border:1px solid ${BORDER};border-radius:16px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <tr><td style="background:${BRAND};padding:20px 32px;">
          <span style="color:#ffffff;font-size:16px;font-weight:700;letter-spacing:-0.01em;">Avri Energy</span>
        </td></tr>
        <tr><td style="padding:32px;">
          <h1 style="margin:0 0 ${intro ? "8px" : "24px"};color:${INK};font-size:20px;font-weight:700;letter-spacing:-0.01em;">${escapeHtml(heading)}</h1>
          ${intro ? `<p style="margin:0 0 24px;color:${MUTED};font-size:14px;line-height:1.6;">${escapeHtml(intro)}</p>` : ""}
          ${body}
        </td></tr>
        <tr><td style="padding:20px 32px;background:#fafafa;border-top:1px solid ${BORDER};">
          <p style="margin:0;color:${MUTED};font-size:12px;line-height:1.6;">
            Sent automatically by the website at ${escapeHtml(env.publicSiteUrl)}.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
