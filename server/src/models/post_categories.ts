/** Blog categories. Small, hand-curated, seeded rather than user-created. */

import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class PostCategory extends Model<
  InferAttributes<PostCategory>,
  InferCreationAttributes<PostCategory>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare slug: string;
  declare description: CreationOptional<string | null>;
  declare sortOrder: CreationOptional<number>;
  declare createdAt: CreationOptional<string>;
  declare updatedAt: CreationOptional<string>;
}

PostCategory.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    slug: { type: DataTypes.STRING(140), allowNull: false, unique: true },
    description: { type: DataTypes.STRING(300), allowNull: true },
    sortOrder: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 0,
      field: "sort_order",
    },
    createdAt: { type: DataTypes.DATE, allowNull: false, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, allowNull: false, field: "updated_at" },
  },
  {
    sequelize,
    modelName: "PostCategory",
    tableName: "post_categories",
    timestamps: true,
  }
);
