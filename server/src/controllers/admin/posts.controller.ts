/** Writing and publishing articles. */

import type { Request, Response } from "express";
import { Op, literal, type WhereOptions } from "sequelize";
import { notFound, unprocessable } from "../../helpers/http-error.js";
import { offsetOf, paged } from "../../helpers/pagination.js";
import { slugify, uniqueSlug } from "../../helpers/slug.js";
import { uploadUrl } from "../../helpers/uploads.js";
import { Post, PostCategory } from "../../models/index.js";
import type { Post as PostModel } from "../../models/posts.js";
import { processImage, publicImageAbsolute } from "../../services/images.js";
import { revalidate } from "../../services/revalidate.js";
import { autoExcerpt, readingMinutes, sanitiseArticleHtml } from "../../services/sanitise.js";
import { removeQuietly } from "../../services/storage.js";
import { adminPostListQuery, postBodySchema } from "../../validations/post.validation.js";

const shape = (row: PostModel) => ({ ...row.toJSON(), cover: uploadUrl(row.coverImagePath) });

async function findOrFail(id: number): Promise<PostModel> {
  const row = await Post.findByPk(id);
  if (!row) throw notFound("No such article.");
  return row;
}

/** True when some *other* article already holds this slug. */
const slugTaken = (exceptId?: number) => async (candidate: string) => {
  const where = exceptId ? { slug: candidate, id: { [Op.ne]: exceptId } } : { slug: candidate };
  return (await Post.count({ where })) > 0;
};

async function assertCategoryExists(categoryId: number): Promise<void> {
  if ((await PostCategory.count({ where: { id: categoryId } })) === 0) {
    throw unprocessable({ categoryId: "That category no longer exists." });
  }
}

/**
 * Only one post is featured at a time — the public index renders a single
 * banner, so a second one would silently never appear.
 */
async function clearOtherFeatured(exceptId?: number): Promise<void> {
  const where: WhereOptions<PostModel> = exceptId
    ? { isFeatured: true, id: { [Op.ne]: exceptId } }
    : { isFeatured: true };
  await Post.update({ isFeatured: false }, { where });
}

/* --- Categories ----------------------------------------------------------- */

export async function listPostCategories(_req: Request, res: Response): Promise<void> {
  const rows = await PostCategory.findAll({
    order: [
      ["sortOrder", "ASC"],
      ["name", "ASC"],
    ],
  });
  res.json({ items: rows });
}

/* --- Posts ---------------------------------------------------------------- */

export async function listPosts(req: Request, res: Response): Promise<void> {
  const { page, limit, status, category, q } = adminPostListQuery.parse(req.query);

  const where: WhereOptions<PostModel> = {};
  if (status) Object.assign(where, { status });
  if (category) Object.assign(where, { categoryId: category });
  if (q) {
    const term = `%${q}%`;
    Object.assign(where, {
      [Op.or]: [{ title: { [Op.like]: term } }, { excerpt: { [Op.like]: term } }],
    });
  }

  const [items, total] = await Promise.all([
    Post.findAll({
      attributes: [
        "id",
        "slug",
        "title",
        "status",
        "publishedAt",
        "isFeatured",
        "readingMinutes",
        ["author_name_snapshot", "authorName"],
        "updatedAt",
        "categoryId",
        [literal("`category`.`name`"), "categoryName"],
      ],
      include: [{ model: PostCategory, as: "category", attributes: [], required: true }],
      where,
      order: [["updatedAt", "DESC"]],
      limit,
      offset: offsetOf(page, limit),
      // The literal above references the joined alias, which is only in scope
      // when Sequelize emits a single flat query rather than a subquery.
      subQuery: false,
      raw: true,
    }),
    Post.count({ where }),
  ]);

  res.json(paged(items, total, page, limit));
}

export async function getPost(req: Request, res: Response): Promise<void> {
  res.json(shape(await findOrFail(Number(req.params.id))));
}

export async function createPost(req: Request, res: Response): Promise<void> {
  const data = postBodySchema.parse(req.body);
  await assertCategoryExists(data.categoryId);

  const body = sanitiseArticleHtml(data.body);

  const slug = await uniqueSlug(data.title, slugTaken());

  const publishing = data.status === "published";

  const row = await Post.create({
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
    publishedAt:
      data.publishedAt ??
      ((publishing ? literal("NOW()") : null) as unknown as string | null),
    readingMinutes: readingMinutes(body),
    isFeatured: data.isFeatured,
    seoTitle: data.seoTitle,
    seoDescription: data.seoDescription,
    seoKeywords: data.seoKeywords,
    authorId: req.admin!.id,
    authorNameSnapshot: req.admin!.name,
  });

  if (data.isFeatured) await clearOtherFeatured(row.id);

  await row.reload();

  void revalidate(["posts"], ["/blog", `/blog/${row.slug}`]);
  res.status(201).json(shape(row));
}

export async function updatePost(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const existing = await findOrFail(id);

  const data = postBodySchema.partial().parse(req.body);
  if (data.categoryId) await assertCategoryExists(data.categoryId);

  const previousSlug = existing.slug;
  const previousCoverPath = existing.coverImagePath;

  const updates: Record<string, unknown> = { ...data };

  if (data.body !== undefined) {
    const body = sanitiseArticleHtml(data.body);
    updates.body = body;
    updates.readingMinutes = readingMinutes(body);
    if (data.excerpt === undefined && !existing.excerpt) updates.excerpt = autoExcerpt(body);
  }

  if (data.title && slugify(data.title) !== existing.slug) {
    updates.slug = await uniqueSlug(data.title, slugTaken(id));
  }

  // Stamp the first publish; re-publishing later must not move the date and
  // make an old article look new.
  if (data.status === "published" && !existing.publishedAt && !data.publishedAt) {
    updates.publishedAt = literal("NOW()");
  }

  await existing.update(updates);

  if (data.isFeatured) await clearOtherFeatured(id);

  if (
    data.coverImagePath !== undefined &&
    previousCoverPath &&
    previousCoverPath !== data.coverImagePath
  ) {
    await removeQuietly(publicImageAbsolute(previousCoverPath));
  }

  await existing.reload();

  void revalidate(["posts"], ["/blog", `/blog/${existing.slug}`, `/blog/${previousSlug}`]);
  res.json(shape(existing));
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  const existing = await findOrFail(Number(req.params.id));
  const { slug, coverImagePath } = existing;

  await existing.destroy();
  if (coverImagePath) await removeQuietly(publicImageAbsolute(coverImagePath));

  void revalidate(["posts"], ["/blog", `/blog/${slug}`]);
  res.status(204).end();
}

/** Cover image upload — same two-step pattern as client logos. */
export async function uploadPostCover(req: Request, res: Response): Promise<void> {
  if (!req.file) throw unprocessable({ image: "Choose an image to upload." });

  const stored = await processImage(req.file.buffer, req.file.mimetype, "post_cover");

  res.status(201).json(stored);
}
