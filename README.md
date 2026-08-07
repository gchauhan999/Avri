# Avri Energy — corporate website

Electrical EPC & renewable energy company website, built with the App Router.

**Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion

> The brief asked for Next.js 15. The project was already scaffolded on
> Next.js 16.2.12, which is a superset of the App Router APIs used here, so it
> was kept. Nothing in the code depends on a v16-only feature.

## Getting started

```bash
cp .env.example .env   # then fill in the real values
npm install
npm run dev                  # http://localhost:3000
```

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Configuration

**No contact detail is hardcoded.** Everything lives in `.env` — see
`.env.example` for the full documented list.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_COMPANY_NAME` | Company name, used site-wide |
| `NEXT_PUBLIC_EMAIL` | Primary email address |
| `NEXT_PUBLIC_PHONE` | Primary phone number |
| `NEXT_PUBLIC_WHATSAPP` | WhatsApp number, digits only — drives the floating button |
| `NEXT_PUBLIC_ADDRESS` | Office address (split on commas for display) |
| `NEXT_PUBLIC_GOOGLE_MAP` | Google Maps **embed** URL for the map frame |
| `NEXT_PUBLIC_FACEBOOK` / `_LINKEDIN` / `_INSTAGRAM` | Social profiles |
| `NEXT_PUBLIC_SITE_URL` | Live domain — drives canonicals, sitemap and robots |
| `ENQUIRY_WEBHOOK_URL` | Server-side only. Where form submissions are POSTed |

Optional extras (`NEXT_PUBLIC_PHONE_ALT`, `NEXT_PUBLIC_LANDLINE`,
`NEXT_PUBLIC_TAGLINE`, `NEXT_PUBLIC_HOURS_*`, `NEXT_PUBLIC_YOUTUBE`,
`NEXT_PUBLIC_TWITTER`, …) are all documented in `.env.example`. Leave any
optional value blank and the related UI hides itself rather than rendering an
empty row.

`NEXT_PUBLIC_*` values are inlined at **build time** — restart the dev server or
rebuild after changing them.

## Project structure

```
app/                          routes (App Router)
├── layout.tsx                root layout: navbar, footer, floating buttons, SEO
├── page.tsx                  home — composes the 12 sections
├── actions.ts                server actions behind both forms
├── about|services|industries|projects|gallery|contact/
├── request-a-quote/
├── privacy-policy|terms-and-conditions/
├── loading.tsx  not-found.tsx  sitemap.ts  robots.ts

components/
├── layout/                   Navbar, Footer, Preloader, ScrollToTop, WhatsAppButton
├── sections/                 home + shared page sections
├── ui/                       Button, Section, Media, Illustration, Icons, Motion…
└── forms/                    ContactForm, QuoteForm, shared Fields

lib/
├── env.ts                    typed access to the environment config
├── site.ts                   all site content (services, industries, projects…)
├── types.ts                  TypeScript interfaces
├── motion.ts                 shared Framer Motion variants
└── seo.ts                    metadata helper + JSON-LD schemas

public/assets/                all imagery — see public/assets/README.md
```

## Content

Editorial content — services, industries, projects, gallery, clients,
certifications, testimonials, FAQs — is in **`lib/site.ts`**, typed against
`lib/types.ts`. Edit that one file; every page updates.

The current content is **placeholder copy**. Before launch, replace:

- Headline statistics (`stats`) — currently invented figures
- Project details, client names and testimonials
- Certification codes and validity
- Both legal documents (they are templates and need a lawyer's review)

## Imagery

Photographs go in `public/assets/…` and are wired up via the `image` field on
each entry in `lib/site.ts`. See **`public/assets/README.md`** for the folder
map, aspect ratios and sizes.

Any slot without a photograph renders branded vector artwork
(`components/ui/Illustration.tsx`), so the site never shows a broken frame.

## Forms

`ContactForm` and `QuoteForm` post to server actions in `app/actions.ts`, which:

1. validate on the server (Indian mobile format, email, required fields),
2. reject bot submissions via a honeypot field,
3. POST the payload as JSON to `ENQUIRY_WEBHOOK_URL`.

**If `ENQUIRY_WEBHOOK_URL` is empty, submissions are only written to the server
log — nobody is emailed.** Point it at a Zapier/Make hook, a Google Apps Script,
your CRM, or a custom route before going live.

## Features

- Sticky navbar that condenses on scroll, with a glassmorphism surface
- Scroll-to-top button and floating WhatsApp button
- Branded preloader on first paint, plus a route-level `loading.tsx`
- Scroll-triggered Framer Motion animations (fire once, honour
  `prefers-reduced-motion`)
- Filterable projects grid and a gallery with a keyboard-navigable lightbox
- Per-page metadata, canonical URLs, Open Graph, `sitemap.xml`, `robots.txt`
- JSON-LD for Organization, LocalBusiness, Services and FAQs
- Mobile-first responsive throughout; skip-to-content link and focus rings

## Brand

| Token | Value |
| --- | --- |
| Primary green | `#1E7F3F` → `brand-500` |
| Orange accent | `#F57C00` → `accent-500` |
| Typography | near-black `ink-900` on white |

Defined as Tailwind v4 theme tokens in `app/globals.css`.
