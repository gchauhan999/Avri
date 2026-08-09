"use strict";

/** Job applications, and the résumé each one arrived with. */

const { stamps, tableOptions, primaryKey } = require("../config/migration-helpers.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "applications",
      {
        id: primaryKey(Sequelize),
        // Null for a speculative application, or once the job is deleted.
        job_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        // Frozen at submission, so the record survives the job being renamed.
        job_title_snapshot: { type: Sequelize.STRING(200), allowNull: false },

        full_name: { type: Sequelize.STRING(160), allowNull: false },
        email: { type: Sequelize.STRING(255), allowNull: false },
        phone: { type: Sequelize.STRING(20), allowNull: false },
        // Last 10 digits, for search and duplicate detection.
        phone_normalised: { type: Sequelize.CHAR(10), allowNull: false },
        current_location: { type: Sequelize.STRING(160), allowNull: true },
        experience_years: { type: Sequelize.DECIMAL(4, 1), allowNull: true },
        current_company: { type: Sequelize.STRING(160), allowNull: true },
        notice_period: { type: Sequelize.STRING(60), allowNull: true },
        linkedin_url: { type: Sequelize.STRING(300), allowNull: true },
        cover_letter: { type: Sequelize.TEXT, allowNull: true },

        // Path relative to STORAGE_ROOT. The file itself is never under the
        // static mount — it is only reachable through an authenticated route.
        resume_path: { type: Sequelize.STRING(400), allowNull: false },
        // The applicant's own filename, sanitised, for Content-Disposition.
        resume_original_name: { type: Sequelize.STRING(255), allowNull: false },
        resume_mime: { type: Sequelize.STRING(120), allowNull: false },
        resume_size_bytes: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
        // Lets us spot the same CV submitted twice for one role.
        resume_sha256: { type: Sequelize.CHAR(64), allowNull: false },

        status: {
          type: Sequelize.ENUM("new", "shortlisted", "interviewing", "rejected", "hired"),
          allowNull: false,
          defaultValue: "new",
        },
        admin_notes: { type: Sequelize.TEXT, allowNull: true },

        // Mail is sent after the row is written and never blocks the response,
        // so delivery is tracked here. A failed row is retried and badged in
        // the dashboard rather than lost.
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

        // INET6_ATON form, so IPv4 and IPv6 both fit in one column.
        source_ip: { type: "VARBINARY(16)", allowNull: true },
        user_agent: { type: Sequelize.STRING(400), allowNull: true },
        ...stamps(Sequelize),
      },
      tableOptions
    );

    await queryInterface.addConstraint("applications", {
      type: "foreign key",
      name: "fk_applications_job",
      fields: ["job_id"],
      references: { table: "jobs", field: "id" },
      onDelete: "SET NULL",
      onUpdate: "NO ACTION",
    });

    await queryInterface.addIndex("applications", ["job_id", "created_at"], {
      name: "idx_applications_job_created",
    });
    await queryInterface.addIndex("applications", ["status", "created_at"], {
      name: "idx_applications_status",
    });
    await queryInterface.addIndex("applications", ["email"], {
      name: "idx_applications_email",
    });
    // Not UNIQUE: job_id is nullable and MySQL treats each NULL as distinct, so
    // a unique key would never cover speculative applications. The duplicate
    // check happens in the controller.
    await queryInterface.addIndex("applications", ["job_id", "resume_sha256"], {
      name: "idx_applications_dedupe",
    });
    await queryInterface.addIndex("applications", ["email_status"], {
      name: "idx_applications_mail",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("applications");
  },
};
