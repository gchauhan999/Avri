/**
 * Prints whether the API can reach MySQL, and what it found there.
 *
 *   npm run db:check
 *
 * Exists because "the server started but nothing works" is nearly always a
 * connection or migration problem, and this answers both in one command.
 */

import { sql } from "drizzle-orm";
import { env } from "../config/env.js";
import { closeDatabase, db } from "../db/client.js";

async function main() {
  console.log(
    `\nConnecting to mysql://${env.db.user}@${env.db.host}:${env.db.port}/${env.db.database}\n`
  );

  const [version] = (await db.execute(sql`SELECT VERSION() AS v`)) as unknown as [{ v: string }[]];
  console.log(`  connected — MySQL ${version[0]?.v}`);

  const [tables] = (await db.execute(sql`
    SELECT TABLE_NAME AS name, TABLE_ROWS AS approxRows
      FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ${env.db.database}
     ORDER BY TABLE_NAME
  `)) as unknown as [{ name: string; approxRows: number | null }[]];

  if (tables.length === 0) {
    console.log("  no tables yet — run `npm run db:migrate`\n");
    return;
  }

  console.log(`  ${tables.length} tables:`);
  for (const t of tables) {
    console.log(`    ${t.name.padEnd(20)} ~${t.approxRows ?? 0} rows`);
  }

  const [checks] = (await db.execute(sql`
    SELECT CONSTRAINT_NAME AS name
      FROM information_schema.TABLE_CONSTRAINTS
     WHERE CONSTRAINT_SCHEMA = ${env.db.database}
       AND CONSTRAINT_TYPE = 'CHECK'
  `)) as unknown as [{ name: string }[]];

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
