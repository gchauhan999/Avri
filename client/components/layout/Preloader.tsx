"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { company } from "@/lib/site";

/**
 * Brief branded overlay shown on first paint, then faded away.
 *
 * The page content renders underneath the whole time, so this never blocks
 * crawlers or delays interactivity. Users who prefer reduced motion skip it.
 */
export default function Preloader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setDone(true), reduced ? 0 : 850);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {done ? null : (
        <motion.div
          key="preloader"
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Image
              src="/assets/logo.png"
              alt={`${company.name} logo`}
              width={1600}
              height={800}
              priority
              className="h-14 w-auto sm:h-16"
            />
          </motion.div>

          {/* Indeterminate progress sweep */}
          <div className="mt-8 h-0.5 w-44 overflow-hidden rounded-full bg-ink-100">
            <motion.div
              className="h-full w-1/3 rounded-full bg-brand-500"
              initial={{ x: "-100%" }}
              animate={{ x: "300%" }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
