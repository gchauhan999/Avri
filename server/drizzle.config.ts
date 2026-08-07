import { defineConfig } from "drizzle-kit";
import { env } from "./src/config/env.js";

/**
 * `drizzle-kit generate` reads `schema.ts` and writes plain SQL into
 * `drizzle/`. Read that SQL before running `db:migrate` — it is the actual
 * change being applied to the database, and reviewing it is the whole reason
 * for preferring generated migrations over `push`.
 */
export default defineConfig({
  dialect: "mysql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.database,
  },
  strict: true,
  verbose: true,
});
