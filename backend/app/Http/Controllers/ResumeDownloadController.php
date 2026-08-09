<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * The only way to read a CV.
 *
 * Résumés live on a private disk with no symlink into the web root, so this is
 * the sole path to the bytes — and it is behind the panel's session.
 *
 * Three deliberate details:
 *
 *   - `Content-Disposition: attachment` plus `nosniff`, so a browser never
 *     renders the file inline and a crafted document cannot execute in the
 *     admin's session.
 *   - `no-store`, because this is personal data and should not sit in a proxy
 *     cache or a browser history entry.
 *   - the filename carries the applicant's name, sanitised, so a saved copy is
 *     still identifiable — but it is built from the name, never from the
 *     uploaded filename, which is attacker-controlled.
 */
class ResumeDownloadController extends Controller
{
    public function __invoke(Request $request, Application $application): StreamedResponse
    {
        $disk = Storage::disk('resumes');

        if (! $disk->exists($application->resume_path)) {
            throw new NotFoundHttpException('That file is no longer available.');
        }

        $extension = pathinfo($application->resume_original_name, PATHINFO_EXTENSION);
        $name = preg_replace('/[^A-Za-z0-9 _-]/', '', $application->full_name);
        $filename = trim((string) $name).' CV.'.strtolower($extension);

        return $disk->download($application->resume_path, $filename, [
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-store',
        ]);
    }
}
