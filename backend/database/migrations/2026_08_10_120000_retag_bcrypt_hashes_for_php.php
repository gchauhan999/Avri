<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Retags inherited password hashes from `$2b$` to `$2y$`.
 *
 * The accounts in this table were created by the previous Node API, whose
 * bcryptjs writes a `$2b$` version tag. PHP's `password_get_info()` does not
 * recognise that tag and reports the algorithm as "unknown", so Laravel's
 * BcryptHasher refuses the hash outright — "This password does not use the
 * Bcrypt algorithm" — and nobody can sign in.
 *
 * The hashes themselves are perfectly good. `$2b$` and `$2y$` are the same
 * algorithm: both are fixes for the 8-bit character bug in `$2a$`, one from
 * OpenBSD and one from PHP, and they produce identical digests.
 * `password_verify()` accepts either; only `password_get_info()` is fussy about
 * the tag, and that is what Laravel checks first.
 *
 * So this rewrites four characters and nothing else. Verified before it was
 * written: a real bcryptjs hash matches its password under both tags, and a
 * wrong password is still rejected under both.
 *
 * Nothing new will land in `$2b$` form — PHP only ever writes `$2y$` — so this
 * is a one-time repair of inherited data rather than a rule to maintain.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('admin_users')
            ->where('password_hash', 'like', '$2b$%')
            ->update([
                'password_hash' => DB::raw("CONCAT('\$2y\$', SUBSTRING(password_hash, 5))"),
            ]);
    }

    public function down(): void
    {
        // Deliberately not reversible. Every `$2y$` hash here would have to be
        // assumed to have come from Node, and the ones PHP has written since
        // are indistinguishable — rewriting those would lock people out.
    }
};
