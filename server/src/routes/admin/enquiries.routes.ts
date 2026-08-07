/**
 * The enquiry inbox.
 */

import { Router } from "express";
import { and, desc, eq, like, or, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "../../db/client.js";
import { enquiries } from "../../db/schema.js";
import { notFound } from "../../lib/http-error.js";
import { offsetOf, pageQuery, paged } from "../../lib/pagination.js";
import { requireAuth } from "../../middleware/auth.js";
import { send } from "../../services/mailer.js";
import { enquiryEmail } from "../../services/templates/enquiry.js";

export const adminEnquiriesRouter = Router();

adminEnquiriesRouter.use(requireAuth);

const listQuery = pageQuery.extend({
  kind: z.enum(["enquiry", "quote_request"]).optional(),
  status: z.enum(["new", "contacted", "quoted", "won", "lost", "spam"]).optional(),
  q: z.string().trim().max(120).optional(),
});

adminEnquiriesRouter.get("/", async (req, res) => {
  const { page, limit, kind, status, q } = listQuery.parse(req.query);

  const filters: SQL[] = [];
  if (kind) filters.push(eq(enquiries.kind, kind));
  if (status) filters.push(eq(enquiries.status, status));
  if (q) {
    // Name, phone or company. Indexed on phone_normalised; the rest scan, which
    // is acceptable at this table size and beats making the operator guess
    // which field to search.
    const term = `%${q}%`;
    const searchTerms = [
      like(enquiries.name, term),
      like(enquiries.phoneNormalised, term),
      like(enquiries.company, term),
      like(enquiries.email, term),
    ].filter(Boolean) as SQL[];
    const search = or(...searchTerms);
    if (search) filters.push(search);
  }

  const where = filters.length ? and(...filters) : undefined;

  const [items, [count]] = await Promise.all([
    db
      .select()
      .from(enquiries)
      .where(where)
      .orderBy(desc(enquiries.createdAt))
      .limit(limit)
      .offset(offsetOf(page, limit)),
    db.select({ n: sql<number>`count(*)` }).from(enquiries).where(where),
  ]);

  res.json(paged(items, Number(count?.n ?? 0), page, limit));
});

adminEnquiriesRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const [row] = await db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1);
  if (!row) throw notFound("No such enquiry.");
  res.json(row);
});

const patchSchema = z.object({
  status: z.enum(["new", "contacted", "quoted", "won", "lost", "spam"]).optional(),
  adminNotes: z.string().max(5000).optional(),
});

adminEnquiriesRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const patch = patchSchema.parse(req.body);

  if (Object.keys(patch).length === 0) {
    const [row] = await db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1);
    if (!row) throw notFound("No such enquiry.");
    res.json(row);
    return;
  }

  await db.update(enquiries).set(patch).where(eq(enquiries.id, id));

  const [row] = await db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1);
  if (!row) throw notFound("No such enquiry.");
  res.json(row);
});

/**
 * Retry a notification that failed. Manual rather than automatic-only, because
 * the usual cause is a fixed configuration problem and waiting for the sweeper
 * is a poor experience when someone is standing there.
 */
adminEnquiriesRouter.post("/:id/resend", async (req, res) => {
  const id = Number(req.params.id);
  const [row] = await db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1);
  if (!row) throw notFound("No such enquiry.");

  const result = await send(enquiryEmail(row));

  await db
    .update(enquiries)
    .set({
      emailStatus: result.status,
      emailError: result.error ?? null,
      emailAttempts: row.emailAttempts + 1,
    })
    .where(eq(enquiries.id, id));

  res.json({ status: result.status, error: result.error ?? null });
});

adminEnquiriesRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(enquiries).where(eq(enquiries.id, id));
  res.status(204).end();
});
