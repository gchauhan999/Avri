/**
 * The public blog.
 *
 * Only published posts, and only ones whose publish date has actually arrived —
 * scheduling a post for next Tuesday should not make it visible today.
 */

import type { Request, Response } from "express";
import { Op, literal, type Includeable, type WhereOptions } from "sequelize";
import { notFound } from "../../helpers/http-error.js";
import { offsetOf, paged } from "../../helpers/pagination.js";
import { uploadUrl } from "../../helpers/uploads.js";
import { Post, PostCategory } from "../../models/index.js";
import type { Post as PostModel } from "../../models/posts.js";
import { publicPostListQuery } from "../../validations/post.validation.js";

const live = (): WhereOptions<PostModel> => ({
  status: "published",
  [Op.or]: [{ publishedAt: null }, { publishedAt: { [Op.lte]: literal("NOW()") } }],
});


/**
 * The join is present only to flatten two category columns onto each card, so
 * the association contributes no attributes of its own and the two are pulled
 * in by literal instead. `required: true` keeps it an INNER JOIN, matching the
 * NOT NULL foreign key.
 */
const categoryJoin = (where?: WhereOptions): Includeable => ({
  model: PostCategory,
  as: "category",
  attributes: [],
  required: true,
  ...(where ? { where } : {}),
});

const CARD_COLUMNS = [
  "id",
  "slug",
  "title",
  "excerpt",
  "coverImagePath",
  "coverImageAlt",
  "coverImageWidth",
  "coverImageHeight",
  "publishedAt",
  "readingMinutes",
  "isFeatured",
  // Aliases take the *column* name, not the model attribute name.
  ["author_name_snapshot", "authorName"],
  [literal("`category`.`name`"), "categoryName"],
  [literal("`category`.`slug`"), "categorySlug"],
] as const;

const cardColumns = () => [...CARD_COLUMNS] as unknown as string[];

interface CardRow {
  coverImagePath?: string | null;
  coverImageAlt?: string | null;
  [key: string]: unknown;
}

/** Shape a row for the browser: absolute cover URL, no internal paths. */
function toCard(row: CardRow) {
  const { coverImagePath, ...rest } = row;
  return {
    ...rest,
    cover: uploadUrl(coverImagePath ?? null),
    coverAlt: row.coverImageAlt ?? null,
  };
}

export async function listPosts(req: Request, res: Response): Promise<void> {
  const { category, page, limit } = publicPostListQuery.parse(req.query);

  const where = live();
  const categoryWhere = category ? { slug: category } : undefined;

  const [items, total, featuredRows] = await Promise.all([
    Post.findAll({
      attributes: cardColumns(),
      include: [categoryJoin(categoryWhere)],
      where,
      order: [["publishedAt", "DESC"]],
      limit,
      offset: offsetOf(page, limit),
      // The literals above reference the joined alias, which is only in scope
      // when Sequelize emits a single flat query rather than a subquery.
      subQuery: false,
      raw: true,
    }),
    Post.count({ include: [categoryJoin(categoryWhere)], where }),
    // Only on an unfiltered first page — a featured banner above a category
    // listing shows something that is not in the list below it.
    page === 1 && !category
      ? Post.findAll({
          attributes: cardColumns(),
          include: [categoryJoin()],
          where: { ...where, isFeatured: true },
          order: [["publishedAt", "DESC"]],
          limit: 1,
          subQuery: false,
          raw: true,
        })
      : Promise.resolve([]),
  ]);

  const featured = featuredRows[0] ? toCard(featuredRows[0] as unknown as CardRow) : null;

  res.json({
    ...paged(
      (items as unknown as CardRow[]).map(toCard),
      total,
      page,
      limit
    ),
    featured,
  });
}

/** Slugs and timestamps for the sitemap. */
export async function listPostIndex(_req: Request, res: Response): Promise<void> {
  const rows = await Post.findAll({
    attributes: ["slug", "updatedAt"],
    where: live(),
  });
  res.json(rows);
}

export async function getPostBySlug(req: Request, res: Response): Promise<void> {
  const slug = String(req.params.slug ?? "");

  const row = (await Post.findOne({
    attributes: [
      ...cardColumns(),
      "body",
      "updatedAt",
      "seoTitle",
      "seoDescription",
      "seoKeywords",
      "canonicalUrl",
      "categoryId",
    ],
    include: [categoryJoin()],
    where: { slug, ...live() },
    subQuery: false,
    raw: true,
  })) as unknown as (CardRow & { id: number; categoryId: number }) | null;

  if (!row) throw notFound("That article is not available.");

  // Same category first; the query is cheap and keeps readers moving.
  const related = await Post.findAll({
    attributes: cardColumns(),
    include: [categoryJoin()],
    where: { ...live(), categoryId: row.categoryId, id: { [Op.ne]: row.id } },
    order: [["publishedAt", "DESC"]],
    limit: 3,
    subQuery: false,
    raw: true,
  });

  const { categoryId: _categoryId, ...rest } = row;

  res.json({
    ...toCard(rest),
    related: (related as unknown as CardRow[]).map(toCard),
  });
}
