<?php

use App\Http\Controllers\Api\ApplicationController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\EnquiryController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\PostCategoryController;
use App\Http\Controllers\Api\PostController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| The public API
|--------------------------------------------------------------------------
|
| Everything the website reads or posts. There is no admin API: the panel is
| Filament, which renders on this server and talks to the database directly, so
| the admin surface that the previous Express server exposed does not exist any
| more and cannot be reached from a browser at all.
|
| Rate limits are per IP. The write routes are much tighter than the reads —
| `applications` most of all, because it is the only public route that writes a
| file to disk and so the only one that can fill a volume.
|
*/

Route::get('/health', HealthController::class);

Route::middleware('throttle:public-read')->group(function () {
    Route::get('/jobs', [JobController::class, 'index']);
    // Declared before the slug route so the literal path is not swallowed.
    Route::get('/jobs/index', [JobController::class, 'sitemap']);
    Route::get('/jobs/{slug}', [JobController::class, 'show']);

    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/index', [PostController::class, 'sitemap']);
    Route::get('/posts/{slug}', [PostController::class, 'show']);

    Route::get('/post-categories', [PostCategoryController::class, 'index']);
    Route::get('/post-categories/live', [PostCategoryController::class, 'live']);

    Route::get('/clients', [ClientController::class, 'index']);
});

Route::middleware('throttle:enquiry-write')->group(function () {
    Route::post('/enquiries', [EnquiryController::class, 'store']);
    /*
     * The quote form. Same handler with the stricter branch pinned on: without
     * a separate route a caller could post quote fields with `kind: enquiry`
     * and skip the extra required-field checks.
     */
    Route::post('/enquiries/quote', [EnquiryController::class, 'storeQuote']);
});

Route::middleware('throttle:application-write')
    ->post('/applications', [ApplicationController::class, 'store']);
