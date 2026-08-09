import { Router } from "express";
import {
  getJobBySlug,
  listJobIndex,
  listOpenJobs,
} from "../../controllers/public/jobs.controller.js";
import { publicRead } from "../../middlewares/rate-limit.js";

export const jobsRouter = Router();

jobsRouter.get("/", publicRead, listOpenJobs);
// Declared before "/:slug" so the literal path is not swallowed by the param.
jobsRouter.get("/index", publicRead, listJobIndex);
jobsRouter.get("/:slug", publicRead, getJobBySlug);
