# Assets

All site imagery lives here. Anything in `public/` is served from the site root,
so `public/assets/services/solar.jpg` is referenced as `/assets/services/solar.jpg`.

```
public/assets/
├── logo.png          ← company logo (used in the navbar, footer and preloader)
├── CREDITS.md        ← where every photograph came from, and its licence
├── hero/             ← home page hero banner                        (empty)
├── services/         ← one image per service                        (13, filled)
├── products/         ← product photographs (see its own README)     (41, filled)
├── projects/         ← project photographs                          (8, filled)
├── gallery/          ← site photographs for the gallery page        (empty)
├── clients/          ← client logos (transparent PNG or SVG)        (empty)
├── industries/       ← sector images                                (10, filled)
├── about/            ← team and office photographs                  (empty)
└── icons/            ← any custom icon files                        (empty)
```

Filenames match the entry's `slug`, so `services/substations.jpg` belongs to the
service with `slug: "substations"`. Keep that convention and a replacement needs
no code change.

## Nothing is ever broken

Every image slot falls back to branded vector artwork
(`components/ui/Illustration.tsx`) when no photograph is supplied. That is why
the still-empty folders above cost nothing — add real photos whenever you have
them and the layout will not shift.

## Licensing

`industries/`, `services/` and `projects/` are Pexels or CC0 images: free for
commercial use, no attribution required. Most of `products/` is CC BY or
CC BY-SA, which **must** be credited — that is what the `/image-credits` page
linked in the footer does, driven by `lib/image-credits.ts`.

`CREDITS.md` lists each file's source and states the test a replacement has to
pass — chiefly that no other company's branding may be visible. Read it before
adding an image, and if you replace a credited photograph, delete its entry
from `lib/image-credits.ts`.

## Replacing a photograph

**Overwrite the file, keep the filename.** Services, industries and projects
already have their `image` field set in `lib/site.ts`, so dropping your own
photograph over the existing one — at the size in the table below — is the whole
job. No code change.

## Wiring a new photograph in

For a slot that has none yet (gallery, clients, hero), open `lib/site.ts` and
set the `image` field on the entry:

```ts
{
  slug: "solar-solutions",
  title: "Solar Solutions",
  image: "/assets/services/solar.jpg",   // ← add this line
  // …
}
```

The same applies to `projects`, `industries`, `gallery` and `clients` (which
uses a `logo` field instead of `image`). Products live in their own file,
`lib/products.ts`.

For the home page hero, pass a `src` to the `<Media>` component in
`components/sections/Hero.tsx`.

## Guidance

| Slot          | Aspect ratio | Suggested width |
| ------------- | ------------ | --------------- |
| Hero          | 4:3          | 1600 px         |
| Service cards | 16:9         | 1200 px         |
| Project cards | 16:10        | 1200 px         |
| Industries    | 21:9         | 1600 px         |
| Gallery       | 4:3          | 1400 px         |
| Client logos  | free         | 400 px, transparent |

- Use `.jpg` for photographs and `.png`/`.svg` where transparency is needed.
- Frames crop to fill, so keep the subject near the centre.
- Next.js resizes and serves AVIF/WebP automatically — no need to pre-optimise.
- Remote images work too, but the host must first be added to
  `images.remotePatterns` in `next.config.ts`.

## The logo

`logo.png` is used at several sizes. A version with a transparent background is
worth adding — the current file has a white background, which is why the footer
places it on a white plate.
