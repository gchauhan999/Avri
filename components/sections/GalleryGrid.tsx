"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Close } from "@/components/ui/Icons";
import Media from "@/components/ui/Media";
import type { GalleryItem } from "@/lib/types";

/** Filterable gallery with a lightbox. */
export default function GalleryGrid({
  items,
  categories,
}: {
  items: GalleryItem[];
  categories: string[];
}) {
  const [active, setActive] = useState("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const visible = useMemo(
    () => (active === "All" ? items : items.filter((i) => i.category === active)),
    [active, items]
  );

  const close = useCallback(() => setOpenIndex(null), []);

  const step = useCallback(
    (delta: number) =>
      setOpenIndex((current) => {
        if (current === null) return current;
        return (current + delta + visible.length) % visible.length;
      }),
    [visible.length]
  );

  // Keyboard controls for the lightbox.
  useEffect(() => {
    if (openIndex === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, step]);

  const current = openIndex === null ? null : visible[openIndex];

  return (
    <>
      {/* Category rail */}
      <div className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <div
          role="tablist"
          aria-label="Filter gallery by category"
          className="flex w-max gap-2.5 sm:w-auto sm:flex-wrap"
        >
          {categories.map((cat) => {
            const selected = cat === active;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setActive(cat);
                  setOpenIndex(null);
                }}
                className={`relative whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  selected
                    ? "text-white"
                    : "border border-ink-200 text-ink-600 hover:border-brand-500 hover:text-brand-600"
                }`}
              >
                {selected ? (
                  <motion.span
                    layoutId="gallery-filter-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-brand-500"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <motion.div
        layout
        className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {visible.map((item, index) => (
            <motion.button
              key={item.id}
              type="button"
              layout
              onClick={() => setOpenIndex(index)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              aria-label={`View larger: ${item.caption}`}
              className="group relative overflow-hidden rounded-3xl border border-ink-100 bg-white text-left"
            >
              <Media
                illustration={item.illustration}
                src={item.image}
                alt={item.caption}
                ratio="aspect-[4/3]"
                rounded="rounded-none"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
              <div className="p-5">
                <p className="text-sm font-semibold text-ink-900">
                  {item.caption}
                </p>
                <p className="mt-1 text-xs text-ink-400">{item.category}</p>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {current ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={current.caption}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-ink-900/85 p-5 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white"
            >
              <Media
                illustration={current.illustration}
                src={current.image}
                alt={current.caption}
                ratio="aspect-[16/10]"
                rounded="rounded-none"
                sizes="(min-width: 1024px) 60vw, 100vw"
              />
              <div className="flex items-center justify-between gap-6 p-6">
                <div>
                  <p className="text-base font-bold text-ink-900">
                    {current.caption}
                  </p>
                  <p className="mt-1 text-xs text-ink-400">
                    {current.category} · {(openIndex ?? 0) + 1} of{" "}
                    {visible.length}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous image"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 text-ink-600 transition-colors hover:border-brand-500 hover:text-brand-600"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next image"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 text-ink-600 transition-colors hover:border-brand-500 hover:text-brand-600"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink-900 text-white transition-colors hover:bg-brand-600"
                  >
                    <Close className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
