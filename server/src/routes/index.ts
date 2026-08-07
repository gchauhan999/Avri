/**
 * Route table.
 *
 * Public routes are open and rate-limited. Admin routes sit behind a JWT
 * cookie *and* the `X-Admin-Request` header — see `middleware/require-admin-
 * header.ts` for why the header is not optional.
 */

import { Router } from "express";
import { enquiriesRouter } from "./public/enquiries.routes.js";

export const routes = Router();

/* --- Public ------------------------------------------------------------- */
routes.use("/enquiries", enquiriesRouter);

/* --- Admin -------------------------------------------------------------- */
// Mounted in a later phase.
