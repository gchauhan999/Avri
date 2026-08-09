import { Router } from "express";
import {
  getPostBySlug,
  listPostIndex,
  listPosts,
} from "../../controllers/public/posts.controller.js";
import { publicRead } from "../../middlewares/rate-limit.js";

export const postsRouter = Router();

postsRouter.get("/", publicRead, listPosts);
// Declared before "/:slug" so the literal path is not swallowed by the param.
postsRouter.get("/index", publicRead, listPostIndex);
postsRouter.get("/:slug", publicRead, getPostBySlug);
