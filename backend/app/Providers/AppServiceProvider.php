<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->registerRateLimiters();
    }

    /**
     * Per-IP limits for the public API.
     *
     * These only work if the trusted-proxy configuration is right. Behind a
     * reverse proxy with it unset, every request appears to come from the
     * proxy's own address — so the first bot to hit a limit locks out every
     * visitor.
     *
     * All three answer with the same JSON envelope as any other error, so the
     * website's forms can render the message rather than showing a blank
     * failure.
     */
    private function registerRateLimiters(): void
    {
        // Browsing jobs, articles and clients. Generous — this is anti-scrape,
        // not a gate.
        RateLimiter::for('public-read', fn (Request $request) => Limit::perMinutes(5, 300)
            ->by($request->ip())
            ->response(fn () => $this->tooMany('Too many requests. Please wait a moment and try again.')));

        // The contact and quote forms.
        RateLimiter::for('enquiry-write', fn (Request $request) => Limit::perMinutes(10, 5)
            ->by($request->ip())
            ->response(fn () => $this->tooMany(
                'You have sent several enquiries already. Please call us instead — we will pick up.'
            )));

        /*
         * Job applications. Tightest of the lot: this is the only public route
         * that writes a file to disk, so it is the one that can fill a volume.
         */
        RateLimiter::for('application-write', fn (Request $request) => Limit::perHour(3)
            ->by($request->ip())
            ->response(fn () => $this->tooMany(
                'You have submitted several applications recently. Please try again later.'
            )));
    }

    private function tooMany(string $message): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'error' => ['code' => 'RATE_LIMITED', 'message' => $message],
        ], 429);
    }
}
