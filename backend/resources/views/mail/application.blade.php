<x-mail::message>
# New application

**{{ $application->full_name }}** has applied for **{{ $application->job_title_snapshot }}**.

## How to reach them

- **Phone:** [{{ $application->phone }}](tel:{{ $application->phone_normalised }})
- **Email:** [{{ $application->email }}](mailto:{{ $application->email }})
@if ($application->linkedin_url)
- **LinkedIn:** [{{ $application->linkedin_url }}]({{ $application->linkedin_url }})
@endif

@php
    $details = array_filter([
        'Current location' => $application->current_location,
        'Current company' => $application->current_company,
        'Experience' => $application->experience_years !== null ? $application->experience_years.' years' : null,
        'Notice period' => $application->notice_period,
    ]);
@endphp

@if (count($details))
## Background

@foreach ($details as $label => $value)
- **{{ $label }}:** {{ $value }}
@endforeach
@endif

@if ($application->cover_letter)
## Their note

<x-mail::panel>
{{ $application->cover_letter }}
</x-mail::panel>
@endif

The CV is attached ({{ $application->resume_original_name }}, {{ number_format($application->resume_size_bytes / 1024) }} kB).

Received {{ $application->created_at->timezone('Asia/Kolkata')->format('j F Y, g:i a') }} IST.
Reply to this message to answer {{ $application->full_name }} directly.
</x-mail::message>
