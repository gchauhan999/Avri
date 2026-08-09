<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Tells the public site to refresh a page immediately.
 *
 * Pages are cached with ISR, so a published article would otherwise appear some
 * minutes later — which reads as "the admin panel is broken" to whoever just
 * pressed Publish. This pings a route handler on the Next server that calls
 * `revalidateTag` / `revalidatePath`.
 *
 * Never throws. Failing to refresh a cache is not a reason to fail a save that
 * has already happened; the page still updates when the ISR window elapses.
 */
class SiteRevalidator
{
    /**
     * @param  array<int, string>  $tags
     * @param  array<int, string>  $paths
     */
    public function ping(array $tags = [], array $paths = []): void
    {
        $url = config('avri.revalidate.url');
        $secret = config('avri.revalidate.secret');

        if ($url === '' || $secret === '') {
            Log::debug('revalidation not configured — the site will refresh on its own schedule');

            return;
        }

        try {
            $response = Http::withHeaders(['X-Revalidate-Secret' => $secret])
                // A slow website must not hold up the admin panel.
                ->timeout(5)
                ->post($url, ['tags' => $tags, 'paths' => $paths]);

            if ($response->failed()) {
                Log::warning('revalidation refused', [
                    'status' => $response->status(),
                    'tags' => $tags,
                    'paths' => $paths,
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('revalidation failed', ['error' => $e->getMessage()]);
        }
    }
}
