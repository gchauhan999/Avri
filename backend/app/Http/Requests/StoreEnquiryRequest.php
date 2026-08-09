<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * The contact and quote forms.
 *
 * These rules mirror `client/lib/enquiry.ts` message for message. That copy
 * runs in the browser and is trivially bypassed, so this is the one that
 * actually holds — and a visitor should see the same wording either way.
 */
class StoreEnquiryRequest extends FormRequest
{
    /** 10-digit Indian mobile, optionally prefixed with +91 or 0. */
    public const PHONE_RE = '/^(?:\+?91[\s-]?|0)?[6-9]\d{9}$/';

    public const EMAIL_RE = '/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/';

    public function authorize(): bool
    {
        return true;
    }

    /**
     * Decide which kind of submission this is before anything is validated.
     *
     * `/enquiries/quote` pins the kind, and it has to be pinned *here* rather
     * than in the controller: the stricter rules below key off `kind`, so a
     * quote posted to that route with no `kind` in the body would otherwise
     * validate as an ordinary enquiry and skip them entirely.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'kind' => $this->is('api/enquiries/quote')
                ? 'quote_request'
                : ($this->input('kind') ?: 'enquiry'),
        ]);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'kind' => ['sometimes', 'in:enquiry,quote_request'],
            'name' => ['required', 'string', 'min:2', 'max:160'],
            'phone' => ['required', 'string', 'regex:'.self::PHONE_RE],
            'email' => ['nullable', 'string', 'max:255', 'regex:'.self::EMAIL_RE],
            'company' => ['nullable', 'string', 'max:180'],
            'subject' => ['nullable', 'string', 'max:200'],
            'service' => ['nullable', 'string', 'max:160'],
            'industry' => ['nullable', 'string', 'max:160'],
            'product' => ['nullable', 'string', 'max:200'],
            'location' => ['nullable', 'string', 'max:200'],
            'capacity' => ['nullable', 'string', 'max:120'],
            'budget' => ['nullable', 'string', 'max:120'],
            'timeline' => ['nullable', 'string', 'max:120'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
            /*
             * The honeypot. The website renders a hidden `company_website`
             * input that a human never sees. It must validate as "empty or
             * absent" so a filled one is caught in the controller instead: a
             * bot that receives an error simply retries without the field,
             * whereas one that receives a success moves on.
             */
            'company_website' => ['nullable', 'string'],
            'source_page' => ['nullable', 'string', 'max:300'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.required' => 'Please enter your name.',
            'name.min' => 'Please enter your name.',
            'name.max' => 'That name is too long.',
            'phone.required' => 'Enter a valid 10-digit mobile number.',
            'phone.regex' => 'Enter a valid 10-digit mobile number.',
            'email.regex' => 'Enter a valid email address.',
            'email.max' => 'That email address is too long.',
            'message.required' => 'Please describe your requirement in a little more detail.',
            'message.min' => 'Please describe your requirement in a little more detail.',
            'message.max' => 'That message is too long. Please summarise it.',
        ];
    }

    /**
     * A quote request asks for more, so it validates more.
     *
     * Expressed as an extra pass rather than a second request class so the
     * shared fields cannot drift apart between the two forms.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->input('kind') !== 'quote_request') {
                return;
            }

            if (blank($this->input('email'))) {
                $validator->errors()->add('email', 'Enter a valid email address.');
            }
            if (blank($this->input('service'))) {
                $validator->errors()->add('service', 'Please select the service you need.');
            }
            if (blank($this->input('location'))) {
                $validator->errors()->add('location', 'Please tell us where the site is.');
            }
        });
    }
}
