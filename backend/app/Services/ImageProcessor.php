<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use RuntimeException;

/**
 * Processing for uploaded logos and cover images.
 *
 * Everything is re-encoded rather than written as received. That does four jobs
 * at once:
 *
 *   1. Validates — decoding throws on anything that is not really an image, so
 *      a renamed file is caught here rather than at render.
 *   2. Strips metadata — a site photograph straight off a phone carries GPS
 *      coordinates, and publishing those is a genuine leak.
 *   3. Neutralises polyglots — the output is encoded from decoded pixels, so
 *      any payload smuggled in the original container does not survive.
 *   4. Normalises size and format, and returns the dimensions so `next/image`
 *      can reserve space and avoid layout shift.
 */
class ImageProcessor
{
    /**
     * SVG is deliberately absent.
     *
     * An SVG is a document that can carry script, and it would be served from
     * our own domain — so a malicious logo becomes stored XSS. Sanitising SVG
     * properly is a project of its own; rejecting it and asking for a PNG is a
     * two-second inconvenience for whoever uploads the logo.
     */
    public const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

    /** @var array<string, array{folder: string, max_width: int, max_height: int|null, trim: bool}> */
    private const SPECS = [
        // Logos are usually a mark on white with a lot of surrounding space.
        'client_logo' => ['folder' => 'clients', 'max_width' => 600, 'max_height' => 300, 'trim' => true],
        'post_cover' => ['folder' => 'posts', 'max_width' => 1600, 'max_height' => null, 'trim' => false],
    ];

    /**
     * @return array{path: string, url: string, width: int, height: int, bytes: int}
     */
    public function process(UploadedFile $file, string $purpose): array
    {
        if (! isset(self::SPECS[$purpose])) {
            throw new RuntimeException("Unknown image purpose [{$purpose}].");
        }

        if (! in_array($file->getMimeType(), self::ALLOWED_MIME, true)) {
            throw new RuntimeException(
                'Upload a PNG, JPEG or WebP image. SVG files are not accepted.'
            );
        }

        $spec = self::SPECS[$purpose];

        $manager = new ImageManager(new Driver());

        try {
            $image = $manager->read($file->getRealPath());
        } catch (\Throwable) {
            // Failing to decode means it is not the image it claimed to be.
            throw new RuntimeException('That file could not be read as an image.');
        }

        // Honour the EXIF orientation flag before anything else, or portrait
        // photographs come out sideways.
        $image->orient();

        if ($spec['trim']) {
            // Crop uniform surrounding colour so logos of different padding
            // line up with each other on the page.
            $image->trim(12);
        }

        // `scaleDown`, not `scale`: never enlarge a small logo into a blurry
        // large one.
        $image->scaleDown(width: $spec['max_width'], height: $spec['max_height']);

        $encoded = $image->toWebp(quality: 85);

        $storedPath = $spec['folder'].'/'.Str::uuid().'.webp';
        Storage::disk('uploads')->put($storedPath, (string) $encoded);

        return [
            'path' => $storedPath,
            'url' => '/uploads/'.$storedPath,
            'width' => $image->width(),
            'height' => $image->height(),
            'bytes' => strlen((string) $encoded),
        ];
    }

    /** Remove a stored image, ignoring one that has already gone. */
    public function remove(?string $storedPath): void
    {
        if ($storedPath === null || $storedPath === '') {
            return;
        }

        Storage::disk('uploads')->delete($storedPath);
    }
}
