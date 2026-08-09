<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Blog categories. Small, hand-curated, populated by the seeder. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('slug', 140);
            $table->string('description', 300)->nullable();
            $table->smallInteger('sort_order')->default(0);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique('slug', 'uq_post_categories_slug');
            $table->unique('name', 'uq_post_categories_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_categories');
    }
};
