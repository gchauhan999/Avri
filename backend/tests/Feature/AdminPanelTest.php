<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Client;
use App\Models\PostCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The admin panel, and the rules it is there to enforce.
 *
 * Filament's pages are Livewire components, so they cannot be exercised with a
 * plain form post — these go through the framework instead, which is also the
 * only way to prove the authorisation rules hold rather than merely appearing
 * to in a form.
 */
class AdminPanelTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): AdminUser
    {
        return AdminUser::create([
            'name' => 'Test Admin',
            'email' => 'test-admin@example.com',
            'password_hash' => 'a-long-enough-password',
            'role' => 'super_admin',
            'is_active' => true,
        ]);
    }

    public function test_the_panel_requires_a_sign_in(): void
    {
        $this->get('/admin/clients')->assertRedirect('/admin/login');
    }

    public function test_the_login_page_renders(): void
    {
        $this->get('/admin/login')->assertOk();
    }

    public function test_every_section_of_the_panel_loads(): void
    {
        $this->actingAs($this->admin());

        foreach ([
            '/admin',
            '/admin/clients',
            '/admin/jobs',
            '/admin/applications',
            '/admin/posts',
            '/admin/post-categories',
            '/admin/enquiries',
            '/admin/admin-users',
        ] as $path) {
            $this->get($path)->assertOk("{$path} did not load");
        }
    }

    public function test_a_deactivated_admin_cannot_open_the_panel(): void
    {
        $admin = $this->admin();
        $admin->update(['is_active' => false]);

        $this->actingAs($admin)->get('/admin/clients')->assertForbidden();
    }

    /* --- the authorisation gate ----------------------------------------- */

    public function test_withdrawing_permission_also_unpublishes_the_client(): void
    {
        $this->actingAs($admin = $this->admin());

        $client = Client::create([
            'name' => 'Acme Power',
            'slug' => 'acme-power',
            'is_authorized' => true,
            'authorization_note' => 'Approved by email, 4 March 2026.',
            'is_published' => true,
        ]);

        $this->assertTrue($client->fresh()->is_published);

        $client->update(['is_authorized' => false]);

        $this->assertFalse($client->fresh()->is_published,
            'A client whose permission was withdrawn must not stay on the website.');
    }

    public function test_granting_permission_records_who_and_when(): void
    {
        $this->actingAs($admin = $this->admin());

        $client = Client::create(['name' => 'Beta Grid', 'slug' => 'beta-grid']);

        $this->assertNull($client->authorized_at);

        $client->update([
            'is_authorized' => true,
            'authorization_note' => 'Signed letter on file.',
        ]);

        $client->refresh();

        $this->assertNotNull($client->authorized_at);
        $this->assertSame($admin->id, $client->authorized_by);
    }

    public function test_the_database_refuses_to_publish_an_unauthorised_client(): void
    {
        // The model unpublishes first, so reach past it to prove the CHECK
        // constraint is really there and not just application politeness.
        $client = Client::create(['name' => 'Gamma Energy', 'slug' => 'gamma-energy']);

        $this->expectException(\Illuminate\Database\QueryException::class);

        \DB::statement(
            'UPDATE clients SET is_published = 1, is_authorized = 0 WHERE id = ?',
            [$client->id]
        );
    }

    /* --- the public API still answers ------------------------------------ */

    public function test_the_public_endpoints_respond(): void
    {
        PostCategory::create(['name' => 'Solar', 'slug' => 'solar', 'sort_order' => 0]);

        $this->getJson('/api/health')->assertOk()->assertJsonPath('db', 'up');
        $this->getJson('/api/jobs')->assertOk();
        $this->getJson('/api/clients')->assertOk();
        $this->getJson('/api/posts')->assertOk()->assertJsonStructure(['items', 'page', 'total']);
        $this->getJson('/api/post-categories')->assertOk()->assertJsonPath('0.slug', 'solar');
    }

    public function test_an_unauthorised_client_never_reaches_the_public_list(): void
    {
        Client::create([
            'name' => 'Hidden Co',
            'slug' => 'hidden-co',
            'is_authorized' => false,
            'is_published' => true,
        ]);

        $this->getJson('/api/clients')->assertOk()->assertJsonCount(0);
    }
}
