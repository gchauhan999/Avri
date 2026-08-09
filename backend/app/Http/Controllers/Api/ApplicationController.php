<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreApplicationRequest;
use App\Jobs\SendApplicationNotification;
use App\Models\Application;
use App\Models\Job;
use App\Services\ResumeVerifier;
use App\Support\Submissions;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\ServiceUnavailableHttpException;
use Symfony\Component\HttpKernel\Exception\UnsupportedMediaTypeHttpException;

/**
 * Job applications — the only public route that writes a file to disk.
 *
 * That makes it the most exposed thing here, so the order of operations
 * matters: the file is checked before it is kept, and the row is written before
 * anything is sent. Laravel holds the upload in a temporary location until it
 * is moved, so a rejected file is never stored at all — nothing to orphan and
 * nothing to sweep up.
 */
class ApplicationController extends Controller
{
    private const SUCCESS = 'Your application has reached us. If your profile fits the role, our HR team will call you within a week.';

    public function store(StoreApplicationRequest $request, ResumeVerifier $verifier): JsonResponse
    {
        /*
         * Honeypot. Answer with the normal success and write nothing — a bot
         * that gets an error just retries without the field.
         */
        if (filled($request->input('company_website'))) {
            Log::debug('honeypot triggered on application', ['ip' => $request->ip()]);

            return response()->json(['message' => self::SUCCESS], 201);
        }

        $this->assertDiskHasRoom();

        $file = $request->file('resume');

        /*
         * The check the framework cannot do: read the real leading bytes. An
         * .exe renamed to .pdf and sent with a PDF content type passes
         * everything before this.
         */
        $check = $verifier->verify($file);

        if (! $check['ok']) {
            Log::warning('résumé failed magic-number check', [
                'ip' => $request->ip(),
                'originalName' => $file->getClientOriginalName(),
                'mime' => $file->getClientMimeType(),
            ]);

            throw new UnsupportedMediaTypeHttpException(
                'That file is not a readable PDF or Word document. Please attach your CV again.'
            );
        }

        // Resolve the job, if this is an application to a specific opening.
        $jobId = null;
        $jobTitle = $request->input('position') ?: 'General application';

        if (filled($request->input('jobSlug'))) {
            $job = Job::where('slug', $request->input('jobSlug'))->where('status', 'open')->first();

            if ($job) {
                $jobId = $job->id;
                // Trust the database over the posted title.
                $jobTitle = $job->title;
            }
        }

        /*
         * Same CV, same role, already on file. Not a unique index: `job_id` is
         * nullable and MySQL treats each NULL as distinct, so a constraint
         * would never cover speculative applications.
         */
        if ($jobId !== null && Application::where('job_id', $jobId)
            ->where('resume_sha256', $check['sha256'])->exists()) {
            throw new ConflictHttpException(
                'You have already applied for this role with this CV. We have your application.'
            );
        }

        // Foldered by month so one directory does not grow without bound, and
        // named by UUID so the applicant's filename never becomes a path.
        $storedPath = $file->storeAs(
            now()->format('Y/m'),
            Str::uuid().'.'.strtolower($file->getClientOriginalExtension()),
            'resumes'
        );

        $application = Application::create([
            'job_id' => $jobId,
            'job_title_snapshot' => $jobTitle,
            'full_name' => $request->string('name')->trim()->value(),
            'email' => $request->string('email')->trim()->value(),
            'phone' => $request->string('phone')->trim()->value(),
            'phone_normalised' => Submissions::normalisePhone($request->string('phone')->value()),
            'current_location' => $request->input('currentLocation') ?: null,
            'experience_years' => $this->experienceToNumber((string) $request->input('experience', '')),
            'current_company' => $request->input('currentCompany') ?: null,
            'notice_period' => $request->input('noticePeriod') ?: null,
            'linkedin_url' => $request->input('linkedin') ?: null,
            'cover_letter' => $request->input('message') ?: null,
            'resume_path' => $storedPath,
            // Stored, but never used as a path — only in Content-Disposition.
            'resume_original_name' => mb_substr($file->getClientOriginalName(), 0, 255),
            'resume_mime' => $file->getClientMimeType(),
            'resume_size_bytes' => $check['size'],
            'resume_sha256' => $check['sha256'],
            'source_ip' => Submissions::clientIp($request),
            'user_agent' => Submissions::userAgent($request),
        ]);

        SendApplicationNotification::dispatch($application->id);

        return response()->json(['id' => $application->id, 'message' => self::SUCCESS], 201);
    }

    /**
     * Refuse new uploads before the volume fills.
     *
     * A full disk takes the database down and the whole site with it, so it is
     * worth turning applications away first — and saying where to send the CV
     * instead, rather than failing opaquely.
     */
    private function assertDiskHasRoom(): void
    {
        $free = @disk_free_space(storage_path('app'));
        $minimum = (int) config('avri.uploads.min_free_disk_bytes');

        if ($free !== false && $free < $minimum) {
            Log::error('storage nearly full — refusing applications', ['free' => $free]);

            $address = config('avri.mail.hr_to') ?: 'us';

            throw new ServiceUnavailableHttpException(null,
                "We cannot accept applications at the moment. Please email your CV to {$address} instead."
            );
        }
    }

    /** "3–5 years" / "Fresher" → a number the database can filter on. */
    private function experienceToNumber(string $value): ?string
    {
        if (trim($value) === '') {
            return null;
        }
        if (preg_match('/fresher/i', $value)) {
            return '0.0';
        }

        return preg_match('/(\d+(?:\.\d+)?)/', $value, $m) ? $m[1] : null;
    }
}
