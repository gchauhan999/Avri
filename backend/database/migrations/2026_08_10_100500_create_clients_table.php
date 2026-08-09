<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Client companies whose logos appear on the website.
 *
 * Publishing a company's logo without written permission is a trademark
 * problem, so authorisation is modelled rather than assumed. The CHECK
 * constraint at the end is the part that matters: it makes publishing an
 * unauthorised client impossible even by direct SQL, not merely discouraged by
 * application code.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name', 180);
            $table->string('slug', 200);
            $table->string('logo_path', 400)->nullable();
            $table->unsignedSmallInteger('logo_width')->nullable();
            $table->unsignedSmallInteger('logo_height')->nullable();
            $table->string('website_url', 300)->nullable();
            $table->string('sector', 120)->nullable();
            $table->boolean('is_authorized')->default(false);
            // e.g. "logo use approved by email from R. Kumar, 2026-03-04".
            $table->string('authorization_note', 400)->nullable();
            $table->dateTime('authorized_at')->nullable();
            $table->unsignedBigInteger('authorized_by')->nullable();
            $table->boolean('is_published')->default(false);
            $table->smallInteger('sort_order')->default(0);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique('slug', 'uq_clients_slug');
            $table->index(['is_published', 'is_authorized', 'sort_order'], 'idx_clients_public');

            $table->foreign('authorized_by', 'fk_clients_authorized_by')
                ->references('id')->on('admin_users')
                ->nullOnDelete();
        });

        // Raw SQL because the schema builder cannot express a check comparing
        // two columns.
        DB::statement(
            'ALTER TABLE `clients` ADD CONSTRAINT `ck_clients_publish_requires_auth` '.
            'CHECK (`is_published` = 0 OR `is_authorized` = 1)'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
