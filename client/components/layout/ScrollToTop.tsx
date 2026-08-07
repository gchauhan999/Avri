"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowUp } from "@/components/ui/Icons";

/** Floating button that returns the user to the top of the page. */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.7, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 12 }}
          transition={{ duration: 0.22 }}
          whileHover={{ y: -3 }}
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "auto"
                : "smooth",
            })
          }
          aria-label="Scroll back to top"
          className="fixed bottom-6 left-6 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-ink-900 text-white shadow-lg shadow-ink-900/25 transition-colors hover:bg-brand-600"
        >
          <ArrowUp />
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}
