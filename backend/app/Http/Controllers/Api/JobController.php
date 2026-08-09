<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Public job listings.
 *
 * Only `status = open` is ever returned, and a job whose `closes_at` has passed
 * is treated as gone — see `Job::scopeLive`. That matters beyond tidiness:
 * Google demotes sites that keep expired JobPosting markup live, so a closed
 * role must 404 rather than render, and must drop out of the sitemap at the
 * same moment.
 */
class JobController extends Controller
{
    /** The columns a visitor is allowed to see on the listing. */
    private const PUBLIC_COLUMNS = [
        'id', 'slug', 'title', 'department', 'location', 'employment_type',
        'experience_min', 'experience_max', 'openings', 'salary_range',
        'salary_min', 'salary_max', 'salary_period', 'summary',
        'published_at', 'closes_at', 'updated_at',
    ];

    public function index(): JsonResponse
    {
        $jobs = Job::live()
            ->select(self::PUBLIC_COLUMNS)
            ->orderByDesc('published_at')
            ->orderBy('title')
            ->get();

        return response()->json($jobs->map(fn (Job $job) => $this->shape($job)));
    }

    /**
     * Slugs and timestamps only, for the sitemap.
     *
     * Separate from the listing so an hourly sitemap fetch does not pull every
     * job description with it.
     */
    public function sitemap(): JsonResponse
    {
        $jobs = Job::live()->select(['slug', 'updated_at'])->get();

        return response()->json($jobs->map(fn (Job $job) => [
            'slug' => $job->slug,
            'updatedAt' => $job->toArray()['updated_at'],
        ]));
    }

    public function show(string $slug): JsonResponse
    {
        $job = Job::live()->where('slug', $slug)->first();

        if (! $job) {
            throw new NotFoundHttpException('That role is no longer open.');
        }

        return response()->json($this->shape($job) + [
            'description' => $job->description,
            'responsibilities' => $job->responsibilities,
            'requirements' => $job->requirements,
            'seoTitle' => $job->seo_title,
            'seoDescription' => $job->seo_description,
        ]);
    }

    /**
     * The website reads camelCase. The database is snake_case, and the mapping
     * is written out rather than inferred so the wire format cannot drift when
     * a column is renamed.
     *
     * @return array<string, mixed>
     */
    private function shape(Job $job): array
    {
        $row = $job->toArray();

        return [
            'id' => $job->id,
            'slug' => $job->slug,
            'title' => $job->title,
            'department' => $job->department,
            'location' => $job->location,
            'employmentType' => $job->employment_type,
            'experienceMin' => $job->experience_min,
            'experienceMax' => $job->experience_max,
            'openings' => $job->openings,
            'salaryRange' => $job->salary_range,
            'salaryMin' => $job->salary_min,
            'salaryMax' => $job->salary_max,
            'salaryPeriod' => $job->salary_period,
            'summary' => $job->summary,
            'publishedAt' => $row['published_at'] ?? null,
            'closesAt' => $row['closes_at'] ?? null,
            'updatedAt' => $row['updated_at'] ?? null,
        ];
    }
}
