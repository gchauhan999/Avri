<?php

namespace App\Models;

use App\Models\Concerns\SerialisesTimestampsAsSql;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * A job application, and the résumé it arrived with.
 *
 * `job_title_snapshot` is frozen at submission so the record survives the job
 * being renamed or deleted — the foreign key is ON DELETE SET NULL precisely so
 * that deleting a closed role does not erase who applied for it.
 */
class Application extends Model
{
    use HasFactory;
    use SerialisesTimestampsAsSql;

    public const STATUSES = ['new', 'shortlisted', 'interviewing', 'rejected', 'hired'];
    public const EMAIL_STATUSES = ['pending', 'sent', 'failed', 'skipped'];

    protected $guarded = ['id'];

    /**
     * `source_ip` is stored for abuse investigation and is never part of a
     * payload. It is raw INET6_ATON bytes, which would not survive JSON anyway.
     */
    protected $hidden = ['source_ip'];

    protected function casts(): array
    {
        return [
            'resume_size_bytes' => 'integer',
            'email_attempts' => 'integer',
            // DECIMAL(4,1). Cast, not float: money-adjacent and comparison
            // values should not go through binary floating point.
            'experience_years' => 'decimal:1',
        ];
    }

    protected static function booted(): void
    {
        static::deleted(function (self $application) {
            /*
             * The CV goes with the record. Keeping someone's personal data
             * after the application it belonged to has been deleted is both
             * pointless and a retention problem — and an orphaned file is
             * invisible, so nobody would ever come back and clear it.
             */
            Storage::disk('resumes')->delete($application->resume_path);
        });
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }
}
