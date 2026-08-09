<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * The careers form.
 *
 * Everything arrives as multipart alongside the CV, so every field is a string
 * on the way in. The file rules here are the cheap checks — extension, declared
 * MIME, size. The one that matters, reading the file's leading bytes, happens
 * in the controller: both of these come from the client and neither is worth
 * much on its own.
 */
class StoreApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $maxKilobytes = (int) (config('avri.uploads.max_resume_bytes') / 1024);

        return [
            'jobSlug' => ['nullable', 'string', 'max:220'],
            'position' => ['nullable', 'string', 'max:200'],
            'name' => ['required', 'string', 'min:2', 'max:160'],
            'email' => ['required', 'string', 'max:255', 'regex:'.StoreEnquiryRequest::EMAIL_RE],
            'phone' => ['required', 'string', 'regex:'.StoreEnquiryRequest::PHONE_RE],
            'currentLocation' => ['nullable', 'string', 'max:160'],
            'experience' => ['nullable', 'string', 'max:40'],
            'currentCompany' => ['nullable', 'string', 'max:160'],
            'noticePeriod' => ['nullable', 'string', 'max:60'],
            'linkedin' => ['nullable', 'url', 'max:300'],
            'message' => ['nullable', 'string', 'max:5000'],
            'company_website' => ['nullable', 'string'],
            'resume' => [
                'required',
                'file',
                'mimes:pdf,doc,docx',
                "max:{$maxKilobytes}",
            ],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'name.required' => 'Please enter your name.',
            'name.min' => 'Please enter your name.',
            'name.max' => 'That name is too long.',
            'email.required' => 'Enter a valid email address.',
            'email.regex' => 'Enter a valid email address.',
            'phone.required' => 'Enter a valid 10-digit mobile number.',
            'phone.regex' => 'Enter a valid 10-digit mobile number.',
            'linkedin.url' => 'Enter a full URL, including https://',
            'message.max' => 'Please keep the covering note under 5000 characters.',
            'resume.required' => 'Please attach your CV.',
            'resume.mimes' => 'Attach your CV as a PDF or a Word document.',
            'resume.max' => 'That file is too large. Please attach a CV under 5 MB.',
        ];
    }
}
