"use client";

import { useState } from "react";

/**
 * Share buttons for an article.
 *
 * Plain links to each network's share endpoint — no SDKs, no tracking pixels,
 * nothing that would let a third party watch who reads what.
 */
export default function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    {
      label: "Share on LinkedIn",
      short: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      label: "Share on WhatsApp",
      short: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      label: "Share on X",
      short: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "Share by email",
      short: "Email",
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    },
  ];

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be refused; the share links still work.
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Share</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {targets.map((target) => (
          <a
            key={target.short}
            href={target.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={target.label}
            className="inline-flex h-9 items-center rounded-full border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-600 transition-colors hover:border-brand-500 hover:text-brand-600"
          >
            {target.short}
          </a>
        ))}

        <button
          type="button"
          onClick={copy}
          className="inline-flex h-9 items-center rounded-full border border-ink-200 bg-white px-3 text-xs font-semibold text-ink-600 transition-colors hover:border-brand-500 hover:text-brand-600"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
