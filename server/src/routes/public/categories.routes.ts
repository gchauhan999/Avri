/**
 * Blog categories, with a count of live posts in each.
 *
 * The count is what lets the public filter rail hide categories that have
 * nothing in them yet, rather than offering a chip that leads to an empty
 * page.
 */

import { Router } from "express";
import { and, asc, eq, isNull, lte, or, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { postCategories, posts } from "../../db/schema.js";
import { publicRead } from "../../middleware/rate-limit.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", publicRead, async (_req, res) => {
  const rows = await db
    .select({
      id: postCategories.id,
      name: postCategories.name,
      slug: postCategories.slug,
      description: postCategories.description,
      postCount: sql<number>`(
        SELECT COUNT(*) FROM posts p
         WHERE p.category_id = ${postCategories.id}
           AND p.status = 'published'
           AND (p.published_at IS NULL OR p.published_at <= NOW())
      )`,
    })
    .from(postCategories)
    .orderBy(asc(postCategories.sortOrder), asc(postCategories.name));

  res.json(rows.map((row) => ({ ...row, postCount: Number(row.postCount) })));
});

/** Referenced by the admin editor's category dropdown. */
categoriesRouter.get("/live", publicRead, async (_req, res) => {
  const rows = await db
    .select({ slug: postCategories.slug })
    .from(posts)
    .innerJoin(postCategories, eq(posts.categoryId, postCategories.id))
    .where(
      and(
        eq(posts.status, "published"),
        or(isNull(posts.publishedAt), lte(posts.publishedAt, sql`NOW()`))
      )
    )
    .groupBy(postCategories.slug);

  res.json(rows.map((r) => r.slug));
});
