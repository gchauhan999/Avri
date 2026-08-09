/** Managing job openings. */

import type { Request, Response } from "express";
import { Op, literal } from "sequelize";
import { notFound } from "../../helpers/http-error.js";
import { uniqueSlug } from "../../helpers/slug.js";
import { Application, Job } from "../../models/index.js";
import type { Job as JobModel } from "../../models/jobs.js";
import { revalidate } from "../../services/revalidate.js";
import { jobBodySchema, jobStatusEnum } from "../../validations/job.validation.js";

async function findOrFail(id: number): Promise<JobModel> {
  const row = await Job.findByPk(id);
  if (!row) throw notFound("No such job.");
  return row;
}

/** True when some *other* job already holds this slug. */
const slugTaken = (exceptId?: number) => async (candidate: string) => {
  const where = exceptId ? { slug: candidate, id: { [Op.ne]: exceptId } } : { slug: candidate };
  return (await Job.count({ where })) > 0;
};

export async function listJobs(req: Request, res: Response): Promise<void> {
  const status = jobStatusEnum.optional().parse(req.query.status);

  const rows = await Job.findAll({
    attributes: [
      "id",
      "slug",
      "title",
      "department",
      "location",
      "employmentType",
      "status",
      "openings",
      "publishedAt",
      "closesAt",
      "createdAt",
      // So the list can link straight to the applicants for each role.
      [
        literal("(SELECT COUNT(*) FROM applications a WHERE a.job_id = `Job`.`id`)"),
        "applicationCount",
      ],
    ],
    ...(status ? { where: { status } } : {}),
    order: [["createdAt", "DESC"]],
  });

  res.json({ items: rows });
}

export async function getJob(req: Request, res: Response): Promise<void> {
  res.json(await findOrFail(Number(req.params.id)));
}

export async function createJob(req: Request, res: Response): Promise<void> {
  const data = jobBodySchema.parse(req.body);

  const slug = await uniqueSlug(data.title, slugTaken());

  const row = await Job.create({
    ...data,
    slug,
    createdBy: req.admin!.id,
    // Stamped when it first goes open, and used as JobPosting's datePosted.
    ...(data.status === "open" ? { publishedAt: literal("NOW()") as unknown as string } : {}),
  });

  // Re-read so the response carries the values MySQL filled in.
  await row.reload();

  void revalidate(["jobs"], ["/careers"]);
  res.status(201).json(row);
}

export async function updateJob(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  const existing = await findOrFail(id);

  const data = jobBodySchema.partial().parse(req.body);

  const updates: Record<string, unknown> = { ...data };

  if (data.title && data.title !== existing.title) {
    updates.slug = await uniqueSlug(data.title, slugTaken(id));
  }

  // First time it opens, record when — reopening later should not reset it.
  if (data.status === "open" && !existing.publishedAt) {
    updates.publishedAt = literal("NOW()");
  }

  await existing.update(updates);
  await existing.reload();

  void revalidate(["jobs"], ["/careers", `/careers/${existing.slug}`]);
  res.json(existing);
}

export async function deleteJob(req: Request, res: Response): Promise<void> {
  const existing = await findOrFail(Number(req.params.id));

  /**
   * Applications survive. The foreign key is ON DELETE SET NULL and each row
   * keeps a `job_title_snapshot`, so deleting a closed role does not erase the
   * record of who applied for it.
   */
  await existing.destroy();

  void revalidate(["jobs"], ["/careers", `/careers/${existing.slug}`]);
  res.status(204).end();
}

/** Just the count, for the confirm dialog before deleting a role. */
export async function jobApplicationCount(req: Request, res: Response): Promise<void> {
  const count = await Application.count({ where: { jobId: Number(req.params.id) } });
  res.json({ count });
}
