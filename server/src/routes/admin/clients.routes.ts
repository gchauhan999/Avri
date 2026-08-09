import { Router } from "express";
import {
  createClient,
  deleteClient,
  getClient,
  listClients,
  updateClient,
  uploadClientLogo,
} from "../../controllers/admin/clients.controller.js";
import { requireAuth } from "../../middlewares/auth.js";
import { imageUpload } from "../../middlewares/upload.js";

export const adminClientsRouter = Router();

adminClientsRouter.use(requireAuth);

adminClientsRouter.get("/", listClients);
adminClientsRouter.post("/", createClient);
// Declared before "/:id" so the literal path is not swallowed by the param.
adminClientsRouter.post("/logo", imageUpload.single("image"), uploadClientLogo);
adminClientsRouter.get("/:id", getClient);
adminClientsRouter.patch("/:id", updateClient);
adminClientsRouter.delete("/:id", deleteClient);
