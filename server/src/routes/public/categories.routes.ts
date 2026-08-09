import { Router } from "express";
import {
  listCategories,
  listLiveCategorySlugs,
} from "../../controllers/public/categories.controller.js";
import { publicRead } from "../../middlewares/rate-limit.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", publicRead, listCategories);
categoriesRouter.get("/live", publicRead, listLiveCategorySlugs);
