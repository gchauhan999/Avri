/**
 * Public URL for a stored image.
 *
 * A same-origin path, deliberately not an absolute URL. Both front-ends proxy
 * `/uploads/*` through to this server, which buys three things:
 *
 *   - `next/image` treats the file as local and optimises it. Given an absolute
 *     URL it refuses outright unless the API host is listed in
 *     `images.remotePatterns`, which is the error this shape avoids.
 *   - the API's origin never appears in the page source, so there is one
 *     hostname in the CSP and no CORS on the image path.
 *   - Open Graph tags still come out absolute: `metadataBase` in the client's
 *     root layout resolves them against the public site URL, which is where a
 *     crawler can actually reach the file. An absolute API URL would point a
 *     crawler at a host it cannot see.
 *
 * `public/` is the static mount root, so it is not part of the URL.
 */
export const uploadUrl = (stored: string | null): string | null =>
  stored ? `/uploads/${stored.replace(/^public\//, "")}` : null;
