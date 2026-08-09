<?php

namespace App\Mail;

use App\Models\Enquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/** What the sales team receives when a form is submitted. */
class EnquiryReceived extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(public Enquiry $enquiry) {}

    public function envelope(): Envelope
    {
        $who = $this->enquiry->name;
        $what = $this->enquiry->kind === 'quote_request' ? 'Quote request' : 'Enquiry';

        return new Envelope(
            // The subject carries the useful facts, because that is all a phone
            // notification shows.
            subject: "{$what} from {$who}",
            // Replying to the notification should reach the person who wrote
            // in, not the website's own mailbox.
            replyTo: filled($this->enquiry->email)
                ? [$this->enquiry->email]
                : [],
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.enquiry');
    }
}
