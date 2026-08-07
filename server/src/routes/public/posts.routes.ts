/**
 * The public blog.
 *
 * Only published posts, and only ones whose publish date has actually arrived
 * — scheduling a post for next Tuesday should not make it visible today.
 */

import { Router } from "express";
import { and, desc, eq, isNull, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { env } from "../../config/env.js";
import { db } from "../../db/client.js";
import { postCategories, posts } from "../../db/schema.js";
import { notFound } from "../../lib/http-error.js";
import { offsetOf, paged } from "../../lib/pagination.js";
import { publicRead } from "../../middleware/rate-limit.js";

export const postsRouter = Router();

const live = () =>
  and(
    eq(posts.status, "published"),
    or(isNull(posts.publishedAt), lte(posts.publishedAt, sql`NOW()`))
  );

const imageUrl = (stored: string | null) =>
  stored ? `${env.publicApiUrl}/uploads/${stored.replace(/^public\//, "")}` : null;

const cardColumns = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  coverImagePath: posts.coverImagePath,
  coverImageAlt: posts.coverImageAlt,
  coverImageWidth: posts.coverImageWidth,
  coverImageHeight: posts.coverImageHeight,
  publishedAt: posts.publishedAt,
  readingMinutes: posts.readingMinutes,
  isFeatured: posts.isFeatured,
  authorName: posts.authorNameSnapshot,
  categoryName: postCategories.name,
  categorySlug: postCategories.slug,
};

type CardRow = {
  coverImagePath: string | null;
  coverImageAlt: string | null;
  [key: string]: unknown;
};

/** Shape a row for the browser: absolute cover URL, no internal paths. */
function toCard(row: CardRow) {
  const { coverImagePath, ...rest } = row;
  return {
    ...rest,
    cover: imageUrl(coverImagePath),
    coverAlt: row.coverImageAlt,
  };
}

const listQuery = z.object({
  category: z.string().trim().max(140).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(24).default(9),
});

postsRouter.get("/", publicRead, async (req, res) => {
  const { category, page, limit } = listQuery.parse(req.query);

  const filters: SQL[] = [live()!];
  if (category) filters.push(eq(postCategories.slug, category));
  const where = and(...filters);

  const [items, [count], featuredRows] = await Promise.all([
    db
      .select(cardColumns)
      .from(posts)
      .innerJoin(postCategories, eq(posts.categoryId, postCategories.id))
      .where(where)
      .orderBy(desc(posts.publishedAt))
      .limit(limit)
      .offset(offsetOf(page, limit)),
    db
      .select({ n: sql<number>`count(*)` })
      .from(posts)
      .innerJoin(postCategories, eq(posts.categoryId, postCategories.id))
      .where(where),
    // Only on an unfiltered first page — a featured banner above a category
    // listing shows something that is not in the list below it.
    page === 1 && !category
      ? db
          .select(cardColumns)
          .from(posts)
          .innerJoin(postCategories, eq(posts.categoryId, postCategories.id))
          .where(and(live(), eq(posts.isFeatured, true)))
          .orderBy(desc(posts.publishedAt))
          .limit(1)
      : Promise.resolve([]),
  ]);

  const featured = featuredRows[0] ? toCard(featuredRows[0] as CardRow) : null;

  res.json({
    ...paged(
      items.map((row) => toCard(row as CardRow)),
      Number(count?.n ?? 0),
      page,
      limit
    ),
    featured,
  });
});

/** Slugs and timestamps for the sitemap. */
postsRouter.get("/index", publicRead, async (_req, res) => {
  const rows = await db
    .select({ slug: posts.slug, updatedAt: posts.updatedAt })
    .from(posts)
    .where(live());
  res.json(rows);
});

postsRouter.get("/:slug", publicRead, async (req, res) => {
  const slug = String(req.params.slug ?? "");

  const [row] = await db
    .select({
      ...cardColumns,
      body: posts.body,
      updatedAt: posts.updatedAt,
      seoTitle: posts.seoTitle,
      seoDescription: posts.seoDescription,
      seoKeywords: posts.seoKeywords,
      canonicalUrl: posts.canonicalUrl,
      categoryId: posts.categoryId,
    })
    .from(posts)
    .innerJoin(postCategories, eq(posts.categoryId, postCategories.id))
    .where(and(eq(posts.slug, slug), live()))
    .limit(1);

  if (!row) throw notFound("That article is not available.");

  // Same category first; the query is cheap and keeps readers moving.
  const related = await db
    .select(cardColumns)
    .from(posts)
    .innerJoin(postCategories, eq(posts.categoryId, postCategories.id))
    .where(and(live(), eq(posts.categoryId, row.categoryId), ne(posts.id, row.id)))
    .orderBy(desc(posts.publishedAt))
    .limit(3);

  const { categoryId: _categoryId, ...rest } = row;

  res.json({
    ...toCard(rest as CardRow),
    related: related.map((r) => toCard(r as CardRow)),
  });
});
