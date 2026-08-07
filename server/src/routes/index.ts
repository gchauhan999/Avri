/**
 * Route table.
 *
 * Public routes are open and rate-limited. Admin routes sit behind a JWT
 * cookie *and* the `X-Admin-Request` header — see
 * `middleware/require-admin-header.ts` for why the header is not optional.
 */

import { Router } from "express";
import { requireAdminHeader } from "../middleware/require-admin-header.js";
import { adminWrite } from "../middleware/rate-limit.js";
import { enquiriesRouter } from "./public/enquiries.routes.js";
import { clientsRouter } from "./public/clients.routes.js";
import { jobsRouter } from "./public/jobs.routes.js";
import { applicationsRouter } from "./public/applications.routes.js";
import { postsRouter } from "./public/posts.routes.js";
import { categoriesRouter } from "./public/categories.routes.js";
import { authRouter } from "./admin/auth.routes.js";
import { statsRouter } from "./admin/stats.routes.js";
import { adminEnquiriesRouter } from "./admin/enquiries.routes.js";
import { adminClientsRouter } from "./admin/clients.routes.js";
import { adminJobsRouter } from "./admin/jobs.routes.js";
import { adminApplicationsRouter } from "./admin/applications.routes.js";
import { adminPostsRouter } from "./admin/posts.routes.js";

export const routes = Router();

/* --- Public ------------------------------------------------------------- */

routes.use("/enquiries", enquiriesRouter);
routes.use("/clients", clientsRouter);
routes.use("/jobs", jobsRouter);
routes.use("/applications", applicationsRouter);
routes.use("/posts", postsRouter);
routes.use("/post-categories", categoriesRouter);

/* --- Admin -------------------------------------------------------------- */

const admin = Router();

// Applied to the whole admin surface, including /auth/login: without it the
// login route itself would be postable cross-site as a simple form.
admin.use(requireAdminHeader, adminWrite);

admin.use("/auth", authRouter);
admin.use("/stats", statsRouter);
admin.use("/enquiries", adminEnquiriesRouter);
admin.use("/clients", adminClientsRouter);
admin.use("/jobs", adminJobsRouter);
admin.use("/applications", adminApplicationsRouter);
admin.use("/posts", adminPostsRouter);

routes.use("/admin", admin);
