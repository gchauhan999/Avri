/**
 * Job openings.
 *
 * `salaryRange` is free text for the card ("₹4–6 LPA"); the structured
 * `salaryMin`/`salaryMax`/`salaryPeriod` trio is what feeds the JobPosting
 * structured data.
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

export const EMPLOYMENT_TYPES = ["full_time", "part_time", "contract", "internship"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const JOB_STATUSES = ["draft", "open", "closed"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const SALARY_PERIODS = ["month", "year"] as const;
export type SalaryPeriod = (typeof SALARY_PERIODS)[number];

export class Job extends Model<InferAttributes<Job>, InferCreationAttributes<Job>> {
  declare id: CreationOptional<number>;
  declare title: string;
  declare slug: string;
  declare department: CreationOptional<string | null>;
  declare location: string;
  declare employmentType: CreationOptional<EmploymentType>;
  declare experienceMin: CreationOptional<number | null>;
  declare experienceMax: CreationOptional<number | null>;
  declare openings: CreationOptional<number>;
  declare salaryRange: CreationOptional<string | null>;
  declare salaryMin: CreationOptional<number | null>;
  declare salaryMax: CreationOptional<number | null>;
  declare salaryPeriod: CreationOptional<SalaryPeriod | null>;
  /** One line for the card, and the meta description. */
  declare summary: string;
  declare description: string;
  /** Rendered as bullet lists and as the JobPosting description. */
  declare responsibilities: CreationOptional<string[] | null>;
  declare requirements: CreationOptional<string[] | null>;
  declare status: CreationOptional<JobStatus>;
  declare publishedAt: CreationOptional<string | null>;
  /**
   * Google demotes sites that keep expired JobPosting markup live, so this
   * feeds `validThrough` and the public route 404s once it passes.
   */
  declare closesAt: CreationOptional<string | null>;
  declare seoTitle: CreationOptional<string | null>;
  declare seoDescription: CreationOptional<string | null>;
  declare createdBy: CreationOptional<ForeignKey<AdminUser["id"]> | null>;
  declare createdAt: CreationOptional<string>;
  declare updatedAt: CreationOptional<string>;

  declare author?: NonAttribute<AdminUser | null>;
}

Job.init(
  {
    id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    slug: { type: DataTypes.STRING(220), allowNull: false, unique: true },
    department: { type: DataTypes.STRING(120), allowNull: true },
    location: { type: DataTypes.STRING(160), allowNull: false },
    employmentType: {
      type: DataTypes.ENUM(...EMPLOYMENT_TYPES),
      allowNull: false,
      defaultValue: "full_time",
      field: "employment_type",
    },
    experienceMin: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      field: "experience_min",
    },
    experienceMax: {
      type: DataTypes.TINYINT.UNSIGNED,
      allowNull: true,
      field: "experience_max",
    },
    openings: { type: DataTypes.SMALLINT.UNSIGNED, allowNull: false, defaultValue: 1 },
    salaryRange: { type: DataTypes.STRING(120), allowNull: true, field: "salary_range" },
    salaryMin: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: "salary_min" },
    salaryMax: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: "salary_max" },
    salaryPeriod: {
      type: DataTypes.ENUM(...SALARY_PERIODS),
      allowNull: true,
      defaultValue: "month",
      field: "salary_period",
    },
    summary: { type: DataTypes.STRING(500), allowNull: false },
    description: { type: DataTypes.TEXT("medium"), allowNull: false },
    responsibilities: { type: DataTypes.JSON, allowNull: true },
    requirements: { type: DataTypes.JSON, allowNull: true },
    status: {
      type: DataTypes.ENUM(...JOB_STATUSES),
      allowNull: false,
      defaultValue: "draft",
    },
    publishedAt: { type: DataTypes.DATE, allowNull: true, field: "published_at" },
    closesAt: { type: DataTypes.DATEONLY, allowNull: true, field: "closes_at" },
    seoTitle: { type: DataTypes.STRING(200), allowNull: true, field: "seo_title" },
    seoDescription: { type: DataTypes.STRING(320), allowNull: true, field: "seo_description" },
    createdBy: { type: DataTypes.BIGINT.UNSIGNED, allowNull: true, field: "created_by" },
    createdAt: { type: DataTypes.DATE, allowNull: false, field: "created_at" },
    updatedAt: { type: DataTypes.DATE, allowNull: false, field: "updated_at" },
  },
  {
    sequelize,
    modelName: "Job",
    tableName: "jobs",
    timestamps: true,
  }
);
