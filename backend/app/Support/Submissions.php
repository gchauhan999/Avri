<?php

namespace App\Support;

use Illuminate\Database\Query\Expression;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Small helpers for reading things off a form submission that are easy to get
 * subtly wrong.
 */
class Submissions
{
    /** Last ten digits, for storage, de-duplication and search. */
    public static function normalisePhone(string $value): string
    {
        return substr((string) preg_replace('/\D/', '', $value), -10);
    }

    /**
     * The caller's IP as a MySQL `VARBINARY(16)`.
     *
     * Stored binary rather than as text so IPv4 and IPv6 both fit one column
     * and comparisons are exact. Returned as a SQL expression because the
     * conversion has to happen in MySQL — passing the text through would store
     * the wrong bytes. `INET6_ATON` yields NULL for anything it cannot parse,
     * which is the right outcome for a malformed forwarded header.
     *
     * Accuracy depends on the trusted-proxy configuration being right.
     */
    public static function clientIp(Request $request): Expression
    {
        $ip = (string) $request->ip();
        // A dual-stack socket reports IPv4 as "::ffff:1.2.3.4".
        $cleaned = str_starts_with($ip, '::ffff:') ? substr($ip, 7) : $ip;

        return DB::raw('INET6_ATON('.DB::connection()->getPdo()->quote($cleaned).')');
    }

    /** User-Agent, truncated to the column width. */
    public static function userAgent(Request $request): ?string
    {
        $agent = $request->userAgent();

        return $agent ? mb_substr($agent, 0, 400) : null;
    }

    /**
     * Which page a form was submitted from, for attribution.
     *
     * Only a path is kept: a full URL from an untrusted body could be anything,
     * and the host adds nothing we do not already know.
     */
    public static function sourcePage(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        $parts = parse_url($value);
        $path = $parts['path'] ?? '/';
        $query = isset($parts['query']) ? '?'.$parts['query'] : '';

        return mb_substr($path.$query, 0, 300);
    }
}
