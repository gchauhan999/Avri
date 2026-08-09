<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Support\Uploads;
use Illuminate\Http\JsonResponse;

/**
 * The public client list.
 *
 * `Client::scopePubliclyVisible` requires both flags, and they mean different
 * things: authorised is "we hold written permission to show this logo",
 * published is "we have chosen to show it right now". A CHECK constraint in the
 * database already makes published-without-authorised impossible and the admin
 * panel refuses it too — filtering on both here is the third belt, because
 * publishing a company's trademark without permission is a legal problem, not a
 * cosmetic one.
 */
class ClientController extends Controller
{
    public function index(): JsonResponse
    {
        $clients = Client::publiclyVisible()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return response()->json($clients->map(fn (Client $client) => [
            'id' => $client->id,
            'name' => $client->name,
            'slug' => $client->slug,
            'logo' => Uploads::url($client->logo_path),
            'logoWidth' => $client->logo_width,
            'logoHeight' => $client->logo_height,
            'website' => $client->website_url,
            'sector' => $client->sector,
        ]));
    }
}
