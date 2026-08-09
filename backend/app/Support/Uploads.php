<?php

namespace App\Support;

class Uploads
{
    /**
     * Public URL for a stored image.
     *
     * A same-origin path, deliberately not an absolute URL. Both front-ends
     * proxy `/uploads/*` through to this application, which buys three things:
     *
     *   - `next/image` treats the file as local and optimises it. Given an
     *     absolute URL it refuses outright unless this host is listed in
     *     `images.remotePatterns`.
     *   - this API's origin never appears in the page source, so there is one
     *     hostname in the CSP and no CORS on the image path.
     *   - Open Graph tags still come out absolute, because `metadataBase` in
     *     the site's root layout resolves them against the public site URL —
     *     which is where a crawler can actually reach the file. An absolute API
     *     URL would point a crawler at a host it cannot see.
     */
    public static function url(?string $storedPath): ?string
    {
        if ($storedPath === null || $storedPath === '') {
            return null;
        }

        return '/uploads/'.ltrim($storedPath, '/');
    }
}
