import { Router } from "express";
import {
  createPost,
  deletePost,
  getPost,
  listPostCategories,
  listPosts,
  updatePost,
  uploadPostCover,
} from "../../controllers/admin/posts.controller.js";
import { requireAuth } from "../../middlewares/auth.js";
import { imageUpload } from "../../middlewares/upload.js";

export const adminPostsRouter = Router();

adminPostsRouter.use(requireAuth);

// Both literal paths are declared before "/:id" so they are not swallowed by
// the param.
adminPostsRouter.get("/categories", listPostCategories);
adminPostsRouter.post("/cover", imageUpload.single("image"), uploadPostCover);

adminPostsRouter.get("/", listPosts);
adminPostsRouter.post("/", createPost);
adminPostsRouter.get("/:id", getPost);
adminPostsRouter.patch("/:id", updatePost);
adminPostsRouter.delete("/:id", deletePost);
