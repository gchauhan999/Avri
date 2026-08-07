import type { Metadata } from "next";

import ContactCTA from "@/components/sections/ContactCTA";
import ProductsExplorer from "@/components/sections/ProductsExplorer";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight, Check } from "@/components/ui/Icons";
import { RevealGroup, RevealItem } from "@/components/ui/Motion";
import PageHero from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { productCategories, productGroups, products } from "@/lib/products";
import { company } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Products",
  description:
    "Distribution and power transformers, HT and LT panels, RMUs, VCB panels, switchgear, smart and DT meters, CT/PT, power and control cables, street lighting, solar equipment and EV chargers supplied by Avri Energy.",
  path: "/products",
  keywords: productCategories.map((c) => c.toLowerCase()),
});

/** Product catalogue schema, so the range is indexable as a list. */
const catalogueJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${company.name} product catalogue`,
  numberOfItems: products.length,
  itemListElement: products.map((p, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Product",
      name: p.name,
      category: p.category,
      description: p.shortDescription,
      url: `${company.siteUrl}/products/${p.slug}`,
      brand: { "@type": "Brand", name: company.name },
    },
  })),
};

const assurances = [
  "Supplied from approved and type-tested makes",
  "Routine test certificates with every dispatch",
  "Correct ratings, calculated — not guessed",
  "Installation and commissioning available on request",
];

/**
 * The catalogue page is prerendered to static HTML, so `?category=` cannot be
 * read here — a static file is served whatever the query string says.
 * `ProductsExplorer` picks the deep-link up in the browser instead.
 */
export default function ProductsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogueJsonLd) }}
      />

      <PageHero
        breadcrumb="Products"
        eyebrow="Our products"
        title="Electrical equipment, supplied and supported"
        lead={`${products.length} products across ${productCategories.length} categories — transformers, panels, switchgear, metering, cables, lighting, solar and EV charging. Supplied item-wise against your BOQ, or installed and commissioned as part of a turnkey scope.`}
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/request-a-quote" variant="primary">
            Request a Quote
            <ArrowRight />
          </ButtonLink>
          <ButtonLink href="/services" variant="ghostLight">
            Installation Services
          </ButtonLink>
        </div>
      </PageHero>

      {/* ------------------------------------------------------- Assurances */}
      <div className="border-b border-ink-100 bg-ink-50/60">
        <Section className="py-8 sm:py-10">
          <RevealGroup
            as="ul"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {assurances.map((point) => (
              <RevealItem key={point} as="li">
                <div className="flex gap-3 text-sm text-ink-700">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {point}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Section>
      </div>

      {/* --------------------------------------------------------- Catalogue */}
      <Section>
        <ProductsExplorer products={products} groups={productGroups} />
      </Section>

      <ContactCTA
        title="Need a price against your BOQ?"
        body="Send the item list with ratings and makes. We will return an item-wise quotation with delivery timelines, and install it too if you want the whole job done."
      />
    </>
  );
}
