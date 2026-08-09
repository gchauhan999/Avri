<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/**
 * Is the API up, and can it reach the database?
 *
 * Answers 503 rather than 200 when the database is unreachable, so a load
 * balancer or an uptime check treats it as down instead of "responding".
 */
class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $databaseUp = true;

        try {
            DB::select('SELECT 1');
        } catch (\Throwable) {
            $databaseUp = false;
        }

        return response()->json([
            'ok' => $databaseUp,
            'service' => 'avri-api',
            'env' => app()->environment(),
            'db' => $databaseUp ? 'up' : 'down',
        ], $databaseUp ? 200 : 503);
    }
}
