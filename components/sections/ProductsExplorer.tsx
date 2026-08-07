"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Close, Search } from "@/components/ui/Icons";
import ProductCard from "@/components/ui/ProductCard";
import type { ProductGroup } from "@/lib/products";
import { useQueryParam } from "@/lib/use-query-param";
import type { Product } from "@/lib/types";

const ALL = "All";

/** Everything a search term is matched against, flattened once per product. */
function haystack(product: Product): string {
  return [
    product.name,
    product.category,
    product.shortDescription,
    product.fullDescription,
    ...product.applications,
    ...product.specifications.map((s) => `${s.label} ${s.value}`),
  ]
    .join(" ")
    .toLowerCase();
}

/** Filterable, searchable product catalogue. */
export default function ProductsExplorer({
  products,
  groups,
  initialCategory = ALL,
}: {
  products: Product[];
  groups: ProductGroup[];
  /** Pre-selected category, e.g. from `/products?category=Smart%20Meters`. */
  initialCategory?: string;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  /**
   * `/products?category=Smart%20Meters` deep-links in from the navigation and
   * from other pages. The page is exported as static HTML, so the query string
   * is resolved in the browser — see `useQueryParam`. Only a category we
   * actually publish is honoured, so a stale link cannot land the visitor on
   * an empty grid.
   */
  const deepLinked = useQueryParam("category");
  const fromUrl = products.some((p) => p.category === deepLinked)
    ? deepLinked
    : "";

  // An explicit click always wins over the URL.
  const active = chosen ?? (fromUrl || initialCategory);
  const setActive = setChosen;

  const index = useMemo(
    () => new Map(products.map((p) => [p.slug, haystack(p)])),
    [products]
  );

  // Search first, so the category counts reflect what the search left behind.
  const searched = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return products;

    return products.filter((p) => {
      const text = index.get(p.slug) ?? "";
      return terms.every((term) => text.includes(term));
    });
  }, [index, products, query]);

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of searched) {
      map.set(p.category, (map.get(p.category) ?? 0) + 1);
    }
    return map;
  }, [searched]);

  const visible = useMemo(
    () =>
      active === ALL ? searched : searched.filter((p) => p.category === active),
    [active, searched]
  );

  const filtered = active !== ALL || query.trim() !== "";

  const reset = () => {
    setActive(ALL);
    setQuery("");
  };

  const categoryButton = (category: string, count: number) => {
    const selected = category === active;
    return (
      <button
        type="button"
        onClick={() => setActive(category)}
        aria-pressed={selected}
        className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2 text-left text-sm transition-colors ${
          selected
            ? "bg-brand-500 font-semibold text-white"
            : count === 0
              ? "text-ink-300"
              : "text-ink-600 hover:bg-brand-50 hover:text-brand-700"
        }`}
      >
        <span>{category}</span>
        <span
          className={`text-xs tabular-nums ${
            selected ? "text-white/70" : "text-ink-400"
          }`}
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[17rem_1fr] lg:gap-12">
      {/* ------------------------------------------- Category rail (desktop) */}
      <aside className="hidden lg:block">
        <div className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto pr-1">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
            Categories
          </h2>

          <div className="mt-4">{categoryButton(ALL, searched.length)}</div>

          {groups.map((group) => (
            <div key={group.title} className="mt-6">
              <h3 className="px-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-300">
                {group.title}
              </h3>
              <ul className="mt-2 space-y-0.5">
                {group.categories.map((category) => (
                  <li key={category}>
                    {categoryButton(category, counts.get(category) ?? 0)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      {/* ------------------------------------------------------------ Results */}
      <div>
        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, ratings or applications…"
            aria-label="Search products"
            className="w-full rounded-xl border border-ink-200 bg-white py-3.5 pl-12 pr-11 text-sm text-ink-900 placeholder:text-ink-300 transition-colors focus:border-brand-500 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-ink-50 hover:text-ink-700"
            >
              <Close className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* Category rail (mobile and tablet) */}
        <div className="no-scrollbar -mx-5 mt-5 overflow-x-auto px-5 lg:hidden">
          <div
            role="tablist"
            aria-label="Filter products by category"
            className="flex w-max gap-2.5"
          >
            {[ALL, ...groups.flatMap((g) => g.categories)].map((category) => {
              const selected = category === active;
              const count =
                category === ALL
                  ? searched.length
                  : (counts.get(category) ?? 0);

              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActive(category)}
                  className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    selected
                      ? "text-white"
                      : "border border-ink-200 text-ink-600 hover:border-brand-500 hover:text-brand-600"
                  }`}
                >
                  {selected ? (
                    <motion.span
                      layoutId="product-filter-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-brand-500"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                  {category}
                  <span
                    className={`ml-2 text-xs tabular-nums ${
                      selected ? "text-white/70" : "text-ink-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-400" aria-live="polite">
            Showing {visible.length}{" "}
            {visible.length === 1 ? "product" : "products"}
            {active === ALL ? "" : ` in ${active}`}
            {query.trim() ? ` matching “${query.trim()}”` : ""}.
          </p>
          {filtered ? (
            <button
              type="button"
              onClick={reset}
              className="text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              Clear filters
            </button>
          ) : null}
        </div>

        <motion.div
          layout
          className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((product) => (
              <motion.div
                key={product.slug}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {visible.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-dashed border-ink-200 py-16 text-center">
            <p className="text-sm text-ink-500">
              No products match that search.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-4 text-sm font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              Clear filters and show everything
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
