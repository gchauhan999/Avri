<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Support\Uploads;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * The public blog.
 *
 * Only published articles, and only ones whose publish date has arrived —
 * scheduling a post for next Tuesday must not make it visible today. See
 * `Post::scopeLive`.
 */
class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['sometimes', 'string', 'max:140'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'limit' => ['sometimes', 'integer', 'min:1', 'max:24'],
        ]);

        $page = (int) ($validated['page'] ?? 1);
        $limit = (int) ($validated['limit'] ?? 9);
        $category = $validated['category'] ?? null;

        $query = Post::live()->with('category:id,name,slug');

        if ($category) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        $total = (clone $query)->count();

        $items = $query->orderByDesc('published_at')
            ->forPage($page, $limit)
            ->get();

        /*
         * The featured banner is only fetched for an unfiltered first page. A
         * banner above a category listing would otherwise show an article that
         * is not in the list beneath it.
         */
        $featured = null;
        if ($page === 1 && ! $category) {
            $row = Post::live()->with('category:id,name,slug')
                ->where('is_featured', true)
                ->orderByDesc('published_at')
                ->first();
            $featured = $row ? $this->card($row) : null;
        }

        return response()->json([
            'items' => $items->map(fn (Post $post) => $this->card($post)),
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pageCount' => max(1, (int) ceil($total / $limit)),
            'featured' => $featured,
        ]);
    }

    /** Slugs and timestamps for the sitemap. */
    public function sitemap(): JsonResponse
    {
        $posts = Post::live()->select(['slug', 'updated_at'])->get();

        return response()->json($posts->map(fn (Post $post) => [
            'slug' => $post->slug,
            'updatedAt' => $post->toArray()['updated_at'],
        ]));
    }

    public function show(string $slug): JsonResponse
    {
        $post = Post::live()->with('category:id,name,slug')->where('slug', $slug)->first();

        if (! $post) {
            throw new NotFoundHttpException('That article is not available.');
        }

        // Same category first; the query is cheap and keeps readers moving.
        $related = Post::live()->with('category:id,name,slug')
            ->where('category_id', $post->category_id)
            ->whereKeyNot($post->id)
            ->orderByDesc('published_at')
            ->limit(3)
            ->get();

        return response()->json($this->card($post) + [
            'body' => $post->body,
            'updatedAt' => $post->toArray()['updated_at'],
            'seoTitle' => $post->seo_title,
            'seoDescription' => $post->seo_description,
            'seoKeywords' => $post->seo_keywords,
            'canonicalUrl' => $post->canonical_url,
            'related' => $related->map(fn (Post $row) => $this->card($row)),
        ]);
    }

    /**
     * One card as the website expects it: camelCase, and a cover URL rather
     * than the internal storage path.
     *
     * @return array<string, mixed>
     */
    private function card(Post $post): array
    {
        $row = $post->toArray();

        return [
            'id' => $post->id,
            'slug' => $post->slug,
            'title' => $post->title,
            'excerpt' => $post->excerpt,
            'cover' => Uploads::url($post->cover_image_path),
            'coverAlt' => $post->cover_image_alt,
            'coverImageAlt' => $post->cover_image_alt,
            'coverImageWidth' => $post->cover_image_width,
            'coverImageHeight' => $post->cover_image_height,
            'publishedAt' => $row['published_at'] ?? null,
            'readingMinutes' => $post->reading_minutes,
            'isFeatured' => $post->is_featured,
            'authorName' => $post->author_name_snapshot,
            'categoryName' => $post->category?->name,
            'categorySlug' => $post->category?->slug,
        ];
    }
}
