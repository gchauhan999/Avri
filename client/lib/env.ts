/**
 * Typed access to the company configuration held in the environment.
 *
 * IMPORTANT: every `process.env.NEXT_PUBLIC_*` lookup must be written as a
 * literal member expression. Next.js replaces these at build time by static
 * text substitution, so dynamic access (`process.env[key]`) would resolve to
 * `undefined` in the browser bundle.
 *
 * Every value has a fallback, so the site renders correctly even with no
 * `.env` present.
 */

/** Trim, and fall back when the variable is missing or blank. */
function val(raw: string | undefined, fallback: string): string {
  const v = raw?.trim();
  return v ? v : fallback;
}

/** Trim, but allow an empty result — used for optional links. */
function opt(raw: string | undefined): string {
  return raw?.trim() ?? "";
}

export const env = {
  /* --- Core contact details --------------------------------------------- */
  companyName: val(process.env.NEXT_PUBLIC_COMPANY_NAME, "Avri Energy"),
  email: val(process.env.NEXT_PUBLIC_EMAIL, "info@avrienergy.com"),
  phone: val(process.env.NEXT_PUBLIC_PHONE, "+91 89790 94813"),
  whatsapp: opt(process.env.NEXT_PUBLIC_WHATSAPP),
  address: val(
    process.env.NEXT_PUBLIC_ADDRESS,
    "Office No. 3, Aurangabad Gadana, Modinagar, Ghaziabad, Uttar Pradesh – 201204"
  ),
  googleMap: opt(process.env.NEXT_PUBLIC_GOOGLE_MAP),
  /**
   * Not reliably derivable from `NEXT_PUBLIC_ADDRESS` by splitting on commas,
   * and Google's JobPosting schema wants a real PostalAddress.
   */
  postalCode: val(process.env.NEXT_PUBLIC_POSTAL_CODE, "201204"),

  /* --- Social media ------------------------------------------------------ */
  facebook: opt(process.env.NEXT_PUBLIC_FACEBOOK),
  linkedin: opt(process.env.NEXT_PUBLIC_LINKEDIN),
  instagram: opt(process.env.NEXT_PUBLIC_INSTAGRAM),
  youtube: opt(process.env.NEXT_PUBLIC_YOUTUBE),
  twitter: opt(process.env.NEXT_PUBLIC_TWITTER),

  /* --- Additional company details ---------------------------------------- */
  tagline: val(
    process.env.NEXT_PUBLIC_TAGLINE,
    "Reliable Power. Trusted Partner."
  ),
  legalName: val(process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME, "AVRI ENERGY PRIVATE LIMITED"),
  description: val(
    process.env.NEXT_PUBLIC_COMPANY_DESCRIPTION,
    "Avri Energy is an electrical EPC and renewable energy company delivering turnkey HT & LT works, substations, transformers, smart metering, solar and EV charging infrastructure across India."
  ),
  foundedYear: val(process.env.NEXT_PUBLIC_FOUNDED_YEAR, "2015"),
  gstin: opt(process.env.NEXT_PUBLIC_GSTIN),
  cin: opt(process.env.NEXT_PUBLIC_CIN),

  phoneAlt: opt(process.env.NEXT_PUBLIC_PHONE_ALT),
  landline: opt(process.env.NEXT_PUBLIC_LANDLINE),
  careersEmail: opt(process.env.NEXT_PUBLIC_EMAIL_CAREERS),
  salesEmail: val(process.env.NEXT_PUBLIC_EMAIL_SALES, "sales@avrienergy.com"),

  hoursWeekdays: val(
    process.env.NEXT_PUBLIC_HOURS_WEEKDAYS,
    "Monday – Saturday, 9:30 AM – 6:30 PM"
  ),
  hoursWeekend: val(process.env.NEXT_PUBLIC_HOURS_WEEKEND, "Sunday, Closed"),

  siteUrl: val(
    process.env.NEXT_PUBLIC_SITE_URL,
    "https://www.avrienergy.com"
  ).replace(/\/$/, ""),

  /* --- API ---------------------------------------------------------------- */

  /**
   * Origin of the Avri API, as the *browser* sees it. Forms POST here, so it
   * is compiled into the bundle and is not a place for anything secret.
   */
  apiUrl: val(process.env.NEXT_PUBLIC_API_URL, "http://localhost:4000").replace(
    /\/$/,
    ""
  ),

  /**
   * Origin of the API as the *Next server* sees it. Server Components use this
   * so a page render goes over the loopback rather than back out through DNS
   * and the public TLS hop. Not a `NEXT_PUBLIC_` value — it never reaches the
   * browser, and in production it is usually 127.0.0.1.
   */
  apiInternalUrl: val(
    process.env.API_INTERNAL_URL,
    val(process.env.NEXT_PUBLIC_API_URL, "http://localhost:4000")
  ).replace(/\/$/, ""),

  /** Shared with the server's REVALIDATE_SECRET; guards `/api/revalidate`. */
  revalidateSecret: opt(process.env.REVALIDATE_SECRET),
} as const;
