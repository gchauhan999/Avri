<?php

namespace App\Models;

use App\Models\Concerns\SerialisesTimestampsAsSql;
use App\Services\ArticleSanitiser;
use App\Services\SiteRevalidator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * A blog article.
 *
 * `body` is HTML from the editor, sanitised on write rather than on render, so
 * the stored value is already safe everywhere it is used.
 */
class Post extends Model
{
    use HasFactory;
    use SerialisesTimestampsAsSql;

    public const STATUSES = ['draft', 'published', 'archived'];

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
            'reading_minutes' => 'integer',
            'view_count' => 'integer',
            'cover_image_width' => 'integer',
            'cover_image_height' => 'integer',
        ];
    }

    /**
     * Everything that must be true of a saved article, wherever it was saved
     * from.
     *
     * On the model rather than in the admin form: the sanitising in particular
     * is a security control, and a control that only runs when one particular
     * page is used is not a control at all.
     */
    protected static function booted(): void
    {
        static::saving(function (self $post) {
            $sanitiser = app(ArticleSanitiser::class);

            if ($post->isDirty('body')) {
                // Sanitise on write, not on render: the stored value is then
                // safe everywhere, and the cost is paid once per save rather
                // than on every page view.
                $post->body = $sanitiser->clean((string) $post->body);
                $post->reading_minutes = $sanitiser->readingMinutes($post->body);

                if (blank($post->excerpt)) {
                    $post->excerpt = $sanitiser->excerpt($post->body);
                }
            }

            if (blank($post->slug)) {
                $post->slug = static::uniqueSlug((string) $post->title, $post->id);
            }

            /*
             * Stamp the first publish only. Re-publishing later must not move
             * the date and make an old article look new.
             */
            if ($post->status === 'published' && blank($post->published_at)) {
                $post->published_at = now();
            }
        });

        static::saved(function (self $post) {
            /*
             * Only one article is featured at a time — the public index renders
             * a single banner, so a second one would silently never appear.
             */
            if ($post->is_featured) {
                static::where('is_featured', true)->whereKeyNot($post->id)
                    ->update(['is_featured' => false]);
            }

            app(SiteRevalidator::class)->ping(['posts'], ['/blog', "/blog/{$post->slug}"]);
        });

        static::deleted(function (self $post) {
            app(SiteRevalidator::class)->ping(['posts'], ['/blog', "/blog/{$post->slug}"]);
        });
    }

    /** Appends -2, -3 … until the slug is free. */
    public static function uniqueSlug(string $from, ?int $exceptId = null): string
    {
        $root = Str::slug($from) ?: 'article';
        $slug = $root;

        for ($n = 2; static::where('slug', $slug)->whereKeyNot($exceptId ?? 0)->exists(); $n++) {
            $slug = "{$root}-{$n}";
        }

        return $slug;
    }

    /**
     * Published, and past its embargo.
     *
     * Scheduling an article for next Tuesday must not make it visible today,
     * which is why the date is checked and not just the status.
     */
    public function scopeLive(Builder $query): Builder
    {
        return $query->where('status', 'published')
            ->where(function (Builder $q) {
                $q->whereNull('published_at')->orWhere('published_at', '<=', now());
            });
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(PostCategory::class, 'category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'author_id');
    }
}
