<?php

namespace App\Models;

use App\Models\Concerns\SerialisesTimestampsAsSql;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A client company whose logo may appear on the website.
 *
 * `is_authorized` is not a styling toggle — it asserts that someone holds
 * written permission to display that company's trademark. Publishing without it
 * is refused by the admin panel, and refused again by a CHECK constraint in the
 * database, so it cannot happen even by direct SQL.
 */
class Client extends Model
{
    use HasFactory;
    use SerialisesTimestampsAsSql;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'is_authorized' => 'boolean',
            'is_published' => 'boolean',
            'authorized_at' => 'datetime',
            'sort_order' => 'integer',
            'logo_width' => 'integer',
            'logo_height' => 'integer',
        ];
    }

    /**
     * The rules that make the authorisation flag mean something.
     *
     * On the model rather than in the admin form, so they hold for anything
     * that writes a client — a Filament page, a seeder, a future import script.
     * The database CHECK constraint still backs the most important one; this
     * exists so the *other* consequences are automatic rather than remembered.
     */
    protected static function booted(): void
    {
        static::saving(function (self $client) {
            if (! $client->is_authorized) {
                /*
                 * Withdrawing permission takes the logo down with it. Leaving
                 * it live would be the worst possible outcome of un-ticking the
                 * box — and it is the outcome you get if this is left to
                 * whoever is editing.
                 */
                $client->is_published = false;
                $client->authorized_at = null;
                $client->authorized_by = null;

                return;
            }

            // Stamp who granted it and when, the moment it is granted.
            if ($client->isDirty('is_authorized')) {
                $client->authorized_at = now();
                $client->authorized_by = auth()->id();
            }
        });
    }

    /**
     * What the public list shows.
     *
     * Both conditions, and they mean different things: authorised is "we may",
     * published is "we choose to". The database enforces the same rule; asking
     * for both here is the belt to that pair of braces, because publishing a
     * company's trademark without permission is a legal problem rather than a
     * cosmetic one.
     */
    public function scopePubliclyVisible(Builder $query): Builder
    {
        return $query->where('is_published', true)->where('is_authorized', true);
    }

    public function authorizer(): BelongsTo
    {
        return $this->belongsTo(AdminUser::class, 'authorized_by');
    }
}
