"use strict";

/** Admin accounts. */

const { stamps, tableOptions, primaryKey } = require("../config/migration-helpers.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "admin_users",
      {
        id: primaryKey(Sequelize),
        name: { type: Sequelize.STRING(120), allowNull: false },
        email: { type: Sequelize.STRING(255), allowNull: false },
        // bcrypt. Never selected into any response payload.
        password_hash: { type: Sequelize.STRING(255), allowNull: false },
        role: {
          type: Sequelize.ENUM("super_admin", "editor"),
          allowNull: false,
          defaultValue: "editor",
        },
        is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        must_change_password: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        // Bumped on password change or forced sign-out, which gives instant
        // token revocation without a session table.
        token_version: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        last_login_at: { type: Sequelize.DATE, allowNull: true },
        // Lockout survives an IP change, which per-IP rate limiting does not.
        failed_attempts: {
          type: Sequelize.SMALLINT.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },
        locked_until: { type: Sequelize.DATE, allowNull: true },
        ...stamps(Sequelize),
      },
      tableOptions
    );

    await queryInterface.addConstraint("admin_users", {
      type: "unique",
      name: "uq_admin_users_email",
      fields: ["email"],
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("admin_users");
  },
};
