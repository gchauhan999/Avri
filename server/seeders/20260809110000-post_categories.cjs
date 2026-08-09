"use strict";

/**
 * The five blog categories from the brief.
 *
 * Idempotent: re-running refreshes the ordering but leaves a description
 * someone has edited in the admin panel alone.
 *
 * Slugs are written out rather than derived, so this file does not have to
 * duplicate `src/helpers/slug.ts` in CommonJS. They are fixed reference data —
 * if a name changes here, change the slug deliberately, because the public URL
 * changes with it.
 */

const CATEGORIES = [
  {
    name: "Smart Metering",
    slug: "smart-metering",
    description: "Prepaid and smart meters, AMI rollouts and metering standards.",
  },
  {
    name: "Solar",
    slug: "solar",
    description: "Rooftop and ground-mount solar, net metering and yields.",
  },
  {
    name: "EV Charging",
    slug: "ev-charging",
    description: "AC and DC charging infrastructure, standards and siting.",
  },
  {
    name: "Government Schemes",
    slug: "government-schemes",
    description: "RDSS, PM Surya Ghar, FAME and other central and state programmes.",
  },
  {
    name: "Electrical Safety",
    slug: "electrical-safety",
    description: "Site safety, earthing, protection and statutory compliance.",
  },
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      "post_categories",
      CATEGORIES.map((category, index) => ({
        name: category.name,
        slug: category.slug,
        description: category.description,
        sort_order: index,
      })),
      // created_at / updated_at are left to their column defaults.
      { updateOnDuplicate: ["sort_order"] }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("post_categories", {
      slug: { [Sequelize.Op.in]: CATEGORIES.map((c) => c.slug) },
    });
  },
};
