/**
 * Process entry point: create the storage directories, start listening, and
 * shut down cleanly.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { createApp } from "./app.js";
import { configWarnings, env } from "./config/env.js";
import { closeDatabase, pingDatabase } from "./config/database.js";
import { logger } from "./config/logger.js";

async function ensureStorage() {
  for (const dir of [
    path.join(env.storageRoot, "resumes"),
    path.join(env.storageRoot, "public", "clients"),
    path.join(env.storageRoot, "public", "posts"),
  ]) {
    await fs.mkdir(dir, { recursive: true });
  }
  logger.info({ storageRoot: env.storageRoot }, "storage ready");
}

async function main() {
  for (const warning of configWarnings()) logger.warn(warning);

  await ensureStorage();

  // Reported, not fatal: a database that is briefly down should not stop the
  // process from coming up and recovering on its own.
  if (!(await pingDatabase())) {
    logger.error(
      { host: env.db.host, database: env.db.database },
      "cannot reach MySQL — starting anyway, /api/health will report 503"
    );
  }

  const server = createApp().listen(env.port, () => {
    logger.info(`Avri API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });

  const shutdown = (signal: string) => {
    logger.info({ signal }, "shutting down");
    server.close(async () => {
      await closeDatabase().catch(() => {});
      process.exit(0);
    });
    // Do not let a stuck connection hold the process open forever.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((error) => {
  logger.error({ err: error }, "failed to start");
  process.exit(1);
});
