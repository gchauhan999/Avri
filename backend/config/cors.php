<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing
    |--------------------------------------------------------------------------
    |
    | The website and this API are separate origins in development (:3000
    | against :8000), so the browser preflights every form post. In production
    | they sit behind one hostname and this rarely comes into play — but getting
    | it wrong here is how the contact form silently stops working locally.
    |
    | The allowlist comes from CORS_ORIGINS. A wildcard is deliberately not used:
    | these endpoints accept writes.
    |
    */

    'paths' => ['api/*', 'uploads/*'],

    'allowed_methods' => ['GET', 'POST', 'OPTIONS'],

    'allowed_origins' => config('avri.cors_origins'),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Accept', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 86400,

    /*
     * No cookies cross this boundary. The public API is anonymous, and the
     * admin panel is same-origin — so credentials would only widen what a
     * malicious page could do.
     */
    'supports_credentials' => false,

];
