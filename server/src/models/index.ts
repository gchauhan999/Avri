/**
 * Model registry.
 *
 * Every model file calls `init` on import, so importing them here is what
 * registers them with the shared Sequelize instance. Associations are declared
 * in this file rather than inside the model files: they reference each other in
 * both directions, and doing it here keeps the imports acyclic.
 *
 * Import models from this module, not from the individual files, so the
 * associations are guaranteed to have run.
 */

import { sequelize } from "../config/database.js";
import { AdminUser } from "./admin_users.js";
import { Application } from "./applications.js";
import { Client } from "./clients.js";
import { Enquiry } from "./enquiries.js";
import { Job } from "./jobs.js";
import { Post } from "./posts.js";
import { PostCategory } from "./post_categories.js";

/* --- Careers -------------------------------------------------------------- */

Job.belongsTo(AdminUser, { foreignKey: "createdBy", as: "author" });
Job.hasMany(Application, { foreignKey: "jobId", as: "applications" });
Application.belongsTo(Job, { foreignKey: "jobId", as: "job" });

/* --- Blog ----------------------------------------------------------------- */

Post.belongsTo(PostCategory, { foreignKey: "categoryId", as: "category" });
PostCategory.hasMany(Post, { foreignKey: "categoryId", as: "posts" });
Post.belongsTo(AdminUser, { foreignKey: "authorId", as: "author" });

/* --- Clients -------------------------------------------------------------- */

Client.belongsTo(AdminUser, { foreignKey: "authorizedBy", as: "authorizer" });

export { sequelize, AdminUser, Application, Client, Enquiry, Job, Post, PostCategory };

export type { AdminRole } from "./admin_users.js";
export type { ApplicationStatus, EmailStatus } from "./applications.js";
export type { EnquiryKind, EnquiryStatus } from "./enquiries.js";
export type { EmploymentType, JobStatus, SalaryPeriod } from "./jobs.js";
export type { PostStatus } from "./posts.js";
