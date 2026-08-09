<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * What lives at which URL.
 *
 * This server hosts no public pages — the website is the Next.js app in
 * `client/`. Everything here is either the admin panel or the API it feeds.
 */
class RoutingTest extends TestCase
{
    public function test_the_root_sends_a_stray_visitor_to_the_panel(): void
    {
        $this->get('/')->assertRedirect('/admin');
    }

    public function test_the_api_is_reachable_without_signing_in(): void
    {
        $this->getJson('/api/health')->assertOk();
    }

    public function test_there_is_no_admin_api_left_to_call(): void
    {
        // The panel renders on this server and talks to the database directly.
        // The endpoints the old Express server exposed should be gone, not
        // merely protected — an authenticated 401 would mean they still exist.
        foreach (['/api/admin/jobs', '/api/admin/enquiries', '/api/admin/auth/me'] as $path) {
            $this->getJson($path)->assertNotFound();
        }
    }
}
