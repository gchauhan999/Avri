"use strict";

/**
 * Unattended bootstrap for a first deploy.
 *
 * Prefer `npm run admin:create`, which prompts for the password instead of
 * reading it from a file that ends up in shell history and backups. This exists
 * for deploys where nobody is at a terminal.
 *
 * Only fires when SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are both set and
 * there are no admins at all, and the account it creates is forced to change
 * its password on first login.
 */

const path = require("node:path");
const bcrypt = require("bcryptjs");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

module.exports = {
  async up(queryInterface) {
    const email = (process.env.SEED_ADMIN_EMAIL || "").trim().toLowerCase();
    const password = (process.env.SEED_ADMIN_PASSWORD || "").trim();
    const name = (process.env.SEED_ADMIN_NAME || "").trim() || "Administrator";

    if (!email || !password) {
      console.log("SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD not set — skipping first admin.");
      return;
    }

    if (password.length < 12) {
      console.error("SEED_ADMIN_PASSWORD must be at least 12 characters — no admin created.");
      return;
    }

    const [rows] = await queryInterface.sequelize.query(
      "SELECT COUNT(*) AS n FROM `admin_users`"
    );
    if (Number(rows[0].n) > 0) {
      console.log("Admin users already exist — skipping SEED_ADMIN_*.");
      return;
    }

    const rounds = Number(process.env.BCRYPT_ROUNDS || 12);

    await queryInterface.bulkInsert("admin_users", [
      {
        name,
        email,
        password_hash: await bcrypt.hash(password, rounds),
        role: "super_admin",
        must_change_password: true,
      },
    ]);

    console.warn(
      `First admin created from SEED_ADMIN_* (${email}). Change the password, ` +
        `then remove those variables from .env.`
    );
  },

  async down(queryInterface, Sequelize) {
    const email = (process.env.SEED_ADMIN_EMAIL || "").trim().toLowerCase();
    if (!email) return;
    await queryInterface.bulkDelete("admin_users", { email: { [Sequelize.Op.eq]: email } });
  },
};
