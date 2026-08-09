/**
 * Dashboard figures.
 *
 * Split into two handlers on purpose: `/counts` is fetched by the layout on
 * every page load for the sidebar badges and must stay cheap, while `/` does
 * the fuller query for the overview screen only.
 */

import type { Request, Response } from "express";
import { Application, Enquiry, Job, Post } from "../../models/index.js";

/** Just the two badge numbers. Two indexed COUNTs. */
export async function badgeCounts(_req: Request, res: Response): Promise<void> {
  const [unreadEnquiries, newApplications] = await Promise.all([
    Enquiry.count({ where: { status: "new" } }),
    Application.count({ where: { status: "new" } }),
  ]);

  res.json({ enquiries: unreadEnquiries, applications: newApplications });
}

export async function dashboard(_req: Request, res: Response): Promise<void> {
  const [
    unreadEnquiries,
    newApplications,
    openJobs,
    draftPosts,
    failedEnquiryMail,
    failedApplicationMail,
    recentEnquiries,
    recentApplications,
  ] = await Promise.all([
    Enquiry.count({ where: { status: "new" } }),
    Application.count({ where: { status: "new" } }),
    Job.count({ where: { status: "open" } }),
    Post.count({ where: { status: "draft" } }),
    // Surfaced deliberately: a failed notification means someone is waiting on
    // an email that never arrived, and the row is the only record of it.
    Enquiry.count({ where: { emailStatus: "failed" } }),
    Application.count({ where: { emailStatus: "failed" } }),
    Enquiry.findAll({
      attributes: ["id", "kind", "name", "phone", "subject", "service", "status", "createdAt"],
      order: [["createdAt", "DESC"]],
      limit: 5,
    }),
    Application.findAll({
      attributes: [
        "id",
        "fullName",
        ["job_title_snapshot", "jobTitle"],
        "status",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    }),
  ]);

  res.json({
    counts: {
      unreadEnquiries,
      newApplications,
      openJobs,
      draftPosts,
      failedMail: failedEnquiryMail + failedApplicationMail,
    },
    recentEnquiries,
    recentApplications,
  });
}
