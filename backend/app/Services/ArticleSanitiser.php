<?php

namespace App\Services;

use HTMLPurifier;
use HTMLPurifier_Config;

/**
 * Cleaning article HTML from the rich-text editor.
 *
 * Sanitising happens **on write**, not on render. Two reasons: the stored value
 * is then safe everywhere it is used without every consumer having to remember,
 * and the cost is paid once per save rather than on every page view.
 *
 * Article bodies are written by admins, so this is not the first line of
 * defence — but a compromised editor account should not own every visitor to
 * the site, and the public article page renders this HTML directly, so anything
 * that survives here executes in the reader's browser.
 */
class ArticleSanitiser
{
    /**
     * The tags the editor's toolbar can produce, and nothing else. No script,
     * no style, no iframe, no form elements.
     */
    private const ALLOWED = 'p,br,hr,h2,h3,h4,strong,b,em,i,u,s,code,pre,blockquote,'
        .'ul,ol,li,a[href|title|target|rel],img[src|alt|title|width|height|loading],'
        .'figure,figcaption,table,thead,tbody,tr,th[colspan|rowspan|scope],td[colspan|rowspan]';

    public function clean(string $dirty): string
    {
        $config = HTMLPurifier_Config::createDefault();

        $config->set('HTML.Allowed', self::ALLOWED);
        // No `javascript:` or `data:` URLs — that is how an <a> or an <img>
        // becomes an execution vector.
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true, 'mailto' => true, 'tel' => true]);
        // Every `style` attribute is dropped: inline CSS can position an
        // element over the page and is a clickjacking primitive.
        $config->set('CSS.AllowedProperties', []);
        // Outbound links open in a new tab and cannot reach back through
        // window.opener.
        $config->set('HTML.TargetBlank', true);
        $config->set('HTML.TargetNoopener', true);
        $config->set('HTML.TargetNoreferrer', true);
        $config->set('Attr.AllowedFrameTargets', ['_blank']);
        // HTMLPurifier caches its parsed definitions; give it somewhere to
        // write that is not the vendor directory.
        $config->set('Cache.SerializerPath', storage_path('app/purifier'));

        if (! is_dir(storage_path('app/purifier'))) {
            mkdir(storage_path('app/purifier'), 0o755, true);
        }

        /*
         * `figure` and `figcaption` are HTML5, and HTMLPurifier's default
         * doctype is HTML 4.01 — it does not merely drop them, it raises
         * "Element 'figure' is not supported" and the whole save fails. The
         * editor emits them around captioned images, so they are taught here
         * rather than removed from the allow-list.
         *
         * The definition is cached under the id and revision below; bump the
         * revision after changing anything in this block or the old definition
         * is reused.
         */
        $config->set('HTML.DefinitionID', 'avri-article');
        $config->set('HTML.DefinitionRev', 2);

        if ($definition = $config->maybeGetRawHTMLDefinition()) {
            $definition->addElement('figure', 'Block', 'Flow', 'Common');
            $definition->addElement('figcaption', 'Block', 'Flow', 'Common');
            // Same story: `loading` is HTML5, and keeping it is worth the two
            // lines — a blog page full of eagerly-loaded images is slow.
            $definition->addAttribute('img', 'loading', 'Enum#lazy,eager');
        }

        return (new HTMLPurifier($config))->purify($dirty);
    }

    /** Plain text, for excerpts and reading-time estimates. */
    public function toText(string $html): string
    {
        $text = html_entity_decode(strip_tags($html), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return trim((string) preg_replace('/\s+/u', ' ', $text));
    }

    /** ~200 words a minute, floored at one. */
    public function readingMinutes(string $html): int
    {
        $words = preg_split('/\s+/u', $this->toText($html), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        return max(1, (int) round(count($words) / 200));
    }

    /** First ~200 characters of prose, cut on a word boundary. */
    public function excerpt(string $html, int $limit = 200): string
    {
        $text = $this->toText($html);

        if (mb_strlen($text) <= $limit) {
            return $text;
        }

        $cut = mb_substr($text, 0, $limit);
        $lastSpace = mb_strrpos($cut, ' ');

        return ($lastSpace === false ? $cut : mb_substr($cut, 0, $lastSpace)).'…';
    }
}
