/**
 * Writing and publishing articles.
 */

import { Router } from "express";
import { and, asc, desc, eq, like, ne, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { env } from "../../config/env.js";
import { db } from "../../db/client.js";
import { postCategories, posts } from "../../db/schema.js";
import { notFound, unprocessable } from "../../lib/http-error.js";
import { offsetOf, pageQuery, paged } from "../../lib/pagination.js";
import { slugify, uniqueSlug } from "../../lib/slug.js";
import { requireAuth } from "../../middleware/auth.js";
import { imageUpload } from "../../middleware/upload.js";
import { processImage, publicImageAbsolute } from "../../services/images.js";
import { revalidate } from "../../services/revalidate.js";
import { autoExcerpt, readingMinutes, sanitiseArticleHtml } from "../../services/sanitise.js";
import { removeQuietly } from "../../services/storage.js";

export const adminPostsRouter = Router();

adminPostsRouter.use(requireAuth);

const imageUrl = (stored: string | null) =>
  stored ? `${env.publicApiUrl}/uploads/${stored.replace(/^public\//, "")}` : null;

const shape = (row: typeof posts.$inferSelect) => ({
  ...row,
  cover: imageUrl(row.coverImagePath),
});

/* -------------------------------------------------------------------------- */
/*  Categories                                                                 */
/* -------------------------------------------------------------------------- */

adminPostsRouter.get("/categories", async (_req, res) => {
  const rows = await db
    .select()
    .from(postCategories)
    .orderBy(asc(postCategories.sortOrder), asc(postCategories.name));
  res.json({ items: rows });
});

/* -------------------------------------------------------------------------- */
/*  Posts                                                                      */
/* -------------------------------------------------------------------------- */

const listQuery = pageQuery.extend({
  status: z.enum(["draft", "published", "archived"]).optional(),
  category: z.coerce.number().int().positive().optional(),
  q: z.string().trim().max(120).optional(),
});

adminPostsRouter.get("/", async (req, res) => {
  const { page, limit, status, category, q } = listQuery.parse(req.query);

  const filters: SQL[] = [];
  if (status) filters.push(eq(posts.status, status));
  if (category) filters.push(eq(posts.categoryId, category));
  if (q) {
    const term = `%${q}%`;
    const search = or(like(posts.title, term), like(posts.excerpt, term));
    if (search) filters.push(search);
  }
  const where = filters.length ? and(...filters) : undefined;

  const [items, [count]] = await Promise.all([
    db
      .select({
        id: posts.id,
        slug: posts.slug,
        title: posts.title,
        status: posts.status,
        publishedAt: posts.publishedAt,
        isFeatured: posts.isFeatured,
        readingMinutes: posts.readingMinutes,
        authorName: posts.authorNameSnapshot,
        updatedAt: posts.updatedAt,
        categoryName: postCategories.name,
        categoryId: posts.categoryId,
      })
      .from(posts)
      .innerJoin(postCategories, eq(posts.categoryId, postCategories.id))
      .where(where)
      .orderBy(desc(posts.updatedAt))
      .limit(limit)
      .offset(offsetOf(page, limit)),
    db.select({ n: sql<number>`count(*)` }).from(posts).where(where),
  ]);

  res.json(paged(items, Number(count?.n ?? 0), page, limit));
});

adminPostsRouter.get("/:id", async (req, res) => {
  const [row] = await db.select().from(posts).where(eq(posts.id, Number(req.params.id))).limit(1);
  if (!row) throw notFound("No such article.");
  res.json(shape(row));
});

const bodySchema = z.object({
  title: z.string().trim().min(3, "Give the article a title.").max(220),
  categoryId: z.coerce.number().int().positive({ message: "Choose a category." }),
  excerpt: z.string().trim().max(400).optional().transform((v) => v || null),
  /** HTML from the editor. Sanitised below, never trusted as given. */
  body: z.string().min(1, "The article is empty.").max(200_000, "That article is too long."),
  coverImagePath: z.string().trim().max(400).optional().transform((v) => v || null),
  coverImageAlt: z.string().trim().max(255).optional().transform((v) => v || null),
  coverImageWidth: z.coerce.number().int().positive().optional(),
  coverImageHeight: z.coerce.number().int().positive().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  publishedAt: z
    .union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}([ T]\d{2}:\d{2}(:\d{2})?)?$/)])
    .optional()
    .transform((v) => (v ? v.replace("T", " ") : null)),
  isFeatured: z.boolean().default(false),
  seoTitle: z.string().trim().max(200).optional().transform((v) => v || null),
  seoDescription: z.string().trim().max(320).optional().transform((v) => v || null),
  seoKeywords: z.string().trim().max(400).optional().transform((v) => v || null),
});

async function assertCategoryExists(categoryId: number) {
  const [category] = await db
    .select({ id: postCategories.id })
    .from(postCategories)
    .where(eq(postCategories.id, categoryId))
    .limit(1);
  if (!category) throw unprocessable({ categoryId: "That category no longer exists." });
}

/**
 * Only one post is featured at a time — the public index renders a single
 * banner, so a second one would silently never appear.
 */
async function clearOtherFeatured(exceptId?: number) {
  await db
    .update(posts)
    .set({ isFeatured: false })
    .where(exceptId ? and(eq(posts.isFeatured, true), ne(posts.id, exceptId)) : eq(posts.isFeatured, true));
}

adminPostsRouter.post("/", async (req, res) => {
  const data = bodySchema.parse(req.body);
  await assertCategoryExists(data.categoryId);

  const body = sanitiseArticleHtml(data.body);

  const slug = await uniqueSlug(data.title, async (candidate) => {
    const [hit] = await db.select({ id: posts.id }).from(posts).where(eq(posts.slug, candidate)).limit(1);
    return Boolean(hit);
  });

  const publishing = data.status === "published";

  const [result] = await db.insert(posts).values({
    title: data.title,
    slug,
    categoryId: data.categoryId,
    excerpt: data.excerpt ?? autoExcerpt(body),
    body,
    coverImagePath: data.coverImagePath,
    coverImageAlt: data.coverImageAlt,
    coverImageWidth: data.coverImageWidth ?? null,
    coverImageHeight: data.coverImageHeight ?? null,
    status: data.status,
    publishedAt: data.publishedAt ?? (publishing ? sql`NOW()` : null) as never,
    readingMinutes: readingMinutes(body),
    isFeatured: data.isFeatured,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    seoKeywords: data.seoKeywords,
    authorId: req.admin!.id,
    authorNameSnapshot: req.admin!.name,
  });

  if (data.isFeatured) await clearOtherFeatured(result.insertId);

  const [row] = await db.select().from(posts).where(eq(posts.id, result.insertId)).limit(1);
  void revalidate(["posts"], ["/blog", `/blog/${row!.slug}`]);
  res.status(201).json(shape(row!));
});

adminPostsRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [existing] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!existing) throw notFound("No such article.");

  const data = bodySchema.partial().parse(req.body);
  if (data.categoryId) await assertCategoryExists(data.categoryId);

  const updates: Record<string, unknown> = { ...data };

  if (data.body !== undefined) {
    const body = sanitiseArticleHtml(data.body);
    updates.body = body;
    updates.readingMinutes = readingMinutes(body);
    if (data.excerpt === undefined && !existing.excerpt) updates.excerpt = autoExcerpt(body);
  }

  if (data.title && slugify(data.title) !== existing.slug) {
    updates.slug = await uniqueSlug(data.title, async (candidate) => {
      const [hit] = await db
        .select({ id: posts.id })
        .from(posts)
        .where(and(eq(posts.slug, candidate), ne(posts.id, id)))
        .limit(1);
      return Boolean(hit);
    });
  }

  // Stamp the first publish; re-publishing later must not move the date and
  // make an old article look new.
  if (data.status === "published" && !existing.publishedAt && !data.publishedAt) {
    updates.publishedAt = sql`NOW()`;
  }

  await db.update(posts).set(updates).where(eq(posts.id, id));

  if (data.isFeatured) await clearOtherFeatured(id);

  if (data.coverImagePath !== undefined && existing.coverImagePath && existing.coverImagePath !== data.coverImagePath) {
    await removeQuietly(publicImageAbsolute(existing.coverImagePath));
  }

  const [row] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  void revalidate(["posts"], ["/blog", `/blog/${row!.slug}`, `/blog/${existing.slug}`]);
  res.json(shape(row!));
});

adminPostsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [existing] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!existing) throw notFound("No such article.");

  await db.delete(posts).where(eq(posts.id, id));
  if (existing.coverImagePath) await removeQuietly(publicImageAbsolute(existing.coverImagePath));

  void revalidate(["posts"], ["/blog", `/blog/${existing.slug}`]);
  res.status(204).end();
});

/** Cover image upload — same two-step pattern as client logos. */
adminPostsRouter.post("/cover", imageUpload.single("image"), async (req, res) => {
  if (!req.file) throw unprocessable({ image: "Choose an image to upload." });

  const stored = await processImage(
    req.file.buffer,
    req.file.mimetype,
    "post_cover",
    env.publicApiUrl
  );

  res.status(201).json(stored);
});
