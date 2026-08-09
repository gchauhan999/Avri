/**
 * Blog articles.
 *
 * `body` is HTML from the admin's rich-text editor, sanitised with
 * `sanitize-html` on write. Sanitising on write rather than render means the
 * stored value is already safe wherever it is used.
 */

import {
  DataTypes,
  Model,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "sequelize";
import { sequelize } from "../config/database.js";
import type { AdminUser } from "./admin_users.js";
import type { PostCategory } from "./post_categories.js";

export const POST_STATUSES = ["draft", "published", "archived"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export class Post extends Model<InferAttributes<Post>, InferCreationAttributes<Post>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare slug: string;
  declare categoryId: ForeignKey<PostCategory["id"]>;
  declare excerpt: CreationOptional<string | null>;
  declare body: string;
  declare coverImagePath: CreationOptional<string | null>;
  declare coverImageAlt: CreationOptional<string | null>;
  /** Stored so next/image never causes layout shift. */
  declare coverImageWidth: CreationOptional<number | null>;
  declare coverImageHeight: CreationOptional<number | null>;
  declare status: CreationOptional<PostStatus>;
  declare publishedAt: CreationOptional<string | null>;
  declare readingMinutes: CreationOptional<number | null>;
  declare isFeatured: CreationOptional<boolean>;
  declare seoTitle: CreationOptional<string | null>;
  declare seoDescription: CreationOptional<string | null>;
  declare seoKeywords: CreationOptional<string | null>;
  declare canonicalUrl: CreationOptional<string | null>;
  declare authorId: CreationOptional<ForeignKey<AdminUser["id"]> | null>;
  /** Kept so a byline survives the author's account being removed. */
  declare authorNameSnapshot: CreationOptional<string | null>;
  declare viewCount: CreationOptional<number>;
  declare createdAt: CreationOptional<string>;
  declare updatedAt: CreationOptional<string>;

  declare category?: NonAttribute<PostCategory>;
  declare author?: NonAttribute<AdminUser | null>;
}

Post.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(220), allowNull: false },
    slug: { type: DataTypes.STRING(240), allowNull: false, unique: true },
    categoryId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false, field: "category_id" },
    excerpt: { type: DataTypes.STRING(400), allowNull: true },
    body: { type: DataTypes.TEXT("medium"), allowNull: false },
    coverImagePath: {
      type: DataTypes.STRING(400),
      allowNull: true,
      field: "cover_image_path",
    },
    coverImageAlt: { type: DataTypes.STRING(255), allowNull: true, field: "cover_image_alt" },
    coverImageWidth: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true,
      field: "cover_image_width",
    },
    coverImageHeight: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: true,
      field: "cover_image_height",
    },
    status: {
      type: DataTypes.ENUM(...POST_STATUSES),
      allowNull: false,
      defaultValue: "draft",
    },
    publishedAt: { type: DataTypes.DATE, allowNull: true, field: "published_at" },
    readingMinutes: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      field: "reading_minutes",
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_featured",
    },
    seoTitle: { type: DataTypes.STRING(200), allowNull: true, field: "seo_title" },
    seoDescription: { type: DataTypes.STRING(320), allowNull: true, field: "seo_description" },
    seoKeywords: { type: DataTypes.STRING(400), allowNull: true, field: "seo_keywords" },
    canonicalUrl: { type: DataTypes.STRING(400), allowNull: true, field: "canonical_url" },
    authorId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: "author_id" },
    authorNameSnapshot: {
      type: DataTypes.STRING(160),
      allowNull: true,
      field: "author_name_snapshot",
    },
    viewCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: "view_count",
    },
    createdAt: { type: DataTypes.DATE, allowNull: false, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, allowNull: false, field: "updated_at" },
  },
  {
    sequelize,
    modelName: "Post",
    tableName: "posts",
    timestamps: true,
  }
);
