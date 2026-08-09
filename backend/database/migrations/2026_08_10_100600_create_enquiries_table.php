<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Inbound messages from both website forms.
 *
 * Contact and quote requests share enough columns that two tables would mean
 * two dashboards and two exports; the unused columns are simply null for the
 * other kind.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enquiries', function (Blueprint $table) {
            $table->id();
            $table->enum('kind', ['enquiry', 'quote_request']);

            $table->string('name', 160);
            $table->string('phone', 20);
            $table->char('phone_normalised', 10);
            // Optional on the contact form, required on the quote form.
            $table->string('email', 255)->nullable();
            $table->string('company', 180)->nullable();

            // Contact form only.
            $table->string('subject', 200)->nullable();

            // Quote form only.
            $table->string('service', 160)->nullable();
            $table->string('industry', 160)->nullable();
            $table->string('product', 200)->nullable();
            $table->string('location', 200)->nullable();
            $table->string('capacity', 120)->nullable();
            $table->string('budget', 120)->nullable();
            $table->string('timeline', 120)->nullable();

            $table->text('message');

            $table->enum('status', ['new', 'contacted', 'quoted', 'won', 'lost', 'spam'])
                ->default('new');
            $table->text('admin_notes')->nullable();

            $table->enum('email_status', ['pending', 'sent', 'failed', 'skipped'])
                ->default('pending');
            $table->string('email_error', 500)->nullable();
            $table->unsignedTinyInteger('email_attempts')->default(0);

            // Which page the form was submitted from. Useful for attribution.
            $table->string('source_page', 300)->nullable();
            $table->binary('source_ip', 16)->nullable();
            $table->string('user_agent', 400)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->index(['kind', 'created_at'], 'idx_enquiries_kind_created');
            $table->index(['status', 'created_at'], 'idx_enquiries_status');
            $table->index('phone_normalised', 'idx_enquiries_phone');
            $table->index('email_status', 'idx_enquiries_mail');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enquiries');
    }
};
