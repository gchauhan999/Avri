/**
 * Job applications, including the résumé each one arrived with.
 *
 * `jobTitleSnapshot` is frozen at submission so the record survives the job
 * being renamed or deleted.
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
import type { Job } from "./jobs.js";

export const APPLICATION_STATUSES = [
  "new",
  "shortlisted",
  "interviewing",
  "rejected",
  "hired",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const EMAIL_STATUSES = ["pending", "sent", "failed", "skipped"] as const;
export type EmailStatus = (typeof EMAIL_STATUSES)[number];

export class Application extends Model<
  InferAttributes<Application>,
  InferCreationAttributes<Application>
> {
  declare id: CreationOptional<number>;
  /** Null for a speculative application, or once the job is deleted. */
  declare jobId: CreationOptional<ForeignKey<Job["id"]> | null>;
  declare jobTitleSnapshot: string;

  declare fullName: string;
  declare email: string;
  declare phone: string;
  /** Last 10 digits, for search and duplicate detection. */
  declare phoneNormalised: string;
  declare currentLocation: CreationOptional<string | null>;
  /** DECIMAL(4,1) — mysql2 hands these back as strings, not numbers. */
  declare experienceYears: CreationOptional<string | null>;
  declare currentCompany: CreationOptional<string | null>;
  declare noticePeriod: CreationOptional<string | null>;
  declare linkedinUrl: CreationOptional<string | null>;
  declare coverLetter: CreationOptional<string | null>;

  /**
   * Path relative to STORAGE_ROOT. The file itself is never under the static
   * mount — it is only reachable through an authenticated download route.
   */
  declare resumePath: string;
  /** The applicant's own filename, sanitised. Used for Content-Disposition. */
  declare resumeOriginalName: string;
  declare resumeMime: string;
  declare resumeSizeBytes: number;
  /** Lets us spot the same CV submitted twice for one role. */
  declare resumeSha256: string;

  declare status: CreationOptional<ApplicationStatus>;
  declare adminNotes: CreationOptional<string | null>;

  /**
   * Mail is sent after the row is written and never blocks the response, so
   * delivery has to be tracked here. A failed row is retried and badged in
   * the dashboard rather than lost.
   */
  declare emailStatus: CreationOptional<EmailStatus>;
  declare emailError: CreationOptional<string | null>;
  declare emailAttempts: CreationOptional<number>;

  /** INET6_ATON form, so IPv6 fits. Written with a SQL function, never read. */
  declare sourceIp: CreationOptional<Buffer | null>;
  declare userAgent: CreationOptional<string | null>;
  declare createdAt: CreationOptional<string>;
  declare updatedAt: CreationOptional<string>;

  declare job?: NonAttribute<Job | null>;
}

Application.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    jobId: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: "job_id" },
    jobTitleSnapshot: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: "job_title_snapshot",
    },

    fullName: { type: DataTypes.STRING(160), allowNull: false, field: "full_name" },
    email: { type: DataTypes.STRING(255), allowNull: false },
    phone: { type: DataTypes.STRING(20), allowNull: false },
    phoneNormalised: {
      type: DataTypes.CHAR(10),
      allowNull: false,
      field: "phone_normalised",
    },
    currentLocation: {
      type: DataTypes.STRING(160),
      allowNull: true,
      field: "current_location",
    },
    experienceYears: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: true,
      field: "experience_years",
    },
    currentCompany: {
      type: DataTypes.STRING(160),
      allowNull: true,
      field: "current_company",
    },
    noticePeriod: { type: DataTypes.STRING(60), allowNull: true, field: "notice_period" },
    linkedinUrl: { type: DataTypes.STRING(300), allowNull: true, field: "linkedin_url" },
    coverLetter: { type: DataTypes.TEXT, allowNull: true, field: "cover_letter" },

    resumePath: { type: DataTypes.STRING(400), allowNull: false, field: "resume_path" },
    resumeOriginalName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "resume_original_name",
    },
    resumeMime: { type: DataTypes.STRING(120), allowNull: false, field: "resume_mime" },
    resumeSizeBytes: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      field: "resume_size_bytes",
    },
    resumeSha256: { type: DataTypes.CHAR(64), allowNull: false, field: "resume_sha256" },

    status: {
      type: DataTypes.ENUM(...APPLICATION_STATUSES),
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

    // The real column is VARBINARY(16), created by the migration. Sequelize has
    // no VARBINARY type; BLOB reads and writes the same Buffer either way.
    sourceIp: { type: DataTypes.BLOB, allowNull: true, field: "source_ip" },
    userAgent: { type: DataTypes.STRING(400), allowNull: true, field: "user_agent" },
    createdAt: { type: DataTypes.DATE, allowNull: false, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, allowNull: false, field: "updated_at" },
  },
  {
    sequelize,
    modelName: "Application",
    tableName: "applications",
    timestamps: true,
  }
);
