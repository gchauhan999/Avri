/**
 * Client companies whose logos appear on the website.
 *
 * Publishing a company's logo without written permission is a trademark
 * problem, so authorisation is modelled rather than assumed: `isAuthorized`
 * defaults to false, `authorizationNote` records *how* permission was given,
 * and a CHECK constraint added by the migration makes it impossible to publish
 * an unauthorised client even by direct SQL.
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

export class Client extends Model<InferAttributes<Client>, InferCreationAttributes<Client>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare slug: string;
  declare logoPath: CreationOptional<string | null>;
  declare logoWidth: CreationOptional<number | null>;
  declare logoHeight: CreationOptional<number | null>;
  declare websiteUrl: CreationOptional<string | null>;
  declare sector: CreationOptional<string | null>;
  declare isAuthorized: CreationOptional<boolean>;
  /** e.g. "logo use approved by email from R. Kumar, 2026-03-04". */
  declare authorizationNote: CreationOptional<string | null>;
  declare authorizedAt: CreationOptional<string | null>;
  declare authorizedBy: CreationOptional<ForeignKey<AdminUser["id"]> | null>;
  declare isPublished: CreationOptional<boolean>;
  declare sortOrder: CreationOptional<number>;
  declare createdAt: CreationOptional<string>;
  declare updatedAt: CreationOptional<string>;

  declare authorizer?: NonAttribute<AdminUser | null>;
}

Client.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(180), allowNull: false },
    slug: { type: DataTypes.STRING(200), allowNull: false, unique: true },
    logoPath: { type: DataTypes.STRING(400), allowNull: true, field: "logo_path" },
    logoWidth: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: true, field: "logo_width" },
    logoHeight: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: true, field: "logo_height" },
    websiteUrl: { type: DataTypes.STRING(300), allowNull: true, field: "website_url" },
    sector: { type: DataTypes.STRING(120), allowNull: true },
    isAuthorized: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_authorized",
    },
    authorizationNote: {
      type: DataTypes.STRING(400),
      allowNull: true,
      field: "authorization_note",
    },
    authorizedAt: { type: DataTypes.DATE, allowNull: true, field: "authorized_at" },
    authorizedBy: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: "authorized_by" },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "is_published",
    },
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
    modelName: "Client",
    tableName: "clients",
    timestamps: true,
  }
);
