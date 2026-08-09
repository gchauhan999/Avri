<?php

/**
 * Settings specific to this site, kept out of the framework's own config files
 * so that what belongs to Avri Energy and what belongs to Laravel stay
 * distinguishable.
 */
return [

    /*
     * Where the public Next.js site lives. Used for absolute links inside
     * notification emails — the recipient is a person, and a bare path is no
     * use in an inbox.
     */
    'site_url' => rtrim((string) env('PUBLIC_SITE_URL', 'http://localhost:3000'), '/'),

    /*
     * Browser origins allowed to call the public API. Anything else is refused;
     * see config/cors.php.
     */
    'cors_origins' => array_values(array_filter(array_map(
        fn (string $origin) => rtrim(trim($origin), '/'),
        explode(',', (string) env('CORS_ORIGINS', 'http://localhost:3000'))
    ))),

    /*
     * Publishing an article or a job pings the site so the page updates at
     * once instead of waiting for its own revalidation window. Never fatal: a
     * stale cache is not a reason to fail a save that already happened.
     */
    'revalidate' => [
        'url' => (string) env('REVALIDATE_URL', ''),
        'secret' => (string) env('REVALIDATE_SECRET', ''),
    ],

    'uploads' => [
        'max_resume_bytes' => (int) env('MAX_RESUME_BYTES', 5 * 1024 * 1024),
        'max_image_bytes' => (int) env('MAX_IMAGE_BYTES', 3 * 1024 * 1024),
        /*
         * Refuse new uploads before the volume fills. A full disk takes the
         * database down and the whole site with it, so turning applications
         * away first — and saying so — is the lesser failure.
         */
        'min_free_disk_bytes' => (int) env('MIN_FREE_DISK_BYTES', 2 * 1024 * 1024 * 1024),
    ],

    'mail' => [
        /* Who hears about a new application, and who about a new enquiry. */
        'hr_to' => (string) env('MAIL_HR_TO', ''),
        'sales_to' => (string) env('MAIL_SALES_TO', ''),
        'bcc' => (string) env('MAIL_BCC', ''),
        /* Send the applicant a "we have it" acknowledgement as well. */
        'ack_enabled' => (bool) env('MAIL_ACK_ENABLED', true),
    ],

];
