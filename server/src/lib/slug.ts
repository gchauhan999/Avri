/**
 * URL slugs for jobs, posts and clients.
 *
 * Matches the hand-written slugs already used across `client/lib/products.ts`
 * and `client/lib/site.ts` — lowercase, ASCII, hyphen separated — so database
 * rows and file-based content produce the same shape of URL.
 */

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    // Strip combining marks, so an accented "Ghaziābād" decomposes and lands as
    // "ghaziabad" rather than losing those letters entirely.
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180)
    .replace(/-+$/g, "");
}

/**
 * Appends -2, -3 … until the slug is free.
 *
 * `exists` is passed in rather than a table name so this stays independent of
 * the schema, and so callers can exclude the row being edited (otherwise
 * renaming a post back to its own slug would bump it to `-2` on every save).
 */
export async function uniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>
): Promise<string> {
  const root = slugify(base) || "item";

  if (!(await exists(root))) return root;

  for (let n = 2; n < 500; n += 1) {
    const candidate = `${root}-${n}`;
    if (!(await exists(candidate))) return candidate;
  }

  // 500 collisions means something is wrong upstream; a timestamp suffix is a
  // better outcome than an unbounded loop.
  return `${root}-${Date.now().toString(36)}`;
}
