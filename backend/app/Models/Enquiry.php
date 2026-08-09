<?php

namespace App\Models;

use App\Models\Concerns\SerialisesTimestampsAsSql;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * An inbound message from either website form.
 *
 * Contact and quote requests share enough columns that two tables would mean
 * two dashboards and two exports; the unused columns are simply null for the
 * other kind, and `kind` says which one a row is.
 */
class Enquiry extends Model
{
    use HasFactory;
    use SerialisesTimestampsAsSql;

    public const KINDS = ['enquiry', 'quote_request'];
    public const STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost', 'spam'];
    public const EMAIL_STATUSES = ['pending', 'sent', 'failed', 'skipped'];

    protected $table = 'enquiries';

    protected $guarded = ['id'];

    /** Raw INET6_ATON bytes, kept for abuse investigation and never sent out. */
    protected $hidden = ['source_ip'];

    protected function casts(): array
    {
        return ['email_attempts' => 'integer'];
    }
}
