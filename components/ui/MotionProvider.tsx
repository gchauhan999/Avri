"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Honours the visitor's "reduce motion" system setting for every animation on
 * the site.
 *
 * The scroll-in variants in `lib/motion.ts` start elements offset by 28px and
 * slide them into place. Without this, a visitor who has asked their OS to
 * reduce motion still gets the movement — and on a phone, where those elements
 * are full-width, the offset also pushes content sideways. `reducedMotion:
 * "user"` makes Framer Motion skip transform and layout animation for those
 * visitors while still fading content in, so nothing is left invisible.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
