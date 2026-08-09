import { Router } from "express";
import { listPublishedClients } from "../../controllers/public/clients.controller.js";
import { publicRead } from "../../middlewares/rate-limit.js";

export const clientsRouter = Router();

clientsRouter.get("/", publicRead, listPublishedClients);
