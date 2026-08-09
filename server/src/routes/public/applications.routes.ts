import { Router } from "express";
import { submitApplication } from "../../controllers/public/applications.controller.js";
import { applicationWrite } from "../../middlewares/rate-limit.js";
import { resumeUpload } from "../../middlewares/upload.js";

export const applicationsRouter = Router();

applicationsRouter.post(
  "/",
  applicationWrite,
  resumeUpload.single("resume"),
  submitApplication
);
