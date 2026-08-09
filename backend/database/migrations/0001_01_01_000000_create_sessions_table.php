<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Sessions, for the admin panel's cookie login.
 *
 * The framework's `users` and `password_reset_tokens` tables are deliberately
 * absent. Admins live in `admin_users`, which predates this application and is
 * what the site's own migrations create — a second, empty `users` table would
 * only invite someone to authenticate against the wrong one.
 *
 * `user_id` here is not a foreign key, exactly as Laravel ships it, so it can
 * hold an `admin_users` id without a constraint pointing at the wrong table.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};
