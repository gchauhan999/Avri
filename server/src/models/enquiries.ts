/**
 * Inbound messages from both website forms.
 *
 * Contact and quote requests share enough columns that two tables would mean
 * two dashboards and two exports; the unused columns are simply null for the
 * other kind. `kind` says which one a row is.
 */

import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/database.js";
import { EMAIL_STATUSES, type EmailStatus } from "./applications.js";

export const ENQUIRY_KINDS = ["enquiry", "quote_request"] as const;
export type EnquiryKind = (typeof ENQUIRY_KINDS)[number];

export const ENQUIRY_STATUSES = ["new", "contacted", "quoted", "won", "lost", "spam"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export class Enquiry extends Model<InferAttributes<Enquiry>, InferCreationAttributes<Enquiry>> {
  declare id: CreationOptional<number>;
  declare kind: EnquiryKind;

  declare name: string;
  declare phone: string;
  declare phoneNormalised: string;
  /** Optional on the contact form, required on the quote form. */
  declare email: CreationOptional<string | null>;
  declare company: CreationOptional<string | null>;

  /** Contact form only. */
  declare subject: CreationOptional<string | null>;

  /** Quote form only. */
  declare service: CreationOptional<string | null>;
  declare industry: CreationOptional<string | null>;
  declare product: CreationOptional<string | null>;
  declare location: CreationOptional<string | null>;
  declare capacity: CreationOptional<string | null>;
  declare budget: CreationOptional<string | null>;
  declare timeline: CreationOptional<string | null>;

  declare message: string;

  declare status: CreationOptional<EnquiryStatus>;
  declare adminNotes: CreationOptional<string | null>;

  declare emailStatus: CreationOptional<EmailStatus>;
  declare emailError: CreationOptional<string | null>;
  declare emailAttempts: CreationOptional<number>;

  /** Which page the form was submitted from. Useful for attribution. */
  declare sourcePage: CreationOptional<string | null>;
  declare sourceIp: CreationOptional<Buffer | null>;
  declare userAgent: CreationOptional<string | null>;
  declare createdAt: CreationOptional<string>;
  declare updatedAt: CreationOptional<string>;
}

Enquiry.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    kind: { type: DataTypes.ENUM(...ENQUIRY_KINDS), allowNull: false },

    name: { type: DataTypes.STRING(160), allowNull: false },
    phone: { type: DataTypes.STRING(20), allowNull: false },
    phoneNormalised: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      field: "phone_normalised",
    },
    email: { type: DataTypes.STRING(255), allowNull: true },
    company: { type: DataTypes.STRING(180), allowNull: true },

    subject: { type: DataTypes.STRING(200), allowNull: true },

    service: { type: DataTypes.STRING(160), allowNull: true },
    industry: { type: DataTypes.STRING(160), allowNull: true },
    product: { type: DataTypes.STRING(200), allowNull: true },
    location: { type: DataTypes.STRING(200), allowNull: true },
    capacity: { type: DataTypes.STRING(120), allowNull: true },
    budget: { type: DataTypes.STRING(120), allowNull: true },
    timeline: { type: DataTypes.STRING(120), allowNull: true },

    message: { type: DataTypes.TEXT, allowNull: false },

    status: {
      type: DataTypes.ENUM(...ENQUIRY_STATUSES),
      allowNull: false,
      defaultValue: "new",
    },
    adminNotes: { type: DataTypes.TEXT, allowNull: true, field: "admin_notes" },

    emailStatus: {
      type: DataTypes.ENUM(...EMAIL_STATUSES),
      allowNull: false,
      defaultValue: "pending",
      field: "email_status",
    },
    emailError: { type: DataTypes.STRING(500), allowNull: true, field: "email_error" },
    emailAttempts: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
      field: "email_attempts",
    },

    sourcePage: { type: DataTypes.STRING(300), allowNull: true, field: "source_page" },
    // VARBINARY(16) in MySQL — see the note in models/applications.ts.
    sourceIp: { type: DataTypes.BLOB, allowNull: true, field: "source_ip" },
    userAgent: { type: DataTypes.STRING(400), allowNull: true, field: "user_agent" },
    createdAt: { type: DataTypes.DATE, allowNull: false, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, allowNull: false, field: "updated_at" },
  },
  {
    sequelize,
    modelName: "Enquiry",
    tableName: "enquiries",
    timestamps: true,
  }
);
