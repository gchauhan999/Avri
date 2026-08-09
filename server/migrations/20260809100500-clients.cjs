"use strict";

/**
 * Client companies whose logos appear on the website.
 *
 * Publishing a company's logo without written permission is a trademark
 * problem, so authorisation is modelled rather than assumed. The CHECK
 * constraint at the end is the part that matters: it makes publishing an
 * unauthorised client impossible even by direct SQL, not merely discouraged by
 * application code.
 */

const { stamps, tableOptions, primaryKey } = require("../config/migration-helpers.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "clients",
      {
        id: primaryKey(Sequelize),
        name: { type: Sequelize.STRING(180), allowNull: false },
        slug: { type: Sequelize.STRING(200), allowNull: false },
        logo_path: { type: Sequelize.STRING(400), allowNull: true },
        logo_width: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
        logo_height: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
        website_url: { type: Sequelize.STRING(300), allowNull: true },
        sector: { type: Sequelize.STRING(120), allowNull: true },
        is_authorized: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        // e.g. "logo use approved by email from R. Kumar, 2026-03-04".
        authorization_note: { type: Sequelize.STRING(400), allowNull: true },
        authorized_at: { type: Sequelize.DATE, allowNull: true },
        authorized_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        is_published: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        sort_order: { type: Sequelize.SMALLINT, allowNull: false, defaultValue: 0 },
        ...stamps(Sequelize),
      },
      tableOptions
    );

    await queryInterface.addConstraint("clients", {
      type: "unique",
      name: "uq_clients_slug",
      fields: ["slug"],
    });

    await queryInterface.addConstraint("clients", {
      type: "foreign key",
      name: "fk_clients_authorized_by",
      fields: ["authorized_by"],
      references: { table: "admin_users", field: "id" },
      onDelete: "SET NULL",
      onUpdate: "NO ACTION",
    });

    await queryInterface.addIndex("clients", ["is_published", "is_authorized", "sort_order"], {
      name: "idx_clients_public",
    });

    // Written as raw SQL: queryInterface.addConstraint's "check" type emits
    // `where` clauses through the query generator, which cannot express a
    // comparison between two columns.
    await queryInterface.sequelize.query(
      "ALTER TABLE `clients` ADD CONSTRAINT `ck_clients_publish_requires_auth` " +
        "CHECK (`is_published` = 0 OR `is_authorized` = 1)"
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("clients");
  },
};
