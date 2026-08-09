/**
 * Database configuration for sequelize-cli only.
 *
 * The running server does not read this file — it builds its connection from
 * the validated `src/config/env.ts`. The CLI cannot import that (it is ESM
 * TypeScript), so the same values are read straight from `.env` here. Keep the
 * variable names identical to `src/config/env.ts` so there is one source of
 * truth in `.env` even though there are two readers.
 */

const path = require("node:path");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const base = {
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || "avri_energy",
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  dialect: "mysql",
  // Matches the running server. Without it the CLI writes timestamps in the
  // machine's local zone while the app reads them back as UTC.
  timezone: "+00:00",
  dialectOptions: {
    charset: "utf8mb4",
    dateStrings: true,
  },
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_0900_ai_ci",
  },
  logging: false,
};

module.exports = {
  development: base,
  test: { ...base, database: `${base.database}_test` },
  production: base,
};
