<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        /*
         * Registered by hand rather than with `php artisan install:api`, which
         * would also pull in Sanctum. There are no API tokens here: the public
         * endpoints are open and read-mostly, and the admin panel authenticates
         * with a session cookie.
         */
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        /*
         * The public site is a different origin in development (:3000 against
         * :8000), so the browser preflights the form posts. `config/cors.php`
         * holds the allowlist.
         */
        $middleware->validateCsrfTokens(except: [
            // The forms are posted from the website, not from a Blade page, so
            // there is no CSRF token to carry. They are protected instead by
            // the origin allowlist above and by per-IP rate limits.
            'api/*',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
