import { Router } from "express";
import { badgeCounts, dashboard } from "../../controllers/admin/stats.controller.js";
import { requireAuth } from "../../middlewares/auth.js";

export const statsRouter = Router();

statsRouter.use(requireAuth);

statsRouter.get("/counts", badgeCounts);
statsRouter.get("/", dashboard);
