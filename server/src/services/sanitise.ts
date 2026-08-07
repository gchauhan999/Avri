/**
 * Cleaning article HTML from the rich-text editor.
 *
 * Sanitising happens **on write**, not on render. Two reasons: the stored
 * value is then safe everywhere it is used without every consumer having to
 * remember, and the cost is paid once per save rather than on every page view.
 *
 * Post bodies are written by admins, so this is not the first line of defence
 * — but a compromised editor account should not own every visitor to the site,
 * and `dangerouslySetInnerHTML` on the public article page means anything that
 * survives here executes in the reader's browser.
 */

import sanitizeHtml from "sanitize-html";
import { env } from "../config/env.js";

/**
 * The tags a TipTap toolbar can produce, and nothing else. No `<script>`, no
 * `<style>`, no `<iframe>`, no form elements.
 */
const ALLOWED_TAGS = [
  "p",
  "br",
  "hr",
  "h2",
  "h3",
  "h4",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "code",
  "pre",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];

export function sanitiseArticleHtml(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan", "scope"],
    },
    // No `javascript:` or `data:` URLs, which is how an <a> or <img> becomes
    // an execution vector.
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesAppliedToAttributes: ["href", "src"],
    // Every `style` attribute is dropped: inline CSS can position an element
    // over the page and is a clickjacking primitive.
    allowedStyles: {},
    transformTags: {
      // Outbound links open in a new tab and cannot reach back through
      // window.opener.
      a: (tagName, attribs) => {
        const href = attribs.href ?? "";
        const external = /^https?:\/\//i.test(href) && !href.startsWith(env.publicSiteUrl);
        return {
          tagName,
          attribs: external
            ? { ...attribs, target: "_blank", rel: "noopener noreferrer" }
            : attribs,
        };
      },
      img: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, loading: "lazy" },
      }),
    },
    // Strip the contents of anything disallowed, rather than leaving the text
    // of a <script> block sitting in the article.
    nonTextTags: ["style", "script", "textarea", "option", "noscript"],
  });
}

/** Plain text, for excerpts and reading-time estimates. */
export function htmlToText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}

/** ~200 words a minute, floored at one. */
export function readingMinutes(html: string): number {
  const words = htmlToText(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** First ~200 characters of prose, cut on a word boundary. */
export function autoExcerpt(html: string, limit = 200): string {
  const text = htmlToText(html);
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}
