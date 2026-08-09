/**
 * Creates an admin account interactively.
 *
 *   npm run admin:create
 *
 * Prompts rather than reading environment variables, so the password never
 * lands in `.env`, shell history, a process listing or a backup. The password
 * is not echoed.
 */

import readline from "node:readline";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import { closeDatabase } from "../config/database.js";
import { env } from "../config/env.js";
import { EMAIL_RE } from "../helpers/validation.js";
import { AdminUser } from "../models/index.js";

const rl = readline.createInterface({ input: stdin, output: stdout });

const ask = (question: string): Promise<string> =>
  new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())));

/**
 * Same prompt, but nothing is written back to the terminal as it is typed.
 * `readline` has no built-in for this, so the output stream's write is
 * temporarily swallowed.
 */
function askSecret(question: string): Promise<string> {
  return new Promise((resolve) => {
    const target = rl as unknown as { output: NodeJS.WriteStream; _writeToOutput?: unknown };
    stdout.write(question);
    target._writeToOutput = () => {};
    rl.question("", (answer) => {
      target._writeToOutput = undefined;
      stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log("\nCreate an Avri Energy admin user\n");

  const name = await ask("Full name: ");
  if (name.length < 2) throw new Error("Name is required.");

  const email = (await ask("Email: ")).toLowerCase();
  if (!EMAIL_RE.test(email)) throw new Error("That is not a valid email address.");

  if ((await AdminUser.count({ where: { email } })) > 0) {
    throw new Error(`${email} already has an account. Use the admin panel to change it.`);
  }

  const password = await askSecret("Password (min 12 characters): ");
  if (password.length < 12) throw new Error("Password must be at least 12 characters.");

  const confirm = await askSecret("Confirm password: ");
  if (password !== confirm) throw new Error("Passwords do not match.");

  const roleAnswer = (await ask("Role [super_admin/editor] (default super_admin): ")) || "super_admin";
  if (roleAnswer !== "super_admin" && roleAnswer !== "editor") {
    throw new Error("Role must be 'super_admin' or 'editor'.");
  }

  await AdminUser.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, env.bcryptRounds),
    role: roleAnswer,
  });

  console.log(`\nCreated ${roleAnswer} ${email}. Sign in at ${env.publicSiteUrl}/admin\n`);
}

main()
  .then(async () => {
    rl.close();
    await closeDatabase();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error(`\n${error instanceof Error ? error.message : String(error)}\n`);
    rl.close();
    await closeDatabase().catch(() => {});
    process.exit(1);
  });
