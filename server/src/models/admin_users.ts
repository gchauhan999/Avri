/**
 * Admin accounts.
 *
 * Column types here describe what the migration already created; nothing in
 * this project calls `sequelize.sync()`. Date columns are typed `string` on
 * purpose — see the `typeCast` note in `config/database.ts`.
 */

import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/database.js";

export const ADMIN_ROLES = ["super_admin", "editor"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export class AdminUser extends Model<
  InferAttributes<AdminUser>,
  InferCreationAttributes<AdminUser>
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  /** bcrypt. Never selected into any response payload. */
  declare passwordHash: string;
  declare role: CreationOptional<AdminRole>;
  declare isActive: CreationOptional<boolean>;
  declare mustChangePassword: CreationOptional<boolean>;
  /**
   * Bumped on password change or forced sign-out. Every request compares it
   * against the value baked into the token, which gives instant revocation
   * without a session table.
   */
  declare tokenVersion: CreationOptional<number>;
  declare lastLoginAt: CreationOptional<string | null>;
  /** Lockout survives an IP change, which per-IP rate limiting does not. */
  declare failedAttempts: CreationOptional<number>;
  declare lockedUntil: CreationOptional<string | null>;
  declare createdAt: CreationOptional<string>;
  declare updatedAt: CreationOptional<string>;
}

AdminUser.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(120), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: "password_hash" },
    role: { type: DataTypes.ENUM(...ADMIN_ROLES), allowNull: false, defaultValue: "editor" },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
    mustChangePassword: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: "must_change_password",
    },
    tokenVersion: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: "token_version",
    },
    lastLoginAt: { type: DataTypes.DATE, allowNull: true, field: "last_login_at" },
    failedAttempts: {
      type: DataTypes.SMALLINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: "failed_attempts",
    },
    lockedUntil: { type: DataTypes.DATE, allowNull: true, field: "locked_until" },
    createdAt: { type: DataTypes.DATE, allowNull: false, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, allowNull: false, field: "updated_at" },
  },
  {
    sequelize,
    modelName: "AdminUser",
    tableName: "admin_users",
    timestamps: true,
  }
);
