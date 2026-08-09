import { Router } from "express";
import {
  deleteEnquiry,
  getEnquiry,
  listEnquiries,
  resendEnquiryEmail,
  updateEnquiry,
} from "../../controllers/admin/enquiries.controller.js";
import { requireAuth } from "../../middlewares/auth.js";

export const adminEnquiriesRouter = Router();

adminEnquiriesRouter.use(requireAuth);

adminEnquiriesRouter.get("/", listEnquiries);
adminEnquiriesRouter.get("/:id", getEnquiry);
adminEnquiriesRouter.patch("/:id", updateEnquiry);
adminEnquiriesRouter.post("/:id/resend", resendEnquiryEmail);
adminEnquiriesRouter.delete("/:id", deleteEnquiry);
