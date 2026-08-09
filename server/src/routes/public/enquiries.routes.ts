import { Router } from "express";
import { submitEnquiry } from "../../controllers/public/enquiries.controller.js";
import { enquiryWrite } from "../../middlewares/rate-limit.js";

export const enquiriesRouter = Router();

/** The contact form. `kind` comes from the body and defaults to "enquiry". */
enquiriesRouter.post("/", enquiryWrite, submitEnquiry());

/** The quote form. Same handler with the stricter branch pinned on. */
enquiriesRouter.post("/quote", enquiryWrite, submitEnquiry("quote_request"));
