<?php

namespace App\Models\Concerns;

use DateTimeInterface;

/**
 * Dates go out as `2026-08-09 10:37:22`, not ISO-8601.
 *
 * Laravel would serialise `2026-08-09T10:37:22.000000Z`, and the website reads
 * these values in two different ways. `client/lib/careers.ts` copes with either
 * form, but `client/app/sitemap.ts` does `updatedAt.replace(" ", "T") + "Z"` —
 * given an ISO string that appends a second `Z` and yields an Invalid Date, so
 * every job and article silently drops out of the sitemap.
 *
 * Keeping the old shape is therefore the smaller and safer choice: it holds the
 * API contract the site was written against, rather than changing the wire
 * format and hunting for every reader of it.
 */
trait SerialisesTimestampsAsSql
{
    protected function serializeDate(DateTimeInterface $date): string
    {
        return $date->format('Y-m-d H:i:s');
    }
}
