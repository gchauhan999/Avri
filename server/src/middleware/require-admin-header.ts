/**
 * CSRF guard for every admin route.
 *
 * The session is a cookie, so it rides along on cross-site requests. The usual
 * answer is `SameSite=Lax`, and that is set — but it is **not sufficient on its
 * own**, and this is the part that is easy to get wrong:
 *
 * `multipart/form-data` is a CORS *simple* content type. A plain `<form>` on
 * any site can POST it cross-origin with no preflight at all. So a page on
 * evil.example could submit to `/api/admin/uploads/image` and the browser would
 * attach the admin's cookie. `SameSite=Lax` blocks top-level cross-site POSTs,
 * but relying on one flag for the only route that writes files to disk is a
 * thin defence.
 *
 * A custom header cannot be set by an HTML form. Requiring one forces a CORS
 * preflight on every admin request, and the preflight is answered against the
 * origin allowlist in `app.ts` — which evil.example is not on. The admin panel
 * sets the header once, in its shared fetch wrapper.
 */

import type { RequestHandler } from "express";
import { forbidden } from "../lib/http-error.js";

export const ADMIN_REQUEST_HEADER = "X-Admin-Request";

export const requireAdminHeader: RequestHandler = (req, _res, next) => {
  if (req.get(ADMIN_REQUEST_HEADER) !== "1") {
    next(
      forbidden(
        "This endpoint must be called from the admin panel.",
        "CSRF_CHECK_FAILED"
      )
    );
    return;
  }
  next();
};
