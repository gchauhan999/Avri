import Link from "next/link";
import Media from "./Media";
import { ArrowRight } from "./Icons";
import { HoverLift } from "./Motion";
import type { Product } from "@/lib/types";

/** Product card, shared by the home page strip and the products listing. */
export default function ProductCard({ product }: { product: Product }) {
  return (
    <HoverLift className="h-full">
      <Link
        href={`/products/${product.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white transition-colors hover:border-brand-200 hover:shadow-xl hover:shadow-ink-900/5"
      >
        <div className="relative">
          <Media
            illustration={product.illustration}
            src={product.image}
            alt={product.name}
            ratio="aspect-[4/3]"
            rounded="rounded-none"
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 45vw, 100vw"
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-brand-700 backdrop-blur">
            {product.category}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-6">
          <h3 className="text-base font-bold text-ink-900 transition-colors group-hover:text-brand-600">
            {product.name}
          </h3>
          <p className="mt-2.5 flex-1 text-sm leading-relaxed text-ink-500">
            {product.shortDescription}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-600">
            View details
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </HoverLift>
  );
}
