"use strict";

/**
 * Inbound messages from both website forms.
 *
 * Contact and quote requests share enough columns that two tables would mean
 * two dashboards and two exports; the unused columns are simply null for the
 * other kind.
 */

const { stamps, tableOptions, primaryKey } = require("../config/migration-helpers.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "enquiries",
      {
        id: primaryKey(Sequelize),
        kind: { type: Sequelize.ENUM("enquiry", "quote_request"), allowNull: false },

        name: { type: Sequelize.STRING(160), allowNull: false },
        phone: { type: Sequelize.STRING(20), allowNull: false },
        phone_normalised: { type: Sequelize.CHAR(10), allowNull: false },
        // Optional on the contact form, required on the quote form.
        email: { type: Sequelize.STRING(255), allowNull: true },
        company: { type: Sequelize.STRING(180), allowNull: true },

        // Contact form only.
        subject: { type: Sequelize.STRING(200), allowNull: true },

        // Quote form only.
        service: { type: Sequelize.STRING(160), allowNull: true },
        industry: { type: Sequelize.STRING(160), allowNull: true },
        product: { type: Sequelize.STRING(200), allowNull: true },
        location: { type: Sequelize.STRING(200), allowNull: true },
        capacity: { type: Sequelize.STRING(120), allowNull: true },
        budget: { type: Sequelize.STRING(120), allowNull: true },
        timeline: { type: Sequelize.STRING(120), allowNull: true },

        message: { type: Sequelize.TEXT, allowNull: false },

        status: {
          type: Sequelize.ENUM("new", "contacted", "quoted", "won", "lost", "spam"),
          allowNull: false,
          defaultValue: "new",
        },
        admin_notes: { type: Sequelize.TEXT, allowNull: true },

        email_status: {
          type: Sequelize.ENUM("pending", "sent", "failed", "skipped"),
          allowNull: false,
          defaultValue: "pending",
        },
        email_error: { type: Sequelize.STRING(500), allowNull: true },
        email_attempts: {
          type: Sequelize.TINYINT.UNSIGNED,
          allowNull: false,
          defaultValue: 0,
        },

        // Which page the form was submitted from. Useful for attribution.
        source_page: { type: Sequelize.STRING(300), allowNull: true },
        source_ip: { type: "VARBINARY(16)", allowNull: true },
        user_agent: { type: Sequelize.STRING(400), allowNull: true },
        ...stamps(Sequelize),
      },
      tableOptions
    );

    await queryInterface.addIndex("enquiries", ["kind", "created_at"], {
      name: "idx_enquiries_kind_created",
    });
    await queryInterface.addIndex("enquiries", ["status", "created_at"], {
      name: "idx_enquiries_status",
    });
    await queryInterface.addIndex("enquiries", ["phone_normalised"], {
      name: "idx_enquiries_phone",
    });
    await queryInterface.addIndex("enquiries", ["email_status"], {
      name: "idx_enquiries_mail",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("enquiries");
  },
};
