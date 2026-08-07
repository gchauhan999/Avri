/**
 * Applies pending migrations, then the bits of schema Drizzle cannot express.
 *
 * Safe to re-run: Drizzle keeps a journal, and the extra statements below are
 * all written to be idempotent. Run it on every deploy.
 */

import path from "node:path";
import { pathToFileURL } from "node:url";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import { closeDatabase, db } from "./client.js";

/**
 * A client must never be publishable without authorisation. The API enforces
 * it too, but a trademark problem is not something to leave guarded by
 * application code alone — this makes it impossible even from a SQL console.
 *
 * MySQL 8.0.16+ enforces CHECK; older versions parse and ignore it, which is
 * why the API check is not redundant.
 */
async function addClientsPublishCheck() {
  const [rows] = (await db.execute(sql`
    SELECT COUNT(*) AS n
      FROM information_schema.TABLE_CONSTRAINTS
     WHERE CONSTRAINT_SCHEMA = ${env.db.database}
       AND TABLE_NAME = 'clients'
       AND CONSTRAINT_NAME = 'ck_clients_publish_requires_auth'
  `)) as unknown as [{ n: number }[], unknown];

  if (Number(rows[0]?.n ?? 0) > 0) {
    logger.info("clients publish CHECK already present");
    return;
  }

  await db.execute(sql`
    ALTER TABLE clients
      ADD CONSTRAINT ck_clients_publish_requires_auth
      CHECK (is_published = 0 OR is_authorized = 1)
  `);
  logger.info("added CHECK ck_clients_publish_requires_auth");
}

export async function runMigrations() {
  const folder = path.join(env.packageRoot, "drizzle");
  logger.info({ folder, database: env.db.database }, "applying migrations");

  await migrate(db, { migrationsFolder: folder });
  await addClientsPublishCheck();

  logger.info("migrations complete");
}

// Only run when invoked directly (`npm run db:migrate`), not when imported.
// `pathToFileURL` rather than string concatenation, because a Windows path
// needs `file:///D:/…` and manual interpolation gets that wrong.
const invokedDirectly =
  !!process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (invokedDirectly) {
  runMigrations()
    .then(() => closeDatabase())
    .then(() => process.exit(0))
    .catch(async (error) => {
      logger.error({ err: error }, "migration failed");
      await closeDatabase().catch(() => {});
      process.exit(1);
    });
}
