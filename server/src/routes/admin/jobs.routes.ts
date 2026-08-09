import { Router } from "express";
import {
  createJob,
  deleteJob,
  getJob,
  jobApplicationCount,
  listJobs,
  updateJob,
} from "../../controllers/admin/jobs.controller.js";
import { requireAuth } from "../../middlewares/auth.js";

export const adminJobsRouter = Router();

adminJobsRouter.use(requireAuth);

adminJobsRouter.get("/", listJobs);
adminJobsRouter.post("/", createJob);
adminJobsRouter.get("/:id", getJob);
adminJobsRouter.patch("/:id", updateJob);
adminJobsRouter.delete("/:id", deleteJob);
adminJobsRouter.get("/:id/application-count", jobApplicationCount);
