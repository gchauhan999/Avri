<?php

namespace App\Jobs;

use App\Mail\EnquiryReceived;
use App\Models\Enquiry;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

/**
 * Tells the team about a new enquiry, and records what happened.
 *
 * Queued so the visitor is never kept waiting on SMTP. Delivery has to be
 * tracked on the row itself: a failure here is invisible otherwise, and the row
 * is the only record that someone is waiting for a reply.
 */
class SendEnquiryNotification implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $enquiryId) {}

    public function handle(): void
    {
        $enquiry = Enquiry::find($this->enquiryId);

        if (! $enquiry) {
            return;
        }

        $to = config('avri.mail.sales_to');

        if (blank($to)) {
            $enquiry->update([
                'email_status' => 'skipped',
                'email_error' => 'MAIL_SALES_TO is not set.',
                'email_attempts' => $enquiry->email_attempts + 1,
            ]);

            return;
        }

        try {
            $mail = Mail::to($to);

            if (filled(config('avri.mail.bcc'))) {
                $mail->bcc(config('avri.mail.bcc'));
            }

            $mail->send(new EnquiryReceived($enquiry));

            $enquiry->update([
                'email_status' => 'sent',
                'email_error' => null,
                'email_attempts' => $enquiry->email_attempts + 1,
            ]);
        } catch (\Throwable $e) {
            $enquiry->update([
                'email_status' => 'failed',
                'email_error' => mb_substr($e->getMessage(), 0, 500),
                'email_attempts' => $enquiry->email_attempts + 1,
            ]);

            // Rethrow so the queue records it as a failed job too, and the
            // usual retry machinery applies.
            throw $e;
        }
    }
}
