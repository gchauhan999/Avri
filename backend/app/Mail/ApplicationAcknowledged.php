<?php

namespace App\Mail;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * The "we have it" note back to the applicant.
 *
 * Worth sending: without it the only signal that an application went through is
 * a line of text that disappears on the next page load, and people re-submit.
 */
class ApplicationAcknowledged extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(public Application $application) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'We have your application — Avri Energy',
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.application-acknowledged');
    }
}
