/**
 * Blog categories, with a count of live posts in each.
 *
 * The count is what lets the public filter rail hide categories that have
 * nothing in them yet, rather than offering a chip that leads to an empty page.
 */

import type { Request, Response } from "express";
import { Op, literal } from "sequelize";
import { Post, PostCategory } from "../../models/index.js";

/**
 * A post is live when it is published and its embargo, if any, has passed.
 * Written as SQL because it is used inside a correlated subquery below as well
 * as in a normal WHERE clause.
 */
const LIVE_POST_SQL = "p.status = 'published' AND (p.published_at IS NULL OR p.published_at <= NOW())";

export async function listCategories(_req: Request, res: Response): Promise<void> {
  const rows = (await PostCategory.findAll({
    attributes: [
      "id",
      "name",
      "slug",
      "description",
      [
        literal(
          `(SELECT COUNT(*) FROM posts p WHERE p.category_id = \`PostCategory\`.\`id\` AND ${LIVE_POST_SQL})`
        ),
        "postCount",
      ],
    ],
    order: [
      ["sortOrder", "ASC"],
      ["name", "ASC"],
    ],
    raw: true,
  })) as unknown as Array<{
    id: number;
    name: string;
    slug: string;
    description: string | null;
    postCount: number | string;
  }>;

  res.json(rows.map((row) => ({ ...row, postCount: Number(row.postCount) })));
}

/** Referenced by the admin editor's category dropdown. */
export async function listLiveCategorySlugs(_req: Request, res: Response): Promise<void> {
  const rows = (await PostCategory.findAll({
    attributes: ["slug"],
    include: [
      {
        model: Post,
        as: "posts",
        attributes: [],
        required: true,
        where: {
          status: "published",
          [Op.or]: [{ publishedAt: null }, { publishedAt: { [Op.lte]: literal("NOW()") } }],
        },
      },
    ],
    group: ["PostCategory.slug"],
    raw: true,
  })) as unknown as Array<{ slug: string }>;

  res.json(rows.map((row) => row.slug));
}
