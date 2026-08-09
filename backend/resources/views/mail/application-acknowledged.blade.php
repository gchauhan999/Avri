<x-mail::message>
# Thank you, {{ Str::before($application->full_name, ' ') }}

We have your application for **{{ $application->job_title_snapshot }}**, along with your CV.

Our HR team reads every application. If your profile fits the role, someone will
call you within a week. If you do not hear from us in that time, the role has
most likely been filled — please do keep an eye on our openings, because we
recruit through the year.

<x-mail::button :url="config('avri.site_url').'/careers/'">
See all current openings
</x-mail::button>

Please do not reply to this message; it is sent automatically.

Avri Energy
</x-mail::message>
