<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Drops the storage prefixes the previous server baked into stored paths.
 *
 * That server kept one storage root with `public/` and `resumes/` beneath it,
 * so a row held `public/clients/x.webp`. Here the two are separate disks —
 * `uploads` and `resumes` — and a path is relative to its own disk, so those
 * prefixes are now wrong: `Storage::disk('resumes')->get('resumes/…')` looks
 * for `resumes/resumes/…`.
 *
 * Rewriting the data rather than teaching the code to strip a prefix on every
 * read: the prefix is an artefact of a layout that no longer exists, and
 * carrying it forever would mean every future path had to pretend to have it
 * too.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("UPDATE clients SET logo_path = SUBSTRING(logo_path, 8) WHERE logo_path LIKE 'public/%'");
        DB::statement("UPDATE posts SET cover_image_path = SUBSTRING(cover_image_path, 8) WHERE cover_image_path LIKE 'public/%'");
        DB::statement("UPDATE applications SET resume_path = SUBSTRING(resume_path, 9) WHERE resume_path LIKE 'resumes/%'");
    }

    public function down(): void
    {
        DB::statement("UPDATE clients SET logo_path = CONCAT('public/', logo_path) WHERE logo_path IS NOT NULL AND logo_path NOT LIKE 'public/%'");
        DB::statement("UPDATE posts SET cover_image_path = CONCAT('public/', cover_image_path) WHERE cover_image_path IS NOT NULL AND cover_image_path NOT LIKE 'public/%'");
        DB::statement("UPDATE applications SET resume_path = CONCAT('resumes/', resume_path) WHERE resume_path NOT LIKE 'resumes/%'");
    }
};
