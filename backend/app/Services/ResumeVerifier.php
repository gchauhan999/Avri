<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

/**
 * Magic-number verification for uploaded résumés.
 *
 * Laravel's validation already checked the extension and the MIME type, and
 * neither is worth much: both come from the client. `payload.exe` renamed to
 * `resume.pdf` and sent with `Content-Type: application/pdf` passes every check
 * up to this one.
 *
 * This reads the first few bytes and compares them to what the format actually
 * starts with. It is not antivirus — a genuinely malicious PDF is still a
 * malicious PDF — but it stops the trivial case, and the file is never
 * executed, never served inline, and never stored under a web root.
 */
class ResumeVerifier
{
    /** @var array<int, array{kind: string, bytes: array<int, int>}> */
    private const SIGNATURES = [
        // "%PDF-"
        ['kind' => 'pdf', 'bytes' => [0x25, 0x50, 0x44, 0x46, 0x2D]],
        // "PK\x03\x04" — .docx is a zip container. So are .xlsx and .pptx,
        // which is why the extension still has to agree.
        ['kind' => 'docx', 'bytes' => [0x50, 0x4B, 0x03, 0x04]],
        // OLE2 compound document — legacy .doc.
        ['kind' => 'doc', 'bytes' => [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]],
    ];

    /**
     * @return array{ok: bool, kind: string|null, sha256: string, size: int}
     */
    public function verify(UploadedFile $file): array
    {
        $path = $file->getRealPath();
        $size = (int) filesize($path);

        $handle = fopen($path, 'rb');
        $header = (string) fread($handle, 16);
        fclose($handle);

        $matched = null;
        foreach (self::SIGNATURES as $signature) {
            $hit = true;
            foreach ($signature['bytes'] as $index => $byte) {
                if (! isset($header[$index]) || ord($header[$index]) !== $byte) {
                    $hit = false;
                    break;
                }
            }
            if ($hit) {
                $matched = $signature['kind'];
                break;
            }
        }

        // Streamed, so a 5 MB file is not held in memory twice.
        $sha256 = hash_file('sha256', $path);

        if ($matched === null) {
            return ['ok' => false, 'kind' => null, 'sha256' => $sha256, 'size' => $size];
        }

        /*
         * The signature and the extension must agree. A .docx really is a zip,
         * so without this a renamed .xlsx — or any zip at all — would sail
         * through.
         */
        $extension = strtolower($file->getClientOriginalExtension());

        return [
            'ok' => $extension === $matched,
            'kind' => $matched,
            'sha256' => $sha256,
            'size' => $size,
        ];
    }
}
