/** The enquiry inbox. */

import type { Request, Response } from "express";
import { Op, type WhereOptions } from "sequelize";
import { notFound } from "../../helpers/http-error.js";
import { offsetOf, paged } from "../../helpers/pagination.js";
import { Enquiry } from "../../models/index.js";
import type { Enquiry as EnquiryModel } from "../../models/enquiries.js";
import { send } from "../../services/mailer.js";
import { enquiryEmail } from "../../services/templates/enquiry.js";
import {
  adminEnquiryListQuery,
  enquiryUpdateSchema,
} from "../../validations/enquiry.validation.js";

/** Loads one row or throws the 404 every handler below would otherwise repeat. */
async function findOrFail(id: number): Promise<EnquiryModel> {
  const row = await Enquiry.findByPk(id);
  if (!row) throw notFound("No such enquiry.");
  return row;
}

export async function listEnquiries(req: Request, res: Response): Promise<void> {
  const { page, limit, kind, status, q } = adminEnquiryListQuery.parse(req.query);

  const where: WhereOptions<EnquiryModel> = {};
  if (kind) Object.assign(where, { kind });
  if (status) Object.assign(where, { status });
  if (q) {
    // Name, phone, company or email. Indexed on phone_normalised; the rest
    // scan, which is acceptable at this table size and beats making the
    // operator guess which field to search.
    const term = `%${q}%`;
    Object.assign(where, {
      [Op.or]: [
        { name: { [Op.like]: term } },
        { phoneNormalised: { [Op.like]: term } },
        { company: { [Op.like]: term } },
        { email: { [Op.like]: term } },
      ],
    });
  }

  const { rows, count } = await Enquiry.findAndCountAll({
    where,
    order: [["createdAt", "DESC"]],
    limit,
    offset: offsetOf(page, limit),
  });

  res.json(paged(rows, count, page, limit));
}

export async function getEnquiry(req: Request, res: Response): Promise<void> {
  res.json(await findOrFail(Number(req.params.id)));
}

export async function updateEnquiry(req: Request, res: Response): Promise<void> {
  const row = await findOrFail(Number(req.params.id));
  const patch = enquiryUpdateSchema.parse(req.body);

  if (Object.keys(patch).length > 0) await row.update(patch);

  res.json(row);
}

/**
 * Retry a notification that failed. Manual rather than automatic-only, because
 * the usual cause is a fixed configuration problem and waiting for the sweeper
 * is a poor experience when someone is standing there.
 */
export async function resendEnquiryEmail(req: Request, res: Response): Promise<void> {
  const row = await findOrFail(Number(req.params.id));

  const result = await send(enquiryEmail(row));

  await row.update({
    emailStatus: result.status,
    emailError: result.error ?? null,
    emailAttempts: row.emailAttempts + 1,
  });

  res.json({ status: result.status, error: result.error ?? null });
}

export async function deleteEnquiry(req: Request, res: Response): Promise<void> {
  await Enquiry.destroy({ where: { id: Number(req.params.id) } });
  res.status(204).end();
}
