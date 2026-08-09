"use strict";

/** Blog categories. Small, hand-curated, populated by the seeder. */

const { stamps, tableOptions, primaryKey } = require("../config/migration-helpers.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "post_categories",
      {
        id: primaryKey(Sequelize),
        name: { type: Sequelize.STRING(120), allowNull: false },
        slug: { type: Sequelize.STRING(140), allowNull: false },
        description: { type: Sequelize.STRING(300), allowNull: true },
        sort_order: { type: Sequelize.SMALLINT, allowNull: false, defaultValue: 0 },
        ...stamps(Sequelize),
      },
      tableOptions
    );

    await queryInterface.addConstraint("post_categories", {
      type: "unique",
      name: "uq_post_categories_slug",
      fields: ["slug"],
    });
    await queryInterface.addConstraint("post_categories", {
      type: "unique",
      name: "uq_post_categories_name",
      fields: ["name"],
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("post_categories");
  },
};
