/**
 * Reference data only, and idempotent — safe to run on every deploy.
 *
 * It seeds the five blog categories from the brief. It deliberately does NOT
 * seed clients: the eight names currently in `client/lib/site.ts` are generic
 * placeholders ("State Power Utility", "Municipal Corporation") with no logos
 * and no authorisation behind them, and seeding them would put invented client
 * relationships one checkbox away from being published.
 */

import { pathToFileURL } from "node:url";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { slugify } from "../lib/slug.js";
import { closeDatabase, db } from "./client.js";
import { adminUsers, postCategories } from "./schema.js";

const CATEGORIES = [
  {
    name: "Smart Metering",
    description: "Prepaid and smart meters, AMI rollouts and metering standards.",
  },
  { name: "Solar", description: "Rooftop and ground-mount solar, net metering and yields." },
  { name: "EV Charging", description: "AC and DC charging infrastructure, standards and siting." },
  {
    name: "Government Schemes",
    description: "RDSS, PM Surya Ghar, FAME and other central and state programmes.",
  },
  {
    name: "Electrical Safety",
    description: "Site safety, earthing, protection and statutory compliance.",
  },
];

async function seedCategories() {
  for (const [index, category] of CATEGORIES.entries()) {
    await db
      .insert(postCategories)
      .values({
        name: category.name,
        slug: slugify(category.name),
        description: category.description,
        sortOrder: index,
      })
      // Re-running must not duplicate, and must not clobber a description
      // someone has edited in the admin — only the ordering is refreshed.
      .onDuplicateKeyUpdate({ set: { sortOrder: index } });
  }
  logger.info({ count: CATEGORIES.length }, "post categories seeded");
}

/**
 * Unattended bootstrap for a first deploy. Prefer `npm run admin:create`,
 * which prompts for the password instead of reading it from a file that ends
 * up in shell history and backups.
 *
 * Only fires when there are no admins at all, and the account it creates is
 * forced to change its password on first login.
 */
async function seedFirstAdmin() {
  const { email, password, name } = env.seedAdmin;
  if (!email || !password) return;

  const [{ n }] = (await db
    .select({ n: sql<number>`count(*)` })
    .from(adminUsers)) as unknown as [{ n: number }];

  if (Number(n) > 0) {
    logger.info("admin users already exist — skipping SEED_ADMIN_*");
    return;
  }

  if (password.length < 12) {
    logger.error("SEED_ADMIN_PASSWORD must be at least 12 characters — no admin created");
    return;
  }

  await db.insert(adminUsers).values({
    name: name || "Administrator",
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, env.bcryptRounds),
    role: "super_admin",
    mustChangePassword: true,
  });

  logger.warn(
    { email },
    "first admin created from SEED_ADMIN_* — change the password, then remove those variables from .env"
  );
}

export async function runSeed() {
  await seedCategories();
  await seedFirstAdmin();
}

const invokedDirectly =
  !!process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (invokedDirectly) {
  runSeed()
    .then(() => closeDatabase())
    .then(() => process.exit(0))
    .catch(async (error) => {
      logger.error({ err: error }, "seed failed");
      await closeDatabase().catch(() => {});
      process.exit(1);
    });
}

/** Exported for the admin-creation script, which checks the same table. */
export async function adminExists(email: string) {
  const rows = await db
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(eq(adminUsers.email, email.toLowerCase()))
    .limit(1);
  return rows.length > 0;
}
