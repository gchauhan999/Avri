/**
 * Database schema.
 *
 * Seven tables, all InnoDB / utf8mb4. Editorial content that changes once or
 * twice a year — services, industries, projects, the product catalogue — stays
 * in `client/lib/site.ts` and deploys with the code. Only content that changes
 * on a business cadence lives here: clients, blog posts, job openings, and the
 * two kinds of inbound message.
 *
 * Run `npm run db:generate` after editing, read the SQL it produces, then
 * `npm run db:migrate`.
 */

import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  char,
  date,
  datetime,
  decimal,
  index,
  int,
  json,
  mediumtext,
  mysqlEnum,
  mysqlTable,
  smallint,
  text,
  timestamp,
  tinyint,
  uniqueIndex,
  varbinary,
  varchar,
} from "drizzle-orm/mysql-core";

/** Every table gets these two, and nothing sets them by hand. */
const stamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
};

const id = () => bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey();

/* -------------------------------------------------------------------------- */
/*  Admin users                                                                */
/* -------------------------------------------------------------------------- */

export const adminUsers = mysqlTable(
  "admin_users",
  {
    id: id(),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    /** bcrypt. Never selected into any response payload. */
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["super_admin", "editor"]).notNull().default("editor"),
    isActive: boolean("is_active").notNull().default(true),
    mustChangePassword: boolean("must_change_password").notNull().default(false),
    /**
     * Bumped on password change or forced sign-out. Every request compares it
     * against the value baked into the token, which gives instant revocation
     * without a session table.
     */
    tokenVersion: int("token_version", { unsigned: true }).notNull().default(0),
    lastLoginAt: datetime("last_login_at"),
    /** Lockout survives an IP change, which per-IP rate limiting does not. */
    failedAttempts: smallint("failed_attempts", { unsigned: true }).notNull().default(0),
    lockedUntil: datetime("locked_until"),
    ...stamps,
  },
  (t) => [uniqueIndex("uq_admin_users_email").on(t.email)]
);

/* -------------------------------------------------------------------------- */
/*  Careers                                                                    */
/* -------------------------------------------------------------------------- */

export const jobs = mysqlTable(
  "jobs",
  {
    id: id(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 220 }).notNull(),
    department: varchar("department", { length: 120 }),
    location: varchar("location", { length: 160 }).notNull(),
    employmentType: mysqlEnum("employment_type", [
      "full_time",
      "part_time",
      "contract",
      "internship",
    ])
      .notNull()
      .default("full_time"),
    experienceMin: tinyint("experience_min", { unsigned: true }),
    experienceMax: tinyint("experience_max", { unsigned: true }),
    openings: smallint("openings", { unsigned: true }).notNull().default(1),
    /** Free text, e.g. "₹4–6 LPA". Structured salary drives JobPosting below. */
    salaryRange: varchar("salary_range", { length: 120 }),
    salaryMin: int("salary_min", { unsigned: true }),
    salaryMax: int("salary_max", { unsigned: true }),
    salaryPeriod: mysqlEnum("salary_period", ["month", "year"]).default("month"),
    /** One line for the card, and the meta description. */
    summary: varchar("summary", { length: 500 }).notNull(),
    description: mediumtext("description").notNull(),
    /** string[] — rendered as bullet lists and as the JobPosting description. */
    responsibilities: json("responsibilities").$type<string[]>(),
    requirements: json("requirements").$type<string[]>(),
    status: mysqlEnum("status", ["draft", "open", "closed"]).notNull().default("draft"),
    publishedAt: datetime("published_at"),
    /**
     * Google demotes sites that keep expired JobPosting markup live, so this
     * feeds `validThrough` and the public route 404s once it passes.
     */
    closesAt: date("closes_at"),
    seoTitle: varchar("seo_title", { length: 200 }),
    seoDescription: varchar("seo_description", { length: 320 }),
    createdBy: bigint("created_by", { mode: "number", unsigned: true }).references(
      () => adminUsers.id,
      { onDelete: "set null" }
    ),
    ...stamps,
  },
  (t) => [
    uniqueIndex("uq_jobs_slug").on(t.slug),
    index("idx_jobs_status_published").on(t.status, t.publishedAt),
    index("idx_jobs_department").on(t.department),
  ]
);

export const applications = mysqlTable(
  "applications",
  {
    id: id(),
    /** Null for a speculative application, or once the job is deleted. */
    jobId: bigint("job_id", { mode: "number", unsigned: true }).references(() => jobs.id, {
      onDelete: "set null",
    }),
    /** Frozen at submission, so the record survives the job being renamed. */
    jobTitleSnapshot: varchar("job_title_snapshot", { length: 200 }).notNull(),

    fullName: varchar("full_name", { length: 160 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    /** Last 10 digits, for search and duplicate detection. */
    phoneNormalised: char("phone_normalised", { length: 10 }).notNull(),
    currentLocation: varchar("current_location", { length: 160 }),
    experienceYears: decimal("experience_years", { precision: 4, scale: 1 }),
    currentCompany: varchar("current_company", { length: 160 }),
    noticePeriod: varchar("notice_period", { length: 60 }),
    linkedinUrl: varchar("linkedin_url", { length: 300 }),
    coverLetter: text("cover_letter"),

    /**
     * Path relative to STORAGE_ROOT. The file itself is never under the static
     * mount — it is only reachable through an authenticated download route.
     */
    resumePath: varchar("resume_path", { length: 400 }).notNull(),
    /** The applicant's own filename, sanitised. Used for Content-Disposition. */
    resumeOriginalName: varchar("resume_original_name", { length: 255 }).notNull(),
    resumeMime: varchar("resume_mime", { length: 120 }).notNull(),
    resumeSizeBytes: int("resume_size_bytes", { unsigned: true }).notNull(),
    /** Lets us spot the same CV submitted twice for one role. */
    resumeSha256: char("resume_sha256", { length: 64 }).notNull(),

    status: mysqlEnum("status", ["new", "shortlisted", "interviewing", "rejected", "hired"])
      .notNull()
      .default("new"),
    adminNotes: text("admin_notes"),

    /**
     * Mail is sent after the row is written and never blocks the response, so
     * delivery has to be tracked here. A failed row is retried and badged in
     * the dashboard rather than lost.
     */
    emailStatus: mysqlEnum("email_status", ["pending", "sent", "failed", "skipped"])
      .notNull()
      .default("pending"),
    emailError: varchar("email_error", { length: 500 }),
    emailAttempts: tinyint("email_attempts", { unsigned: true }).notNull().default(0),

    /** INET6_ATON form, so IPv6 fits. */
    sourceIp: varbinary("source_ip", { length: 16 }),
    userAgent: varchar("user_agent", { length: 400 }),
    ...stamps,
  },
  (t) => [
    index("idx_applications_job_created").on(t.jobId, t.createdAt),
    index("idx_applications_status").on(t.status, t.createdAt),
    index("idx_applications_email").on(t.email),
    // Not UNIQUE: job_id is nullable and MySQL treats each NULL as distinct, so
    // a unique key would never cover speculative applications. The duplicate
    // check happens in the route.
    index("idx_applications_dedupe").on(t.jobId, t.resumeSha256),
    index("idx_applications_mail").on(t.emailStatus),
  ]
);

/* -------------------------------------------------------------------------- */
/*  Blog / News                                                                */
/* -------------------------------------------------------------------------- */

export const postCategories = mysqlTable(
  "post_categories",
  {
    id: id(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    description: varchar("description", { length: 300 }),
    sortOrder: smallint("sort_order").notNull().default(0),
    ...stamps,
  },
  (t) => [
    uniqueIndex("uq_post_categories_slug").on(t.slug),
    uniqueIndex("uq_post_categories_name").on(t.name),
  ]
);

export const posts = mysqlTable(
  "posts",
  {
    id: id(),
    title: varchar("title", { length: 220 }).notNull(),
    slug: varchar("slug", { length: 240 }).notNull(),
    categoryId: bigint("category_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => postCategories.id, { onDelete: "restrict" }),
    excerpt: varchar("excerpt", { length: 400 }),
    /**
     * HTML from the admin's rich-text editor, sanitised with `sanitize-html`
     * on write. Sanitising on write rather than render means the stored value
     * is already safe wherever it is used.
     */
    body: mediumtext("body").notNull(),
    coverImagePath: varchar("cover_image_path", { length: 400 }),
    coverImageAlt: varchar("cover_image_alt", { length: 255 }),
    /** Stored so next/image never causes layout shift. */
    coverImageWidth: smallint("cover_image_width", { unsigned: true }),
    coverImageHeight: smallint("cover_image_height", { unsigned: true }),
    status: mysqlEnum("status", ["draft", "published", "archived"]).notNull().default("draft"),
    publishedAt: datetime("published_at"),
    readingMinutes: tinyint("reading_minutes", { unsigned: true }),
    isFeatured: boolean("is_featured").notNull().default(false),
    seoTitle: varchar("seo_title", { length: 200 }),
    seoDescription: varchar("seo_description", { length: 320 }),
    seoKeywords: varchar("seo_keywords", { length: 400 }),
    canonicalUrl: varchar("canonical_url", { length: 400 }),
    authorId: bigint("author_id", { mode: "number", unsigned: true }).references(
      () => adminUsers.id,
      { onDelete: "set null" }
    ),
    /** Kept so a byline survives the author's account being removed. */
    authorNameSnapshot: varchar("author_name_snapshot", { length: 160 }),
    viewCount: int("view_count", { unsigned: true }).notNull().default(0),
    ...stamps,
  },
  (t) => [
    uniqueIndex("uq_posts_slug").on(t.slug),
    index("idx_posts_status_published").on(t.status, t.publishedAt),
    index("idx_posts_category_status").on(t.categoryId, t.status, t.publishedAt),
    index("idx_posts_featured").on(t.isFeatured, t.publishedAt),
  ]
);

/* -------------------------------------------------------------------------- */
/*  Clients                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Publishing a company's logo without written permission is a trademark
 * problem, so authorisation is modelled rather than assumed: `isAuthorized`
 * defaults to false, `authorizationNote` records *how* permission was given,
 * and a CHECK constraint (added in the migration) makes it impossible to
 * publish an unauthorised client even by direct SQL.
 */
export const clients = mysqlTable(
  "clients",
  {
    id: id(),
    name: varchar("name", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    logoPath: varchar("logo_path", { length: 400 }),
    logoWidth: smallint("logo_width", { unsigned: true }),
    logoHeight: smallint("logo_height", { unsigned: true }),
    websiteUrl: varchar("website_url", { length: 300 }),
    sector: varchar("sector", { length: 120 }),
    isAuthorized: boolean("is_authorized").notNull().default(false),
    /** e.g. "logo use approved by email from R. Kumar, 2026-03-04". */
    authorizationNote: varchar("authorization_note", { length: 400 }),
    authorizedAt: datetime("authorized_at"),
    authorizedBy: bigint("authorized_by", { mode: "number", unsigned: true }).references(
      () => adminUsers.id,
      { onDelete: "set null" }
    ),
    isPublished: boolean("is_published").notNull().default(false),
    sortOrder: smallint("sort_order").notNull().default(0),
    ...stamps,
  },
  (t) => [
    uniqueIndex("uq_clients_slug").on(t.slug),
    index("idx_clients_public").on(t.isPublished, t.isAuthorized, t.sortOrder),
  ]
);

/* -------------------------------------------------------------------------- */
/*  Enquiries                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Both website forms land here. They share enough columns that two tables
 * would mean two dashboards and two exports; the unused columns are simply
 * null for the other kind.
 */
export const enquiries = mysqlTable(
  "enquiries",
  {
    id: id(),
    kind: mysqlEnum("kind", ["enquiry", "quote_request"]).notNull(),

    name: varchar("name", { length: 160 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    phoneNormalised: char("phone_normalised", { length: 10 }).notNull(),
    /** Optional on the contact form, required on the quote form. */
    email: varchar("email", { length: 255 }),
    company: varchar("company", { length: 180 }),

    /** Contact form only. */
    subject: varchar("subject", { length: 200 }),

    /** Quote form only. */
    service: varchar("service", { length: 160 }),
    industry: varchar("industry", { length: 160 }),
    product: varchar("product", { length: 200 }),
    location: varchar("location", { length: 200 }),
    capacity: varchar("capacity", { length: 120 }),
    budget: varchar("budget", { length: 120 }),
    timeline: varchar("timeline", { length: 120 }),

    message: text("message").notNull(),

    status: mysqlEnum("status", ["new", "contacted", "quoted", "won", "lost", "spam"])
      .notNull()
      .default("new"),
    adminNotes: text("admin_notes"),

    emailStatus: mysqlEnum("email_status", ["pending", "sent", "failed", "skipped"])
      .notNull()
      .default("pending"),
    emailError: varchar("email_error", { length: 500 }),
    emailAttempts: tinyint("email_attempts", { unsigned: true }).notNull().default(0),

    /** Which page the form was submitted from. Useful for attribution. */
    sourcePage: varchar("source_page", { length: 300 }),
    sourceIp: varbinary("source_ip", { length: 16 }),
    userAgent: varchar("user_agent", { length: 400 }),
    ...stamps,
  },
  (t) => [
    index("idx_enquiries_kind_created").on(t.kind, t.createdAt),
    index("idx_enquiries_status").on(t.status, t.createdAt),
    index("idx_enquiries_phone").on(t.phoneNormalised),
    index("idx_enquiries_mail").on(t.emailStatus),
  ]
);

/* -------------------------------------------------------------------------- */
/*  Relations                                                                  */
/* -------------------------------------------------------------------------- */

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  author: one(adminUsers, { fields: [jobs.createdBy], references: [adminUsers.id] }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  job: one(jobs, { fields: [applications.jobId], references: [jobs.id] }),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  category: one(postCategories, {
    fields: [posts.categoryId],
    references: [postCategories.id],
  }),
  author: one(adminUsers, { fields: [posts.authorId], references: [adminUsers.id] }),
}));

export const postCategoriesRelations = relations(postCategories, ({ many }) => ({
  posts: many(posts),
}));

export const clientsRelations = relations(clients, ({ one }) => ({
  authorizer: one(adminUsers, {
    fields: [clients.authorizedBy],
    references: [adminUsers.id],
  }),
}));

/* -------------------------------------------------------------------------- */
/*  Inferred row types                                                         */
/* -------------------------------------------------------------------------- */

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type PostCategory = typeof postCategories.$inferSelect;
export type NewPostCategory = typeof postCategories.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Enquiry = typeof enquiries.$inferSelect;
export type NewEnquiry = typeof enquiries.$inferInsert;

/** Referenced by the migration that adds the clients CHECK constraint. */
export const CLIENTS_PUBLISH_CHECK = sql`is_published = 0 OR is_authorized = 1`;
