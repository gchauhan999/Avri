/**
 * Prints whether the API can reach MySQL, and what it found there.
 *
 *   npm run db:check
 *
 * Exists because "the server started but nothing works" is nearly always a
 * connection or migration problem, and this answers both in one command.
 */

import { QueryTypes } from "sequelize";
import { closeDatabase, sequelize } from "../config/database.js";
import { env } from "../config/env.js";

async function main() {
  console.log(
    `\nConnecting to mysql://${env.db.user}@${env.db.host}:${env.db.port}/${env.db.database}\n`
  );

  const [version] = await sequelize.query<{ v: string }>("SELECT VERSION() AS v", {
    type: QueryTypes.SELECT,
  });
  console.log(`  connected — MySQL ${version?.v}`);

  const tables = await sequelize.query<{ name: string; approxRows: number | null }>(
    `SELECT TABLE_NAME AS name, TABLE_ROWS AS approxRows
       FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = :database
      ORDER BY TABLE_NAME`,
    { type: QueryTypes.SELECT, replacements: { database: env.db.database } }
  );

  if (tables.length === 0) {
    console.log("  no tables yet — run `npm run db:migrate`\n");
    return;
  }

  console.log(`  ${tables.length} tables:`);
  for (const t of tables) {
    console.log(`    ${t.name.padEnd(20)} ~${t.approxRows ?? 0} rows`);
  }

  const checks = await sequelize.query<{ name: string }>(
    `SELECT CONSTRAINT_NAME AS name
       FROM information_schema.TABLE_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = :database
        AND CONSTRAINT_TYPE = 'CHECK'`,
    { type: QueryTypes.SELECT, replacements: { database: env.db.database } }
  );

  console.log(
    `\n  clients publish CHECK: ${
      checks.some((c) => c.name === "ck_clients_publish_requires_auth") ? "present" : "MISSING"
    }\n`
  );
}

main()
  .then(async () => {
    await closeDatabase();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error(`\n  FAILED: ${error instanceof Error ? error.message : String(error)}\n`);
    await closeDatabase().catch(() => {});
    process.exit(1);
  });
