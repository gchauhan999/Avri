<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Job applications, and the résumé each one arrived with. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            // Null for a speculative application, or once the job is deleted.
            $table->unsignedBigInteger('job_id')->nullable();
            // Frozen at submission, so the record survives the job being renamed.
            $table->string('job_title_snapshot', 200);

            $table->string('full_name', 160);
            $table->string('email', 255);
            $table->string('phone', 20);
            // Last 10 digits, for search and duplicate detection.
            $table->char('phone_normalised', 10);
            $table->string('current_location', 160)->nullable();
            $table->decimal('experience_years', 4, 1)->nullable();
            $table->string('current_company', 160)->nullable();
            $table->string('notice_period', 60)->nullable();
            $table->string('linkedin_url', 300)->nullable();
            $table->text('cover_letter')->nullable();

            // Path relative to the storage root. The file is never on a public
            // disk — it is reachable only through an authenticated download.
            $table->string('resume_path', 400);
            // The applicant's own filename, sanitised, for Content-Disposition.
            $table->string('resume_original_name', 255);
            $table->string('resume_mime', 120);
            $table->unsignedInteger('resume_size_bytes');
            // Lets us spot the same CV submitted twice for one role.
            $table->char('resume_sha256', 64);

            $table->enum('status', ['new', 'shortlisted', 'interviewing', 'rejected', 'hired'])
                ->default('new');
            $table->text('admin_notes')->nullable();

            // Mail is sent after the row is written and never blocks the
            // response, so delivery is tracked here. A failed row is retried and
            // badged in the dashboard rather than lost.
            $table->enum('email_status', ['pending', 'sent', 'failed', 'skipped'])
                ->default('pending');
            $table->string('email_error', 500)->nullable();
            $table->unsignedTinyInteger('email_attempts')->default(0);

            // INET6_ATON form, so IPv4 and IPv6 both fit in one column.
            $table->binary('source_ip', 16)->nullable();
            $table->string('user_agent', 400)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index(['job_id', 'created_at'], 'idx_applications_job_created');
            $table->index(['status', 'created_at'], 'idx_applications_status');
            $table->index('email', 'idx_applications_email');
            // Not unique: job_id is nullable and MySQL treats each NULL as
            // distinct, so a unique key would never cover speculative
            // applications. The duplicate check happens in the controller.
            $table->index(['job_id', 'resume_sha256'], 'idx_applications_dedupe');
            $table->index('email_status', 'idx_applications_mail');

            $table->foreign('job_id', 'fk_applications_job')
                ->references('id')->on('jobs')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
