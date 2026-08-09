<?php

namespace App\Models;

use App\Models\Concerns\SerialisesTimestampsAsSql;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * An admin account.
 *
 * The panel authenticates against this table, not Laravel's `users` — which is
 * why `config/auth.php` names a separate provider. Two details differ from a
 * stock Laravel user and both are deliberate:
 *
 *   - the hash column is `password_hash`, so `getAuthPassword()` is overridden
 *     rather than the column renamed. Renaming it would break the API this
 *     schema is shared with.
 *   - `token_version` exists so a password change can invalidate sessions
 *     issued before it, without a session table to sweep.
 */
class AdminUser extends Authenticatable implements FilamentUser
{
    use HasFactory;
    use Notifiable;
    use SerialisesTimestampsAsSql;

    public const ROLES = ['super_admin', 'editor'];

    protected $table = 'admin_users';

    protected $fillable = [
        'name',
        'email',
        'password_hash',
        'role',
        'is_active',
        'must_change_password',
        'token_version',
        'last_login_at',
        'failed_attempts',
        'locked_until',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'must_change_password' => 'boolean',
            'token_version' => 'integer',
            'failed_attempts' => 'integer',
            'last_login_at' => 'datetime',
            'locked_until' => 'datetime',
            'password_hash' => 'hashed',
        ];
    }

    /** The hash lives in `password_hash`, not `password`. */
    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    /**
     * Who may open the admin panel.
     *
     * Deactivating an account takes effect on its next request — there is no
     * session to revoke separately.
     */
    public function canAccessPanel(Panel $panel): bool
    {
        return $this->is_active;
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    /** True while a temporary lockout from repeated failed sign-ins is active. */
    public function isLocked(): bool
    {
        return $this->locked_until !== null && $this->locked_until->isFuture();
    }

    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class, 'created_by');
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class, 'author_id');
    }
}
