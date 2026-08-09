/**
 * Shared pieces for the sequelize-cli migrations.
 *
 * This lives in `config/` rather than `migrations/` on purpose: the CLI treats
 * every `.cjs` file in the migrations directory as a migration to run, so a
 * helper parked there would be picked up and fail.
 */

/**
 * `created_at` / `updated_at`, identical on every table.
 *
 * Declared with raw SQL types rather than `Sequelize.DATE`, which emits
 * DATETIME. TIMESTAMP with an ON UPDATE clause lets MySQL maintain
 * `updated_at` even for rows changed by hand outside the application.
 */
const stamps = (Sequelize) => ({
  created_at: {
    type: "TIMESTAMP",
    allowNull: false,
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
  },
  updated_at: {
    type: "TIMESTAMP",
    allowNull: false,
    defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
  },
});

/** Every table is InnoDB / utf8mb4, matching the database default. */
const tableOptions = {
  charset: "utf8mb4",
  collate: "utf8mb4_0900_ai_ci",
  engine: "InnoDB",
};

/** Primary key: unsigned BIGINT, auto-increment. */
const primaryKey = (Sequelize) => ({
  type: Sequelize.BIGINT.UNSIGNED,
  autoIncrement: true,
  primaryKey: true,
  allowNull: false,
});

module.exports = { stamps, tableOptions, primaryKey };
