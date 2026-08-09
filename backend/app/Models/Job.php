<?php

namespace App\Models;

use App\Models\Concerns\SerialisesTimestampsAsSql;
use App\Services\SiteRevalidator;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

/**
 * A job opening.
 *
 * The table is `jobs`; Laravel's queue uses `queue_jobs` so the two do not
 * collide.
 */
class Job extends Model
{
    use HasFactory;
    use SerialisesTimestampsAsSql;

    public const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'internship'];
    public const STATUSES = ['draft', 'open', 'closed'];
    public const SALARY_PERIODS = ['month', 'year'];

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'responsibilities' => 'array',
            'requirements' => 'array',
            'experience_min' => 'integer',
            'experience_max' => 'integer',
            'openings' => 'integer',
            'salary_min' => 'integer',
            'salary_max' => 'integer',
            'published_at' => 'datetime',
            'closes_at' => 'date:Y-m-d',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (self $job) {
            if (blank($job->slug)) {
                $job->slug = static::uniqueSlug((string) $job->title, $job->id);
            }

            /*
             * Stamped the first time it opens, and used as JobPosting's
             * datePosted. Reopening a role later must not reset it.
             */
            if ($job->status === 'open' && blank($job->published_at)) {
                $job->published_at = now();
            }
        });

        $refresh = fn (self $job) => app(SiteRevalidator::class)
            ->ping(['jobs'], ['/careers', "/careers/{$job->slug}"]);

        static::saved($refresh);
        static::deleted($refresh);
    }

    /** Appends -2, -3 … until the slug is free. */
    public static function uniqueSlug(string $from, ?int $exceptId = null): string
    {
        $root = Str::slug($from) ?: 'role';
        $slug = $root;

        for ($n = 2; static::where('slug', $slug)->whereKeyNot($exceptId ?? 0)->exists(); $n++) {
            $slug = "{$root}-{$n}";
        }

        return $slug;
    }

    /**
     * Open, and either with no closing date or one that has not passed.
     *
     * Google demotes sites that keep expired JobPosting markup live, so a
     * closed role must disappear from the site the moment it closes — not when
     * somebody remembers to unpublish it.
     */
    public function scopeLive(Builder $query): Builder
    {
        return $query->where('status', 'open')
            ->where(function (Builder $q) {
                $q->whereNull('closes_at')->orWhere('closes_at', '>=', DB::raw('CURDATE()'));
            });
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'created_by');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }
}
