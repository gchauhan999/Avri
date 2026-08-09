<?php

namespace App\Jobs;

use App\Mail\ApplicationAcknowledged;
use App\Mail\ApplicationReceived;
use App\Models\Application;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * Tells HR about a new application, and thanks the applicant.
 *
 * The two are not equal. The HR notification is the one whose outcome is
 * recorded on the row, because somebody is waiting on it; the acknowledgement
 * is best effort and is never allowed to mark the record as failed.
 */
class SendApplicationNotification implements ShouldQueue
{
    use Queueable;

    public function __construct(public int $applicationId) {}

    public function handle(): void
    {
        $application = Application::find($this->applicationId);

        if (! $application) {
            return;
        }

        $to = config('avri.mail.hr_to');

        if (blank($to)) {
            $application->update([
                'email_status' => 'skipped',
                'email_error' => 'MAIL_HR_TO is not set.',
                'email_attempts' => $application->email_attempts + 1,
            ]);

            return;
        }

        try {
            $mail = Mail::to($to);

            if (filled(config('avri.mail.bcc'))) {
                $mail->bcc(config('avri.mail.bcc'));
            }

            $mail->send(new ApplicationReceived($application));

            $application->update([
                'email_status' => 'sent',
                'email_error' => null,
                'email_attempts' => $application->email_attempts + 1,
            ]);
        } catch (\Throwable $e) {
            $application->update([
                'email_status' => 'failed',
                'email_error' => mb_substr($e->getMessage(), 0, 500),
                'email_attempts' => $application->email_attempts + 1,
            ]);

            throw $e;
        }

        if (config('avri.mail.ack_enabled')) {
            try {
                Mail::to($application->email)->send(new ApplicationAcknowledged($application));
            } catch (\Throwable $e) {
                // Deliberately swallowed: the team has been told, which is what
                // the record tracks. A missing thank-you is not a lost
                // application.
                Log::warning('application acknowledgement failed', [
                    'id' => $application->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
