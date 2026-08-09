<?php

use App\Http\Controllers\ResumeDownloadController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web routes
|--------------------------------------------------------------------------
|
| There is no public website here — that is the Next.js app in `client/`. This
| server hosts the admin panel, which Filament routes itself under `/admin`,
| and the handful of authenticated routes below that Filament cannot express.
|
*/

// Nothing lives at the root; send a stray visitor to the panel.
Route::redirect('/', '/admin');

/*
 * Downloading a CV.
 *
 * Not a Filament action URL because the browser must navigate to it for the
 * file to be saved, and the response streams from a private disk. Behind the
 * panel's own auth guard.
 */
Route::middleware(['auth'])
    ->get('/admin/applications/{application}/resume', ResumeDownloadController::class)
    ->name('applications.resume');
