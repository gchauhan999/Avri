"use strict";

/** Job openings. */

const { stamps, tableOptions, primaryKey } = require("../config/migration-helpers.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "jobs",
      {
        id: primaryKey(Sequelize),
        title: { type: Sequelize.STRING(200), allowNull: false },
        slug: { type: Sequelize.STRING(220), allowNull: false },
        department: { type: Sequelize.STRING(120), allowNull: true },
        location: { type: Sequelize.STRING(160), allowNull: false },
        employment_type: {
          type: Sequelize.ENUM("full_time", "part_time", "contract", "internship"),
          allowNull: false,
          defaultValue: "full_time",
        },
        experience_min: { type: Sequelize.TINYINT.UNSIGNED, allowNull: true },
        experience_max: { type: Sequelize.TINYINT.UNSIGNED, allowNull: true },
        openings: {
          type: Sequelize.SMALLINT.UNSIGNED,
          allowNull: false,
          defaultValue: 1,
        },
        // Free text for the card, e.g. "₹4–6 LPA". The structured trio below is
        // what feeds the JobPosting markup.
        salary_range: { type: Sequelize.STRING(120), allowNull: true },
        salary_min: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
        salary_max: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
        salary_period: {
          type: Sequelize.ENUM("month", "year"),
          allowNull: true,
          defaultValue: "month",
        },
        // One line for the card, and the meta description.
        summary: { type: Sequelize.STRING(500), allowNull: false },
        description: { type: Sequelize.TEXT("medium"), allowNull: false },
        // string[] — rendered as bullet lists and as the JobPosting description.
        responsibilities: { type: Sequelize.JSON, allowNull: true },
        requirements: { type: Sequelize.JSON, allowNull: true },
        status: {
          type: Sequelize.ENUM("draft", "open", "closed"),
          allowNull: false,
          defaultValue: "draft",
        },
        published_at: { type: Sequelize.DATE, allowNull: true },
        // Google demotes sites that keep expired JobPosting markup live, so this
        // feeds `validThrough` and the public route 404s once it passes.
        closes_at: { type: Sequelize.DATEONLY, allowNull: true },
        seo_title: { type: Sequelize.STRING(200), allowNull: true },
        seo_description: { type: Sequelize.STRING(320), allowNull: true },
        created_by: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        ...stamps(Sequelize),
      },
      tableOptions
    );

    await queryInterface.addConstraint("jobs", {
      type: "unique",
      name: "uq_jobs_slug",
      fields: ["slug"],
    });

    await queryInterface.addConstraint("jobs", {
      type: "foreign key",
      name: "fk_jobs_created_by",
      fields: ["created_by"],
      references: { table: "admin_users", field: "id" },
      onDelete: "SET NULL",
      onUpdate: "NO ACTION",
    });

    await queryInterface.addIndex("jobs", ["status", "published_at"], {
      name: "idx_jobs_status_published",
    });
    await queryInterface.addIndex("jobs", ["department"], {
      name: "idx_jobs_department",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("jobs");
  },
};
