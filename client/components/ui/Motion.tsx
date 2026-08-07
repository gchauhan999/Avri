"use client";

import { motion, type Variants } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import {
  fadeIn,
  fadeLeft,
  fadeRight,
  fadeUp,
  scaleIn,
  staggerContainer,
  viewportOnce,
} from "@/lib/motion";

const presets: Record<string, Variants> = {
  up: fadeUp,
  in: fadeIn,
  left: fadeLeft,
  right: fadeRight,
  scale: scaleIn,
};

export type RevealPreset = keyof typeof presets;

/**
 * Animates its children into view once, as the element is scrolled to.
 * Wrap any server-rendered markup — the children stay server components.
 */
export function Reveal({
  children,
  preset = "up",
  delay = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  preset?: RevealPreset;
  /** Seconds to wait before this element animates. */
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      variants={presets[preset]}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Releases direct `<RevealItem>` children one after another.
 * Use for grids and lists.
 */
export function RevealGroup({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}) {
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
    >
      {children}
    </MotionTag>
  );
}

/** A single item inside a `<RevealGroup>`. */
export function RevealItem({
  children,
  className,
  preset = "up",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  preset?: RevealPreset;
  as?: ElementType;
}) {
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <MotionTag className={className} variants={presets[preset]}>
      {children}
    </MotionTag>
  );
}

/** Lifts a card slightly on hover. Purely decorative. */
export function HoverLift({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 320, damping: 24 }}
    >
      {children}
    </motion.div>
  );
}
