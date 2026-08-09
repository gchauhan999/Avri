<?php

namespace Tests\Feature;

use App\Models\AdminUser;
use App\Models\Job;
use App\Models\Post;
use App\Models\PostCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * The rules that live on the models rather than in a form.
 *
 * They are there so they hold for anything that writes — the panel, a seeder, a
 * future import — and these prove that, by writing through the model directly
 * rather than through a page.
 */
class ContentRulesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Saving an article pings the website to refresh its cache. Nothing
        // should reach the network during a test.
        Http::fake();
    }

    private function category(): PostCategory
    {
        return PostCategory::create(['name' => 'Solar', 'slug' => 'solar']);
    }

    private function article(array $attributes = []): Post
    {
        return Post::create(array_merge([
            'title' => 'A first article',
            'category_id' => $this->category()->id,
            'body' => '<p>Something worth reading.</p>',
        ], $attributes));
    }

    public function test_article_html_is_sanitised_on_write(): void
    {
        $post = $this->article([
            'body' => '<p>Real text.</p><script>alert(1)</script><p onclick="steal()">More.</p>',
        ]);

        $this->assertStringNotContainsString('<script', $post->body);
        $this->assertStringNotContainsString('onclick', $post->body);
        $this->assertStringContainsString('Real text.', $post->body);
    }

    public function test_a_javascript_link_does_not_survive(): void
    {
        $post = $this->article(['body' => '<p><a href="javascript:alert(1)">click</a></p>']);

        $this->assertStringNotContainsString('javascript:', $post->body);
    }

    public function test_an_excerpt_and_reading_time_are_derived_when_absent(): void
    {
        $post = $this->article(['body' => '<p>'.str_repeat('word ', 400).'</p>']);

        $this->assertNotEmpty($post->excerpt);
        $this->assertStringNotContainsString('<p>', $post->excerpt);
        // 400 words at ~200 a minute.
        $this->assertSame(2, $post->reading_minutes);
    }

    public function test_a_supplied_excerpt_is_left_alone(): void
    {
        $post = $this->article(['excerpt' => 'My own summary.']);

        $this->assertSame('My own summary.', $post->excerpt);
    }

    public function test_only_one_article_can_be_featured(): void
    {
        $category = $this->category();

        $first = Post::create([
            'title' => 'First', 'category_id' => $category->id,
            'body' => '<p>One.</p>', 'is_featured' => true,
        ]);
        $second = Post::create([
            'title' => 'Second', 'category_id' => $category->id,
            'body' => '<p>Two.</p>', 'is_featured' => true,
        ]);

        $this->assertFalse($first->fresh()->is_featured,
            'Featuring a second article must clear the first.');
        $this->assertTrue($second->fresh()->is_featured);
    }

    public function test_the_publish_date_is_stamped_once_and_not_moved(): void
    {
        $post = $this->article(['status' => 'published']);
        $stamped = $post->fresh()->published_at;

        $this->assertNotNull($stamped);

        $post->update(['status' => 'draft']);
        $post->update(['status' => 'published']);

        $this->assertEquals($stamped, $post->fresh()->published_at,
            'Re-publishing must not make an old article look new.');
    }

    public function test_a_scheduled_article_is_not_live_yet(): void
    {
        $this->article(['status' => 'published', 'published_at' => now()->addWeek()]);

        $this->assertSame(0, Post::live()->count());
    }

    public function test_slugs_do_not_collide(): void
    {
        $category = $this->category();

        $a = Post::create(['title' => 'Same name', 'category_id' => $category->id, 'body' => '<p>a</p>']);
        $b = Post::create(['title' => 'Same name', 'category_id' => $category->id, 'body' => '<p>b</p>']);

        $this->assertSame('same-name', $a->slug);
        $this->assertSame('same-name-2', $b->slug);
    }

    /* --- jobs ------------------------------------------------------------ */

    public function test_a_closed_job_drops_out_of_the_live_list(): void
    {
        Job::create([
            'title' => 'Site Engineer', 'location' => 'Ghaziabad',
            'summary' => 'A role.', 'description' => 'Details.',
            'status' => 'open', 'closes_at' => now()->subDay(),
        ]);

        $this->assertSame(0, Job::live()->count(),
            'A role past its closing date must not stay on the site — Google penalises it.');
    }

    public function test_a_job_is_stamped_when_it_first_opens(): void
    {
        $job = Job::create([
            'title' => 'Draft Role', 'location' => 'Noida',
            'summary' => 'A role.', 'description' => 'Details.',
            'status' => 'draft',
        ]);

        $this->assertNull($job->published_at);

        $job->update(['status' => 'open']);

        $this->assertNotNull($job->fresh()->published_at);
    }
}
