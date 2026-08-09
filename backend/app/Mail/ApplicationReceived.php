<?php

namespace App\Mail;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;

/** What HR receives when someone applies, with the CV attached. */
class ApplicationReceived extends Mailable
{
    use Queueable;
    use SerializesModels;

    public function __construct(public Application $application) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Application: {$this->application->job_title_snapshot} — {$this->application->full_name}",
            // Replying should reach the applicant, not the website's mailbox.
            replyTo: [$this->application->email],
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.application');
    }

    /**
     * The CV travels with the message.
     *
     * Recruiters read email on a phone; making them sign into a panel to open
     * an attachment is how applications get ignored. Named after the applicant
     * so a saved copy is still identifiable.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $disk = Storage::disk('resumes');

        if (! $disk->exists($this->application->resume_path)) {
            return [];
        }

        $extension = pathinfo($this->application->resume_original_name, PATHINFO_EXTENSION);
        $safeName = preg_replace('/[^A-Za-z0-9 _-]/', '', $this->application->full_name);

        return [
            \Illuminate\Mail\Mailables\Attachment::fromStorageDisk('resumes', $this->application->resume_path)
                ->as(trim($safeName).' CV.'.strtolower($extension))
                ->withMime($this->application->resume_mime),
        ];
    }
}
