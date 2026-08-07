/**
 * Environment configuration, parsed and validated once at import time.
 *
 * The whole file exists so that a misconfigured deployment fails loudly on
 * boot rather than quietly at 2am when someone applies for a job. If a
 * required value is missing or malformed the process exits with a list of
 * exactly what is wrong.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const here = path.dirname(fileURLToPath(import.meta.url));
/** `src/config` in dev, `dist/config` once built — the package root is two up. */
const packageRoot = path.resolve(here, "..", "..");

dotenv.config({ path: path.join(packageRoot, ".env"), quiet: true });

/** "true"/"1"/"yes" → true. Anything else → false. */
const bool = (fallback: boolean) =>
  z
    .string()
    .optional()
    .transform((v) =>
      v === undefined || v.trim() === ""
        ? fallback
        : ["true", "1", "yes", "on"].includes(v.trim().toLowerCase())
    );

const int = (fallback: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined || v.trim() === "" ? fallback : Number(v)))
    .pipe(z.number().int().positive());

/** Trimmed, with a default when absent or blank. */
const str = (fallback: string) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined || v.trim() === "" ? fallback : v.trim()));

/** Trimmed, may be empty — for genuinely optional values. */
const optional = z
  .string()
  .optional()
  .transform((v) => v?.trim() ?? "");

const isProduction = process.env.NODE_ENV === "production";

const schema = z.object({
  NODE_ENV: str("development"),
  PORT: int(4000),
  LOG_LEVEL: str("info"),

  PUBLIC_API_URL: str("http://localhost:4000"),
  PUBLIC_SITE_URL: str("http://localhost:3000"),
  CORS_ORIGINS: str("http://localhost:3000,http://localhost:3001"),

  DB_HOST: str("127.0.0.1"),
  DB_PORT: int(3306),
  DB_USER: str("root"),
  DB_PASSWORD: optional,
  DB_NAME: str("avri_energy"),
  DB_CONNECTION_LIMIT: int(10),

  /**
   * In production a signing key must be supplied and must be long enough to be
   * worth signing with. In development we fall back to a fixed string so the
   * server starts out of the box — it is obviously not a secret, which is the
   * point.
   */
  JWT_SECRET: isProduction
    ? z.string().min(32, "JWT_SECRET must be at least 32 characters in production")
    : str("development-only-insecure-jwt-secret-do-not-ship"),
  JWT_EXPIRES_IN: str("8h"),
  COOKIE_NAME: str("avri_admin"),
  COOKIE_DOMAIN: optional,
  BCRYPT_ROUNDS: int(12),

  STORAGE_ROOT: str("./storage"),
  MAX_RESUME_BYTES: int(5 * 1024 * 1024),
  MAX_IMAGE_BYTES: int(3 * 1024 * 1024),
  MIN_FREE_DISK_BYTES: int(2 * 1024 * 1024 * 1024),

  MAIL_ENABLED: bool(false),
  SMTP_HOST: str("smtp.gmail.com"),
  SMTP_PORT: int(465),
  SMTP_SECURE: bool(true),
  SMTP_USER: optional,
  SMTP_PASS: optional,
  MAIL_FROM_NAME: str("Avri Energy Website"),
  MAIL_FROM: optional,
  MAIL_HR_TO: optional,
  MAIL_SALES_TO: optional,
  MAIL_BCC: optional,
  MAIL_ACK_ENABLED: bool(true),

  REVALIDATE_URL: optional,
  REVALIDATE_SECRET: optional,

  RATE_LIMIT_ENABLED: bool(true),
  TRUST_PROXY: z
    .string()
    .optional()
    .transform((v) => (v === undefined || v.trim() === "" ? 0 : Number(v)))
    .pipe(z.number().int().nonnegative()),

  SEED_ADMIN_NAME: optional,
  SEED_ADMIN_EMAIL: optional,
  SEED_ADMIN_PASSWORD: optional,
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const lines = parsed.error.issues.map(
    (issue) => `  ${issue.path.join(".") || "(root)"}: ${issue.message}`
  );
  console.error(
    `Invalid environment configuration in server/.env:\n${lines.join("\n")}\n\n` +
      `See server/.env.example for what each value means.`
  );
  process.exit(1);
}

const raw = parsed.data;

const trimSlash = (u: string) => u.replace(/\/$/, "");

export const env = {
  nodeEnv: raw.NODE_ENV,
  isProduction: raw.NODE_ENV === "production",
  isTest: raw.NODE_ENV === "test",
  port: raw.PORT,
  logLevel: raw.LOG_LEVEL,

  publicApiUrl: trimSlash(raw.PUBLIC_API_URL),
  publicSiteUrl: trimSlash(raw.PUBLIC_SITE_URL),
  corsOrigins: raw.CORS_ORIGINS.split(",")
    .map((o) => trimSlash(o.trim()))
    .filter(Boolean),

  db: {
    host: raw.DB_HOST,
    port: raw.DB_PORT,
    user: raw.DB_USER,
    password: raw.DB_PASSWORD,
    database: raw.DB_NAME,
    connectionLimit: raw.DB_CONNECTION_LIMIT,
  },

  jwtSecret: raw.JWT_SECRET,
  jwtExpiresIn: raw.JWT_EXPIRES_IN,
  cookieName: raw.COOKIE_NAME,
  cookieDomain: raw.COOKIE_DOMAIN,
  bcryptRounds: raw.BCRYPT_ROUNDS,

  /** Always absolute, so nothing depends on the process working directory. */
  storageRoot: path.isAbsolute(raw.STORAGE_ROOT)
    ? raw.STORAGE_ROOT
    : path.resolve(packageRoot, raw.STORAGE_ROOT),
  maxResumeBytes: raw.MAX_RESUME_BYTES,
  maxImageBytes: raw.MAX_IMAGE_BYTES,
  minFreeDiskBytes: raw.MIN_FREE_DISK_BYTES,

  mail: {
    enabled: raw.MAIL_ENABLED,
    host: raw.SMTP_HOST,
    port: raw.SMTP_PORT,
    secure: raw.SMTP_SECURE,
    user: raw.SMTP_USER,
    pass: raw.SMTP_PASS,
    fromName: raw.MAIL_FROM_NAME,
    // Gmail rewrites From to the authenticated mailbox anyway, so default to it.
    from: raw.MAIL_FROM || raw.SMTP_USER,
    hrTo: raw.MAIL_HR_TO,
    salesTo: raw.MAIL_SALES_TO,
    bcc: raw.MAIL_BCC,
    ackEnabled: raw.MAIL_ACK_ENABLED,
  },

  revalidateUrl: raw.REVALIDATE_URL,
  revalidateSecret: raw.REVALIDATE_SECRET,

  rateLimitEnabled: raw.RATE_LIMIT_ENABLED,
  trustProxy: raw.TRUST_PROXY,

  seedAdmin: {
    name: raw.SEED_ADMIN_NAME,
    email: raw.SEED_ADMIN_EMAIL,
    password: raw.SEED_ADMIN_PASSWORD,
  },

  packageRoot,
} as const;

/**
 * Configuration that is legal but will bite in production. Logged once at boot
 * rather than throwing, because a site with a broken mailer should still serve
 * job listings.
 */
export function configWarnings(): string[] {
  const warnings: string[] = [];

  if (env.isProduction && env.storageRoot.startsWith(packageRoot)) {
    warnings.push(
      `STORAGE_ROOT (${env.storageRoot}) is inside the deployed code. A rebuild ` +
        `or fresh clone will orphan every uploaded résumé. Point it somewhere ` +
        `like /var/lib/avri/storage.`
    );
  }
  if (env.mail.enabled && (!env.mail.user || !env.mail.pass)) {
    warnings.push("MAIL_ENABLED is on but SMTP_USER/SMTP_PASS are blank — mail will fail.");
  }
  if (env.mail.enabled && !env.mail.hrTo) {
    warnings.push("MAIL_HR_TO is blank — nobody will be emailed about new applications.");
  }
  if (env.mail.enabled && !env.mail.salesTo) {
    warnings.push("MAIL_SALES_TO is blank — nobody will be emailed about new enquiries.");
  }
  if (!env.mail.enabled) {
    warnings.push("MAIL_ENABLED is off — nothing is emailed; submissions are stored only.");
  }
  if (!env.revalidateSecret) {
    warnings.push(
      "REVALIDATE_SECRET is blank — publishing will not refresh the public site immediately."
    );
  }
  if (env.isProduction && !env.rateLimitEnabled) {
    warnings.push("RATE_LIMIT_ENABLED is off in production. The public upload route is exposed.");
  }

  return warnings;
}
