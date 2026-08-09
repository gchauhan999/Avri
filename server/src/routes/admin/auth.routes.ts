import { Router } from "express";
import {
  changePassword,
  login,
  logout,
  me,
} from "../../controllers/admin/auth.controller.js";
import { requireAuth } from "../../middlewares/auth.js";
import { loginAttempt } from "../../middlewares/rate-limit.js";

export const authRouter = Router();

authRouter.post("/login", loginAttempt, login);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, me);
authRouter.post("/change-password", requireAuth, changePassword);
