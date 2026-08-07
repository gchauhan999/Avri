/**
 * Dashboard figures.
 *
 * Split into two routes on purpose: `/counts` is fetched by the layout on
 * every page load for the sidebar badges and must stay cheap, while `/` does
 * the fuller query for the overview screen only.
 */

import { Router } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { applications, enquiries, jobs, posts } from "../../db/schema.js";
import { requireAuth } from "../../middleware/auth.js";

export const statsRouter = Router();

statsRouter.use(requireAuth);

/** Just the two badge numbers. Two indexed COUNTs. */
statsRouter.get("/counts", async (_req, res) => {
  const [[unreadEnquiries], [newApplications]] = await Promise.all([
    db
      .select({ n: sql<number>`count(*)` })
      .from(enquiries)
      .where(eq(enquiries.status, "new")),
    db
      .select({ n: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.status, "new")),
  ]);

  res.json({
    enquiries: Number(unreadEnquiries?.n ?? 0),
    applications: Number(newApplications?.n ?? 0),
  });
});

statsRouter.get("/", async (_req, res) => {
  const [
    [unreadEnquiries],
    [newApplications],
    [openJobs],
    [draftPosts],
    [failedMail],
    recentEnquiries,
    recentApplications,
  ] = await Promise.all([
    db.select({ n: sql<number>`count(*)` }).from(enquiries).where(eq(enquiries.status, "new")),
    db.select({ n: sql<number>`count(*)` }).from(applications).where(eq(applications.status, "new")),
    db.select({ n: sql<number>`count(*)` }).from(jobs).where(eq(jobs.status, "open")),
    db.select({ n: sql<number>`count(*)` }).from(posts).where(eq(posts.status, "draft")),
    // Surfaced deliberately: a failed notification means someone is waiting on
    // an email that never arrived, and the row is the only record of it.
    db
      .select({ n: sql<number>`count(*)` })
      .from(enquiries)
      .where(eq(enquiries.emailStatus, "failed")),
    db
      .select({
        id: enquiries.id,
        kind: enquiries.kind,
        name: enquiries.name,
        phone: enquiries.phone,
        subject: enquiries.subject,
        service: enquiries.service,
        status: enquiries.status,
        createdAt: enquiries.createdAt,
      })
      .from(enquiries)
      .orderBy(desc(enquiries.createdAt))
      .limit(5),
    db
      .select({
        id: applications.id,
        fullName: applications.fullName,
        jobTitle: applications.jobTitleSnapshot,
        status: applications.status,
        createdAt: applications.createdAt,
      })
      .from(applications)
      .orderBy(desc(applications.createdAt))
      .limit(5),
  ]);

  const [failedApplicationMail] = await db
    .select({ n: sql<number>`count(*)` })
    .from(applications)
    .where(and(eq(applications.emailStatus, "failed")));

  res.json({
    counts: {
      unreadEnquiries: Number(unreadEnquiries?.n ?? 0),
      newApplications: Number(newApplications?.n ?? 0),
      openJobs: Number(openJobs?.n ?? 0),
      draftPosts: Number(draftPosts?.n ?? 0),
      failedMail: Number(failedMail?.n ?? 0) + Number(failedApplicationMail?.n ?? 0),
    },
    recentEnquiries,
    recentApplications,
  });
});
