import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ContactCTA from "@/components/sections/ContactCTA";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight, Check, Download } from "@/components/ui/Icons";
import Media from "@/components/ui/Media";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Motion";
import PageHero from "@/components/ui/PageHero";
import ProductCard from "@/components/ui/ProductCard";
import { Section, SectionHeading } from "@/components/ui/Section";
import {
  getProduct,
  groupOf,
  products,
  relatedProducts,
} from "@/lib/products";
import { imageSrc, isCutout } from "@/lib/product-images";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { company, contact } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

/** The catalogue is complete at build time, so anything else is a real 404. */
export const dynamicParams = false;

/** One static page per catalogue entry. */
export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  return pageMetadata({
    title: product.name,
    description: product.shortDescription,
    path: `/products/${product.slug}`,
    keywords: [
      product.name.toLowerCase(),
      product.category.toLowerCase(),
      `${product.category.toLowerCase()} supplier`,
      `${product.name.toLowerCase()} price`,
    ],
  });
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) notFound();

  const related = relatedProducts(product);
  const categoryPath = `/products?category=${encodeURIComponent(
    product.category
  )}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    category: product.category,
    description: product.fullDescription,
    url: `${company.siteUrl}/products/${product.slug}`,
    brand: { "@type": "Brand", name: company.name },
    ...(product.image
      ? { image: `${company.siteUrl}${imageSrc(product.image)}` }
      : {}),
    additionalProperty: product.specifications.map((s) => ({
      "@type": "PropertyValue",
      name: s.label,
      value: s.value,
    })),
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "INR",
      seller: { "@type": "Organization", name: company.name },
      url: `${company.siteUrl}/request-a-quote?product=${product.slug}`,
    },
  };

  const trailJsonLd = breadcrumbJsonLd([
    { label: "Products", path: "/products" },
    { label: product.category, path: categoryPath },
    { label: product.name, path: `/products/${product.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([productJsonLd, trailJsonLd]),
        }}
      />

      <PageHero
        breadcrumb={[
          { label: "Products", href: "/products" },
          { label: product.category, href: categoryPath },
          { label: product.name },
        ]}
        eyebrow={product.category}
        title={product.name}
        lead={product.shortDescription}
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink
            href={`/request-a-quote?product=${product.slug}`}
            variant="primary"
          >
            Request a Quote
            <ArrowRight />
          </ButtonLink>
          {product.datasheet ? (
            <ButtonLink href={product.datasheet} variant="ghostLight" newTab>
              <Download />
              Download Datasheet (PDF)
            </ButtonLink>
          ) : null}
        </div>
      </PageHero>

      {/* ---------------------------------------------------- Product detail */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* Media and datasheet rail */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal preset="left">
              <Media
                illustration={product.illustration}
                src={product.image}
                alt={product.name}
                ratio="aspect-[4/3]"
                sizes="(min-width: 1024px) 38vw, 100vw"
                priority
                className="ring-1 ring-ink-100"
                fit={isCutout(product.slug, product.category) ? "contain" : "cover"}
              />

              <div className="mt-6 rounded-3xl border border-ink-100 bg-ink-50/60 p-7">
                <h2 className="text-base font-bold text-ink-900">
                  {product.datasheet ? "Technical datasheet" : "Need the datasheet?"}
                </h2>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-500">
                  {product.datasheet
                    ? "Full ratings, dimensions and test values in a single PDF."
                    : "Ratings and drawings are issued against the specific make and model you need. Ask and we will email the current datasheet."}
                </p>

                {product.datasheet ? (
                  <ButtonLink
                    href={product.datasheet}
                    variant="outline"
                    className="mt-5"
                    newTab
                  >
                    <Download />
                    Download Datasheet
                  </ButtonLink>
                ) : (
                  <ButtonLink
                    href={`mailto:${contact.salesEmail}?subject=${encodeURIComponent(
                      `Datasheet request — ${product.name}`
                    )}`}
                    variant="outline"
                    className="mt-5"
                  >
                    Request Datasheet
                  </ButtonLink>
                )}
              </div>
            </Reveal>
          </div>

          {/* Copy, specifications and applications */}
          <div>
            <Reveal>
              <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                Overview
              </h2>
              <p className="mt-5 text-base leading-relaxed text-ink-600">
                {product.fullDescription}
              </p>
            </Reveal>

            {/* Specifications */}
            <Reveal className="mt-12">
              <h2 className="text-xl font-bold text-ink-900">
                Technical specifications
              </h2>
              <div className="mt-5 overflow-x-auto rounded-2xl border border-ink-100">
                <table className="w-full min-w-[24rem] text-left text-sm">
                  <caption className="sr-only">
                    Technical specifications for {product.name}
                  </caption>
                  <tbody>
                    {product.specifications.map((spec, i) => (
                      <tr
                        key={spec.label}
                        className={i % 2 === 0 ? "bg-ink-50/60" : "bg-white"}
                      >
                        <th
                          scope="row"
                          className="w-2/5 align-top px-5 py-3.5 font-semibold text-ink-700"
                        >
                          {spec.label}
                        </th>
                        <td className="px-5 py-3.5 text-ink-600">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-ink-400">
                Specifications are indicative. Final ratings are confirmed
                against your site conditions and the approved make.
              </p>
            </Reveal>

            {/* Applications */}
            <Reveal className="mt-12">
              <h2 className="text-xl font-bold text-ink-900">Applications</h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                {product.applications.map((application) => (
                  <li
                    key={application}
                    className="flex gap-3.5 text-sm leading-relaxed text-ink-700"
                  >
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{application}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* Enquiry */}
            <Reveal className="mt-12">
              <div className="rounded-3xl bg-ink-900 p-8">
                <h2 className="text-lg font-bold text-white">
                  Interested in the {product.name}?
                </h2>
                <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-white/70">
                  Tell us the rating and quantity you need. We will confirm
                  availability, price and delivery — and quote the installation
                  too if you want it commissioned.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ButtonLink
                    href={`/request-a-quote?product=${product.slug}`}
                    variant="primary"
                  >
                    Request a Quote
                    <ArrowRight />
                  </ButtonLink>
                  <ButtonLink href="/contact" variant="ghostLight">
                    Talk to an Engineer
                  </ButtonLink>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------- Related products */}
      {related.length > 0 ? (
        <div className="bg-ink-50/60">
          <Section>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <SectionHeading
                eyebrow="Related products"
                title={`More from ${groupOf(product.category) ?? "our catalogue"}`}
                lead="Equipment commonly specified alongside this item."
              />
              <ButtonLink
                href={categoryPath}
                variant="outline"
                className="shrink-0"
              >
                All {product.category}
                <ArrowRight />
              </ButtonLink>
            </div>

            <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <RevealItem key={item.slug}>
                  <ProductCard product={item} />
                </RevealItem>
              ))}
            </RevealGroup>
          </Section>
        </div>
      ) : null}

      <ContactCTA
        title="Supply only, or supply and install?"
        body="We deliver material against your BOQ with full test documentation — and can erect, test and commission it under the same contract."
      />
    </>
  );
}
