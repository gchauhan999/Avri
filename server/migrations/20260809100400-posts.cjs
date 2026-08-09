"use strict";

/** Blog articles. */

const { stamps, tableOptions, primaryKey } = require("../config/migration-helpers.cjs");

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "posts",
      {
        id: primaryKey(Sequelize),
        title: { type: Sequelize.STRING(220), allowNull: false },
        slug: { type: Sequelize.STRING(240), allowNull: false },
        category_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false },
        excerpt: { type: Sequelize.STRING(400), allowNull: true },
        // HTML from the admin's rich-text editor, sanitised with `sanitize-html`
        // on write, so the stored value is already safe wherever it is used.
        body: { type: Sequelize.TEXT("medium"), allowNull: false },
        cover_image_path: { type: Sequelize.STRING(400), allowNull: true },
        cover_image_alt: { type: Sequelize.STRING(255), allowNull: true },
        // Stored so next/image never causes layout shift.
        cover_image_width: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
        cover_image_height: { type: Sequelize.SMALLINT.UNSIGNED, allowNull: true },
        status: {
          type: Sequelize.ENUM("draft", "published", "archived"),
          allowNull: false,
          defaultValue: "draft",
        },
        published_at: { type: Sequelize.DATE, allowNull: true },
        reading_minutes: { type: Sequelize.TINYINT.UNSIGNED, allowNull: true },
        is_featured: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        seo_title: { type: Sequelize.STRING(200), allowNull: true },
        seo_description: { type: Sequelize.STRING(320), allowNull: true },
        seo_keywords: { type: Sequelize.STRING(400), allowNull: true },
        canonical_url: { type: Sequelize.STRING(400), allowNull: true },
        author_id: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true },
        // Kept so a byline survives the author's account being removed.
        author_name_snapshot: { type: Sequelize.STRING(160), allowNull: true },
        view_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
        ...stamps(Sequelize),
      },
      tableOptions
    );

    await queryInterface.addConstraint("posts", {
      type: "unique",
      name: "uq_posts_slug",
      fields: ["slug"],
    });

    // RESTRICT, not SET NULL: a post must always belong to a category, so
    // deleting one that still has posts should fail rather than orphan them.
    await queryInterface.addConstraint("posts", {
      type: "foreign key",
      name: "fk_posts_category",
      fields: ["category_id"],
      references: { table: "post_categories", field: "id" },
      onDelete: "RESTRICT",
      onUpdate: "NO ACTION",
    });

    await queryInterface.addConstraint("posts", {
      type: "foreign key",
      name: "fk_posts_author",
      fields: ["author_id"],
      references: { table: "admin_users", field: "id" },
      onDelete: "SET NULL",
      onUpdate: "NO ACTION",
    });

    await queryInterface.addIndex("posts", ["status", "published_at"], {
      name: "idx_posts_status_published",
    });
    await queryInterface.addIndex("posts", ["category_id", "status", "published_at"], {
      name: "idx_posts_category_status",
    });
    await queryInterface.addIndex("posts", ["is_featured", "published_at"], {
      name: "idx_posts_featured",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("posts");
  },
};
