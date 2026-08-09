<?php

namespace App\Models;

use App\Models\Concerns\SerialisesTimestampsAsSql;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A blog category. Small, hand-curated, seeded rather than user-created. */
class PostCategory extends Model
{
    use HasFactory;
    use SerialisesTimestampsAsSql;

    protected $table = 'post_categories';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['sort_order' => 'integer'];
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'category_id');
    }
}
