<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Job openings.
 *
 * The table is `jobs`. Laravel's queue table, which normally takes that name,
 * is `queue_jobs` here — see `0001_01_01_000002_create_queue_tables.php`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->string('slug', 220);
            $table->string('department', 120)->nullable();
            $table->string('location', 160);
            $table->enum('employment_type', ['full_time', 'part_time', 'contract', 'internship'])
                ->default('full_time');
            $table->unsignedTinyInteger('experience_min')->nullable();
            $table->unsignedTinyInteger('experience_max')->nullable();
            $table->unsignedSmallInteger('openings')->default(1);
            // Free text for the card, e.g. "₹4–6 LPA". The structured trio below
            // is what feeds the JobPosting markup.
            $table->string('salary_range', 120)->nullable();
            $table->unsignedInteger('salary_min')->nullable();
            $table->unsignedInteger('salary_max')->nullable();
            $table->enum('salary_period', ['month', 'year'])->nullable()->default('month');
            // One line for the card, and the meta description.
            $table->string('summary', 500);
            $table->mediumText('description');
            // string[] — rendered as bullet lists and as the JobPosting description.
            $table->json('responsibilities')->nullable();
            $table->json('requirements')->nullable();
            $table->enum('status', ['draft', 'open', 'closed'])->default('draft');
            $table->dateTime('published_at')->nullable();
            // Google demotes sites that keep expired JobPosting markup live, so
            // this feeds `validThrough` and the public route 404s once it passes.
            $table->date('closes_at')->nullable();
            $table->string('seo_title', 200)->nullable();
            $table->string('seo_description', 320)->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique('slug', 'uq_jobs_slug');
            $table->index(['status', 'published_at'], 'idx_jobs_status_published');
            $table->index('department', 'idx_jobs_department');

            $table->foreign('created_by', 'fk_jobs_created_by')
                ->references('id')->on('admin_users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jobs');
    }
};
