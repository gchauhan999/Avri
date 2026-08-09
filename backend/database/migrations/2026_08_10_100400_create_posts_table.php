<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Blog articles. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title', 220);
            $table->string('slug', 240);
            $table->unsignedBigInteger('category_id');
            $table->string('excerpt', 400)->nullable();
            // HTML from the editor, sanitised on write so the stored value is
            // already safe wherever it is used.
            $table->mediumText('body');
            $table->string('cover_image_path', 400)->nullable();
            $table->string('cover_image_alt', 255)->nullable();
            // Stored so next/image never causes layout shift.
            $table->unsignedSmallInteger('cover_image_width')->nullable();
            $table->unsignedSmallInteger('cover_image_height')->nullable();
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->dateTime('published_at')->nullable();
            $table->unsignedTinyInteger('reading_minutes')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->string('seo_title', 200)->nullable();
            $table->string('seo_description', 320)->nullable();
            $table->string('seo_keywords', 400)->nullable();
            $table->string('canonical_url', 400)->nullable();
            $table->unsignedBigInteger('author_id')->nullable();
            // Kept so a byline survives the author's account being removed.
            $table->string('author_name_snapshot', 160)->nullable();
            $table->unsignedInteger('view_count')->default(0);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique('slug', 'uq_posts_slug');
            $table->index(['status', 'published_at'], 'idx_posts_status_published');
            $table->index(['category_id', 'status', 'published_at'], 'idx_posts_category_status');
            $table->index(['is_featured', 'published_at'], 'idx_posts_featured');

            // Restrict, not null: a post must always belong to a category, so
            // deleting one that still has posts should fail rather than orphan
            // them.
            $table->foreign('category_id', 'fk_posts_category')
                ->references('id')->on('post_categories')
                ->restrictOnDelete();

            $table->foreign('author_id', 'fk_posts_author')
                ->references('id')->on('admin_users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
