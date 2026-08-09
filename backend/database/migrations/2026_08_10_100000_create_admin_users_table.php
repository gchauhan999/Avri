<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** Admin accounts. The panel authenticates against this, not `users`. */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('email', 255);
            // bcrypt. Never selected into any response payload.
            $table->string('password_hash', 255);
            $table->enum('role', ['super_admin', 'editor'])->default('editor');
            $table->boolean('is_active')->default(true);
            $table->boolean('must_change_password')->default(false);
            // Bumped on password change or forced sign-out, which gives instant
            // token revocation without a session table.
            $table->unsignedInteger('token_version')->default(0);
            $table->dateTime('last_login_at')->nullable();
            // Lockout survives an IP change, which per-IP rate limiting does not.
            $table->unsignedSmallInteger('failed_attempts')->default(0);
            $table->dateTime('locked_until')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->unique('email', 'uq_admin_users_email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_users');
    }
};
