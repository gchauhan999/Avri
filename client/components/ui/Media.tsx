import Image, { type StaticImageData } from "next/image";
import type { IllustrationKey } from "@/lib/types";
import Illustration from "./Illustration";

/**
 * Renders a photograph when one is supplied, and the branded illustration when
 * it is not — so a page never shows a broken or empty image frame.
 *
 * Photographs live in `public/assets/...` and are referenced from the site
 * root, e.g. `/assets/services/solar.jpg`.
 */
export default function Media({
  src,
  illustration,
  alt,
  ratio = "aspect-[16/10]",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  rounded = "rounded-2xl",
  className = "",
  priority = false,
  /** Adds a dark scrim, for when text is laid over the media. */
  overlay = false,
  /**
   * How the picture fills its frame.
   *
   * `cover` for photographs — a scene should reach the edges. `contain` for a
   * cut-out of a single item, which needs the whole object visible and some
   * room around it; cropping one slices the equipment off at the edges.
   */
  fit = "cover",
}: {
  /** A path under `public/`, or a statically imported image. */
  src?: string | StaticImageData;
  illustration: IllustrationKey;
  alt: string;
  ratio?: string;
  sizes?: string;
  rounded?: string;
  className?: string;
  priority?: boolean;
  overlay?: boolean;
  fit?: "cover" | "contain";
}) {
  // A blank string counts as "no photograph", so the illustration shows.
  const photo = typeof src === "string" ? src.trim() || undefined : src;

  const contained = fit === "contain";

  return (
    <div
      className={`relative isolate overflow-hidden ${
        // A cut-out is lit on white in the studio, so anything but white behind
        // it shows as a rectangle around the object.
        contained ? "bg-white" : "bg-brand-50"
      } ${rounded} ${ratio} ${className}`}
    >
      {photo ? (
        <Image
          src={photo}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          loading={priority ? undefined : "lazy"}
          /**
           * The breathing room goes on the image, not the frame. A `fill`
           * image is absolutely positioned, and `inset-0` resolves against the
           * frame's *padding box* — so padding there would be covered over.
           * Padding here shrinks the content box that `object-contain` fits
           * into, which is what actually insets the object.
           */
          className={contained ? "object-contain p-5" : "object-cover"}
        />
      ) : (
        <Illustration variant={illustration} />
      )}

      {overlay ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/20 to-transparent"
        />
      ) : null}
    </div>
  );
}
