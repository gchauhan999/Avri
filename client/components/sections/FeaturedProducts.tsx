import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight } from "@/components/ui/Icons";
import { RevealGroup, RevealItem } from "@/components/ui/Motion";
import ProductCard from "@/components/ui/ProductCard";
import { Section, SectionHeading } from "@/components/ui/Section";
import { featuredProducts } from "@/lib/products";

/** Featured products strip for the home page. */
export default function FeaturedProducts({
  limit = 6,
}: {
  limit?: number;
}) {
  const items = featuredProducts.slice(0, limit);

  return (
    <Section className="border-t border-ink-100 bg-ink-50/60">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Our products"
          title="Equipment we supply"
          lead="Transformers, panels, switchgear, meters, cables, lighting and solar equipment — supplied from approved makes with full test documentation."
        />
        <ButtonLink href="/products" variant="outline" className="shrink-0">
          View All Products
          <ArrowRight />
        </ButtonLink>
      </div>

      <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <RevealItem key={product.slug}>
            <ProductCard product={product} />
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
