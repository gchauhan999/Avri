/**
 * Managing job openings.
 */

import { Router } from "express";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/client.js";
import { applications, jobs } from "../../db/schema.js";
import { notFound } from "../../lib/http-error.js";
import { uniqueSlug } from "../../lib/slug.js";
import { requireAuth } from "../../middleware/auth.js";
import { revalidate } from "../../services/revalidate.js";

export const adminJobsRouter = Router();

adminJobsRouter.use(requireAuth);

/** One-per-line in the editor; an array in the database. */
const lines = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => {
    if (!value) return [] as string[];
    const list = Array.isArray(value) ? value : value.split("\n");
    return list.map((line) => line.trim()).filter(Boolean).slice(0, 40);
  });

const bodySchema = z.object({
  title: z.string().trim().min(3, "Give the role a title.").max(200),
  department: z.string().trim().max(120).optional().transform((v) => v || null),
  location: z.string().trim().min(2, "Where is this role based?").max(160),
  employmentType: z.enum(["full_time", "part_time", "contract", "internship"]).default("full_time"),
  experienceMin: z.coerce.number().int().min(0).max(60).optional(),
  experienceMax: z.coerce.number().int().min(0).max(60).optional(),
  openings: z.coerce.number().int().min(1).max(999).default(1),
  salaryRange: z.string().trim().max(120).optional().transform((v) => v || null),
  salaryMin: z.coerce.number().int().min(0).optional(),
  salaryMax: z.coerce.number().int().min(0).optional(),
  salaryPeriod: z.enum(["month", "year"]).default("month"),
  summary: z.string().trim().min(10, "One line describing the role.").max(500),
  description: z.string().trim().min(30, "Describe the role in a little more detail.").max(20000),
  responsibilities: lines,
  requirements: lines,
  status: z.enum(["draft", "open", "closed"]).default("draft"),
  closesAt: z
    .union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.")])
    .optional()
    .transform((v) => v || null),
  seoTitle: z.string().trim().max(200).optional().transform((v) => v || null),
  seoDescription: z.string().trim().max(320).optional().transform((v) => v || null),
});

adminJobsRouter.get("/", async (req, res) => {
  const status = z.enum(["draft", "open", "closed"]).optional().parse(req.query.status);

  const rows = await db
    .select({
      id: jobs.id,
      slug: jobs.slug,
      title: jobs.title,
      department: jobs.department,
      location: jobs.location,
      employmentType: jobs.employmentType,
      status: jobs.status,
      openings: jobs.openings,
      publishedAt: jobs.publishedAt,
      closesAt: jobs.closesAt,
      createdAt: jobs.createdAt,
      // So the list can link straight to the applicants for each role.
      applicationCount: sql<number>`(
        SELECT COUNT(*) FROM applications a WHERE a.job_id = ${jobs.id}
      )`,
    })
    .from(jobs)
    .where(status ? eq(jobs.status, status) : undefined)
    .orderBy(desc(jobs.createdAt));

  res.json({ items: rows });
});

adminJobsRouter.get("/:id", async (req, res) => {
  const [row] = await db.select().from(jobs).where(eq(jobs.id, Number(req.params.id))).limit(1);
  if (!row) throw notFound("No such job.");
  res.json(row);
});

adminJobsRouter.post("/", async (req, res) => {
  const data = bodySchema.parse(req.body);

  const slug = await uniqueSlug(data.title, async (candidate) => {
    const [hit] = await db.select({ id: jobs.id }).from(jobs).where(eq(jobs.slug, candidate)).limit(1);
    return Boolean(hit);
  });

  const [result] = await db.insert(jobs).values({
    ...data,
    slug,
    responsibilities: data.responsibilities,
    requirements: data.requirements,
    createdBy: req.admin!.id,
    // Stamped when it first goes open, and used as JobPosting's datePosted.
    ...(data.status === "open" ? { publishedAt: sql`NOW()` } : {}),
  });

  const [row] = await db.select().from(jobs).where(eq(jobs.id, result.insertId)).limit(1);
  void revalidate(["jobs"], ["/careers"]);
  res.status(201).json(row);
});

adminJobsRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [existing] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  if (!existing) throw notFound("No such job.");

  const data = bodySchema.partial().parse(req.body);

  const updates: Record<string, unknown> = { ...data };

  if (data.title && data.title !== existing.title) {
    updates.slug = await uniqueSlug(data.title, async (candidate) => {
      const [hit] = await db
        .select({ id: jobs.id })
        .from(jobs)
        .where(and(eq(jobs.slug, candidate), ne(jobs.id, id)))
        .limit(1);
      return Boolean(hit);
    });
  }

  // First time it opens, record when — reopening later should not reset it.
  if (data.status === "open" && !existing.publishedAt) {
    updates.publishedAt = sql`NOW()`;
  }

  await db.update(jobs).set(updates).where(eq(jobs.id, id));

  const [row] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  void revalidate(["jobs"], ["/careers", `/careers/${row!.slug}`]);
  res.json(row);
});

adminJobsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [existing] = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  if (!existing) throw notFound("No such job.");

  /**
   * Applications survive. The foreign key is ON DELETE SET NULL and each row
   * keeps a `job_title_snapshot`, so deleting a closed role does not erase the
   * record of who applied for it.
   */
  await db.delete(jobs).where(eq(jobs.id, id));

  void revalidate(["jobs"], ["/careers", `/careers/${existing.slug}`]);
  res.status(204).end();
});

/** Just the count, for the confirm dialog before deleting a role. */
adminJobsRouter.get("/:id/application-count", async (req, res) => {
  const [row] = await db
    .select({ n: sql<number>`count(*)` })
    .from(applications)
    .where(eq(applications.jobId, Number(req.params.id)));
  res.json({ count: Number(row?.n ?? 0) });
});
