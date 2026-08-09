import { Router } from "express";
import {
  deleteApplication,
  downloadResume,
  getApplication,
  listApplications,
  listJobsWithApplications,
  resendApplicationEmail,
  updateApplication,
} from "../../controllers/admin/applications.controller.js";
import { requireAuth } from "../../middlewares/auth.js";

export const adminApplicationsRouter = Router();

adminApplicationsRouter.use(requireAuth);

adminApplicationsRouter.get("/", listApplications);
// Declared before "/:id" so the literal path is not swallowed by the param.
adminApplicationsRouter.get("/jobs", listJobsWithApplications);
adminApplicationsRouter.get("/:id", getApplication);
adminApplicationsRouter.patch("/:id", updateApplication);
adminApplicationsRouter.get("/:id/resume", downloadResume);
adminApplicationsRouter.post("/:id/resend", resendApplicationEmail);
adminApplicationsRouter.delete("/:id", deleteApplication);
