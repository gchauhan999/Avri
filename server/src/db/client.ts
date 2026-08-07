/**
 * The MySQL connection pool and the Drizzle handle built on it.
 *
 * One pool per process, created on import. Everything else imports `db`.
 */

import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";
import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";
import * as schema from "./schema.js";

export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  connectionLimit: env.db.connectionLimit,
  waitForConnections: true,
  // The app deals in ISO strings and formats dates for display itself; letting
  // mysql2 hand back Date objects in the server's local zone is a reliable way
  // to have a post published at 00:30 IST show yesterday's date.
  dateStrings: true,
  timezone: "Z",
  charset: "utf8mb4_general_ci",
  enableKeepAlive: true,
  namedPlaceholders: true,
});

export const db = drizzle(pool, { schema, mode: "default" });

/** Cheap liveness probe for `/api/health`. */
export async function pingDatabase(): Promise<boolean> {
  try {
    await db.execute(sql`select 1`);
    return true;
  } catch (error) {
    logger.error({ err: error }, "database ping failed");
    return false;
  }
}

/** Let in-flight queries finish on SIGTERM instead of cutting them off. */
export async function closeDatabase(): Promise<void> {
  await pool.end();
}
