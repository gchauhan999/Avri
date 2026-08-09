<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\PostCategory;
use Illuminate\Http\JsonResponse;

/**
 * Blog categories, with a count of live articles in each.
 *
 * The count is what lets the public filter rail hide a category that has
 * nothing in it yet, rather than offering a chip that leads to an empty page.
 */
class PostCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = PostCategory::query()
            ->withCount(['posts as post_count' => fn ($q) => $q->live()])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json($categories->map(fn (PostCategory $category) => [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'postCount' => (int) $category->post_count,
        ]));
    }

    /** Slugs that actually have something to show. */
    public function live(): JsonResponse
    {
        $slugs = PostCategory::query()
            ->whereHas('posts', fn ($q) => $q->live())
            ->orderBy('sort_order')
            ->pluck('slug');

        return response()->json($slugs);
    }
}
