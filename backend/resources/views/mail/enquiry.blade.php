<x-mail::message>
# {{ $enquiry->kind === 'quote_request' ? 'New quote request' : 'New enquiry' }}

**{{ $enquiry->name }}**
@if ($enquiry->company)
{{ $enquiry->company }}
@endif

<x-mail::panel>
{{ $enquiry->message }}
</x-mail::panel>

## How to reach them

- **Phone:** [{{ $enquiry->phone }}](tel:{{ $enquiry->phone_normalised }})
@if ($enquiry->email)
- **Email:** [{{ $enquiry->email }}](mailto:{{ $enquiry->email }})
@endif

{{-- Only the fields this kind of submission actually uses. --}}
@php
    $details = array_filter([
        'Subject' => $enquiry->subject,
        'Service' => $enquiry->service,
        'Industry' => $enquiry->industry,
        'Product' => $enquiry->product,
        'Site location' => $enquiry->location,
        'Capacity' => $enquiry->capacity,
        'Budget' => $enquiry->budget,
        'Timeline' => $enquiry->timeline,
    ]);
@endphp

@if (count($details))
## Details

@foreach ($details as $label => $value)
- **{{ $label }}:** {{ $value }}
@endforeach
@endif

@if ($enquiry->source_page)
Submitted from `{{ $enquiry->source_page }}` on {{ $enquiry->created_at->timezone('Asia/Kolkata')->format('j F Y, g:i a') }} IST.
@endif

<x-mail::button :url="config('avri.site_url')">
Avri Energy
</x-mail::button>

Reply to this message to answer {{ $enquiry->name }} directly.
</x-mail::message>
