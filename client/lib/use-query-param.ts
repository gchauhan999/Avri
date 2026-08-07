"use client";

import { useSyncExternalStore } from "react";

/** The query string never changes without a navigation, so nothing to watch. */
const subscribe = () => () => {};
const serverSnapshot = () => "";

/**
 * Reads a query parameter in the browser, safely on a statically exported page.
 *
 * Every route here is prerendered to a plain HTML file, so `?category=` and
 * `?product=` never reach the server — the HTML is identical whatever the
 * query string says. The value has to be read on the client.
 *
 * `useSyncExternalStore` is what makes that safe: it returns the empty server
 * snapshot for the first render, matching the exported HTML exactly, then
 * hands over the real value once hydrated. Reading `window.location` during
 * render would break hydration, and setting state from an effect would cost a
 * second render pass.
 */
export function useQueryParam(key: string): string {
  return useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(key) ?? "",
    serverSnapshot
  );
}
