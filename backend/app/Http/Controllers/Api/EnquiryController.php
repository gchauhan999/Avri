<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEnquiryRequest;
use App\Jobs\SendEnquiryNotification;
use App\Models\Enquiry;
use App\Support\Submissions;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * The contact and quote forms.
 *
 * Both land in one table. `kind` says which, and the quote branch validates
 * more — see `StoreEnquiryRequest`.
 */
class EnquiryController extends Controller
{
    public function store(StoreEnquiryRequest $request): JsonResponse
    {
        return $this->submit($request);
    }

    /**
     * The quote form.
     *
     * Both routes run the same handler. The kind is settled by the request's
     * `prepareForValidation`, which reads the path — so the stricter rules are
     * already applied by the time anything here runs, and a caller cannot skip
     * them by posting `kind: enquiry` to this route.
     */
    public function storeQuote(StoreEnquiryRequest $request): JsonResponse
    {
        return $this->submit($request);
    }

    private function submit(StoreEnquiryRequest $request): JsonResponse
    {
        $kind = $request->input('kind');

        /*
         * Honeypot. Answer with the normal success and write nothing — a bot
         * that gets an error just retries without the field, while one that
         * gets a success has no reason to.
         */
        if (filled($request->input('company_website'))) {
            Log::debug('honeypot triggered on enquiry', ['ip' => $request->ip()]);

            return response()->json(['message' => $this->successMessage($kind)], 201);
        }

        $enquiry = Enquiry::create([
            'kind' => $kind,
            'name' => $request->string('name')->trim()->value(),
            'phone' => $request->string('phone')->trim()->value(),
            'phone_normalised' => Submissions::normalisePhone($request->string('phone')->value()),
            'email' => $request->input('email') ?: null,
            'company' => $request->input('company') ?: null,
            'subject' => $request->input('subject') ?: null,
            'service' => $request->input('service') ?: null,
            'industry' => $request->input('industry') ?: null,
            'product' => $request->input('product') ?: null,
            'location' => $request->input('location') ?: null,
            'capacity' => $request->input('capacity') ?: null,
            'budget' => $request->input('budget') ?: null,
            'timeline' => $request->input('timeline') ?: null,
            'message' => $request->string('message')->trim()->value(),
            'source_page' => Submissions::sourcePage($request->input('source_page')),
            'source_ip' => Submissions::clientIp($request),
            'user_agent' => Submissions::userAgent($request),
        ]);

        /*
         * Queued, not sent inline. The visitor has already been told
         * "received", which is true — the row exists. If SMTP is down the row
         * is flagged `failed`, badged in the panel, and can be retried there.
         */
        SendEnquiryNotification::dispatch($enquiry->id);

        return response()->json([
            'id' => $enquiry->id,
            'message' => $this->successMessage($kind),
        ], 201);
    }

    private function successMessage(string $kind): string
    {
        return $kind === 'quote_request'
            ? 'Your quote request has been received. Our engineering team will review the scope and respond within two working days.'
            : 'Thank you — your enquiry has reached us. Expect a call from our team within one working day.';
    }
}
