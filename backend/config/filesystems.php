<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default filesystem disk that should be used
    | by the framework. The "local" disk, as well as a variety of cloud
    | based disks are available to your application for file storage.
    |
    */

    'default' => env('FILESYSTEM_DISK', 'local'),

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disks
    |--------------------------------------------------------------------------
    |
    | Below you may configure as many filesystem disks as necessary, and you
    | may even configure multiple disks for the same driver. Examples for
    | most supported storage drivers are configured here for reference.
    |
    | Supported drivers: "local", "ftp", "sftp", "s3"
    |
    */

    'disks' => [

        'local' => [
            'driver' => 'local',
            'root' => storage_path('app/private'),
            'serve' => true,
            'throw' => false,
            'report' => false,
        ],

        'public' => [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => rtrim(env('APP_URL', 'http://localhost'), '/').'/storage',
            'visibility' => 'public',
            'throw' => false,
            'report' => false,
        ],

        /*
         * Client logos and article covers.
         *
         * Under `storage/` rather than in `public/` so a redeploy or a fresh
         * clone cannot orphan every uploaded image, and symlinked to
         * `public/uploads` by `storage:link` so the web server still serves the
         * bytes without PHP in the path. The website proxies `/uploads/*` here,
         * which is why the API hands out `/uploads/…` paths rather than
         * absolute URLs — see app/Support/Uploads.php.
         */
        'uploads' => [
            'driver' => 'local',
            'root' => storage_path('app/uploads'),
            'url' => '/uploads',
            'visibility' => 'public',
            'throw' => false,
        ],

        /*
         * Résumés. Deliberately not symlinked anywhere.
         *
         * These are personal data. The only way to read one is the
         * authenticated download in the admin panel, so there must be no path
         * from the web root to this directory at all.
         */
        'resumes' => [
            'driver' => 'local',
            'root' => storage_path('app/resumes'),
            'visibility' => 'private',
            'throw' => false,
        ],

        's3' => [
            'driver' => 's3',
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_DEFAULT_REGION'),
            'bucket' => env('AWS_BUCKET'),
            'url' => env('AWS_URL'),
            'endpoint' => env('AWS_ENDPOINT'),
            'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
            'throw' => false,
            'report' => false,
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Symbolic Links
    |--------------------------------------------------------------------------
    |
    | Here you may configure the symbolic links that will be created when the
    | `storage:link` Artisan command is executed. The array keys should be
    | the locations of the links and the values should be their targets.
    |
    */

    'links' => [
        public_path('storage') => storage_path('app/public'),
        // Keeps uploaded images on a URL the website already proxies, while the
        // files themselves stay outside the deployed code.
        public_path('uploads') => storage_path('app/uploads'),
    ],

];
