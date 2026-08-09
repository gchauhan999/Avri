<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Signing in with a password set before the move to Laravel.
 *
 * The accounts in `admin_users` were created by the previous Node API, whose
 * bcryptjs writes a `$2b$` version tag. PHP's `password_get_info()` does not
 * recognise it, so Laravel's BcryptHasher throws "This password does not use
 * the Bcrypt algorithm" rather than simply returning false — the panel becomes
 * unusable for every existing admin.
 *
 * The hash below is genuine bcryptjs output, kept verbatim so this test keeps
 * exercising the real shape rather than one PHP produced.
 */
class InheritedPasswordTest extends TestCase
{
    use RefreshDatabase;

    /** bcryptjs, cost 12, of 'known-password'. */
    private const NODE_HASH = '$2b$12$C6NHGxzPhIhQ6KEEiSSW8OlfLWZQFSvcabVVsa8TqkgbdRKlYcEIu';

    private const PASSWORD = 'known-password';

    private function adminWithRawHash(string $hash): AdminUser
    {
        $admin = AdminUser::create([
            'name' => 'Inherited Admin',
            'email' => 'inherited@example.com',
            'password_hash' => 'placeholder-long-enough',
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        // Straight past the `hashed` cast, so the stored bytes are exactly what
        // the old system would have written.
        DB::table('admin_users')->where('id', $admin->id)->update(['password_hash' => $hash]);

        return $admin->fresh();
    }

    public function test_the_two_bcrypt_tags_describe_the_same_hash(): void
    {
        $retagged = '$2y$'.substr(self::NODE_HASH, 4);

        $this->assertTrue(password_verify(self::PASSWORD, self::NODE_HASH),
            'The original hash should verify.');
        $this->assertTrue(password_verify(self::PASSWORD, $retagged),
            'Retagging must not change what the hash matches.');
        $this->assertFalse(password_verify('the-wrong-one', $retagged),
            'And it must still reject a wrong password.');
    }

    public function test_laravel_rejects_the_node_tag_outright(): void
    {
        // Not a failed check — an exception. This is the bug the migration
        // exists for, pinned here so the reason stays visible.
        $this->expectException(\RuntimeException::class);
        $this->expectExceptionMessage('This password does not use the Bcrypt algorithm');

        Hash::check(self::PASSWORD, self::NODE_HASH);
    }

    public function test_an_inherited_account_can_sign_in_once_retagged(): void
    {
        $this->adminWithRawHash('$2y$'.substr(self::NODE_HASH, 4));

        $this->assertTrue(
            Auth::attempt(['email' => 'inherited@example.com', 'password' => self::PASSWORD]),
            'An admin whose password predates Laravel must still be able to sign in.'
        );
    }

    public function test_a_wrong_password_is_still_refused(): void
    {
        $this->adminWithRawHash('$2y$'.substr(self::NODE_HASH, 4));

        $this->assertFalse(
            Auth::attempt(['email' => 'inherited@example.com', 'password' => 'not-it'])
        );
    }

    public function test_the_migration_retags_what_it_finds(): void
    {
        $admin = $this->adminWithRawHash(self::NODE_HASH);

        // Parenthesised: `require` binds looser than `->`, so without them the
        // method call lands on the path string.
        (require database_path('migrations/2026_08_10_120000_retag_bcrypt_hashes_for_php.php'))
            ->up();

        $this->assertStringStartsWith('$2y$', $admin->fresh()->password_hash);
    }
}
