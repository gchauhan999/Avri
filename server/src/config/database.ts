/**
 * The Sequelize instance every model and controller shares.
 *
 * One connection pool per process, created on import.
 *
 * The custom `typeCast` is the important part. Sequelize's MySQL dialect
 * registers a parser for DATETIME/TIMESTAMP that returns a JavaScript `Date`,
 * and it does so at the driver level — `dateStrings: true` alone does not
 * defeat it, and neither does how an attribute is declared on a model. This
 * codebase deals in ISO strings end to end and formats dates for display in
 * Asia/Kolkata explicitly, so the parser is replaced rather than worked around.
 * Everything that is not a date falls through to mysql2's own handling.
 *
 * `dialectOptions` is merged last by Sequelize's connection manager, which is
 * what makes overriding `typeCast` here possible at all.
 */

import { Sequelize } from "sequelize";
import { env } from "./env.js";
import { logger } from "./logger.js";

const DATE_FIELD_TYPES = new Set(["DATETIME", "TIMESTAMP", "DATE", "NEWDATE"]);

export const sequelize = new Sequelize(env.db.database, env.db.user, env.db.password, {
  host: env.db.host,
  port: env.db.port,
  dialect: "mysql",
  timezone: "+00:00",
  pool: {
    max: env.db.connectionLimit,
    min: 0,
    acquire: 30_000,
    idle: 10_000,
  },
  dialectOptions: {
    charset: "utf8mb4",
    dateStrings: true,
    enableKeepAlive: true,
    typeCast(
      field: { type: string; string(): string | null },
      next: () => unknown
    ): unknown {
      if (DATE_FIELD_TYPES.has(field.type)) return field.string();
      return next();
    },
  },
  define: {
    // Column names are snake_case in MySQL and camelCase in TypeScript. Every
    // model maps them explicitly via `field`, so this only covers the ones
    // Sequelize adds itself.
    underscored: true,
    freezeTableName: true,
    charset: "utf8mb4",
    collate: "utf8mb4_0900_ai_ci",
  },
  // Pino already logs every request; echoing SQL at info level would bury it.
  logging: env.isProduction ? false : (sql: string) => logger.debug({ sql }, "sql"),
});

/** Cheap liveness probe for `/api/health`. */
export async function pingDatabase(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    logger.error({ err: error }, "database ping failed");
    return false;
  }
}

/** Let in-flight queries finish on SIGTERM instead of cutting them off. */
export async function closeDatabase(): Promise<void> {
  await sequelize.close();
}
