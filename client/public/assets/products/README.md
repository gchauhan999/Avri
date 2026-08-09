# Product images

41 files for 41 products — **every product in the catalogue has its own
picture**, none is shared. They are imported statically by
`lib/product-images.ts`; see "How a product finds its picture" below.

`brochure/` is a staging area, not part of that count: cut-outs lifted from the
printed brochure that have no category to sit in yet. Move one up a level and
rename it to the category's filename when you decide where it belongs.

## What is here

**37 photographs and 4 catalogue renders.** The photographs show the equipment
itself — a cast-resin transformer, a switchgear line-up, a cut cable end, a
street-light head. Four products had no usable free-licence photograph and keep
the original render style; `CREDITS.md` says which and why.

30 of the photographs are used under CC BY or CC BY-SA, which require the
photographer to be credited. That is what `/image-credits` (linked in the
footer) is for, and `lib/image-credits.ts` is its data. **Delete an entry there
when you replace the photograph it refers to.**

Replace all of these with photography of your own equipment as it becomes
available — see `CREDITS.md` for why that matters most for the meters.

## How a product finds its picture

`lib/products.ts` resolves it in this order:

1. an `image` set directly on the catalogue entry,
2. `productImages[slug]` — the product's own render,
3. `categoryImages[category]` — the category's render.

28 of the files are named after a category and 13 after a single product. A
category holding one product uses its category file; where a category holds
several — "LT Panels" covers the PCC, MCC and APFC panels — each product has
its own file, so the listing never shows the same picture three times.

## Replacing one with a real photo

**Overwrite the file, keep the name, rebuild.** No code change:

```
public/assets/products/transformer.jpg   ← drop your photo here, same filename
npm run build
```

### If the replacement is a cut-out

A cut-out — the item alone on white, the way the printed brochure shows it —
needs the opposite framing to a photograph, and nothing can tell them apart
from the file itself. Add the product slug or the category name to
`cutoutImages` in `lib/product-images.ts` and it will be shown whole on a white
tile instead of cropped to fill.

Skip that step and the object gets its edges sliced off. Do it to a photograph
and the photograph sits in a letterbox. Everything not listed keeps the
photographic framing, so the catalogue can be re-shot a few products at a time.

Keep the filename's extension honest — rename to `.png` and update the import
in `lib/product-images.ts` if the cut-out has a transparent background.

`lib/product-images.ts` imports these files statically, so Next fingerprints
each one — the served URL is `/_next/static/media/transformer.<hash>.jpg`.
Replacing the file changes the hash, which changes the URL, so browsers and the
image optimiser fetch the new picture immediately.

That matters: images are served with a one-year cache. If the URL never
changed, a phone that had already loaded the page would keep showing the old
picture for hours while a freshly-loaded laptop showed the new one — the same
product appearing with two different images on two devices.

Names map to categories as follows:

| File                          | Category                |
| ----------------------------- | ----------------------- |
| `transformer.jpg`             | Distribution Transformers |
| `power-transformer.jpg`       | Power Transformers      |
| `ht-panel.jpg`                | HT Panels               |
| `lt-panel.jpg`                | LT Panels               |
| `rmu.jpg`                     | RMU (Ring Main Unit)    |
| `vcb.jpg`                     | VCB Panels              |
| `switchgear.jpg`              | Switchgear              |
| `smart-meter.jpg`             | Smart Meters            |
| `dt-meter.jpg`                | DT Meters               |
| `ltct-meter.jpg`              | LTCT Meters             |
| `ct-pt.jpg`                   | CT/PT                   |
| `power-cable.jpg`             | Power Cables            |
| `control-cable.jpg`           | Control Cables          |
| `ab-cable.jpg`                | AB Cables               |
| `cable-accessories.jpg`       | Cable Accessories       |
| `electrical-accessories.jpg`  | Electrical Accessories  |
| `junction-box.jpg`            | Junction Boxes          |
| `street-light-pole.jpg`       | Street Light Poles      |
| `led-street-light.jpg`        | LED Street Lights       |
| `high-mast.jpg`               | High Mast Lighting      |
| `ev-charging-station.jpg`     | EV Charging Stations    |
| `solar-panel.jpg`             | Solar Panels            |
| `solar-inverter.jpg`          | Solar Inverters         |
| `solar-structure.jpg`         | Solar Structures        |
| `earthing.jpg`                | Earthing Materials      |
| `insulator.jpg`               | Insulators              |
| `bus-duct.jpg`                | Bus Ducts               |
| `distribution-box.jpg`        | Distribution Boxes      |

The other 13 are named after the product slug they belong to, and are listed in
`productImages` in `lib/product-images.ts`:

| File | Product |
| ---- | ------- |
| `cast-resin-dry-type-transformer.jpg` | Cast Resin Dry Type Transformer |
| `ht-metering-cubicle.jpg` | HT Metering Cubicle |
| `motor-control-centre-panel.jpg` | Motor Control Centre (MCC) Panel |
| `apfc-panel.jpg` | APFC Panel |
| `outdoor-pole-mounted-vcb.jpg` | Outdoor Pole-Mounted VCB |
| `mccb-mcb-protection-range.jpg` | MCCB & MCB Protection Range |
| `ct-operated-smart-meter.jpg` | Three Phase CT Operated Smart Meter |
| `lt-xlpe-pvc-power-cable.jpg` | LT XLPE & PVC Power Cable |
| `all-in-one-solar-street-light.jpg` | All-in-One Solar Street Light |
| `bifacial-glass-glass-module.jpg` | Bifacial Glass-Glass Module |
| `hybrid-off-grid-inverter.jpg` | Hybrid & Off-Grid Inverter |
| `ac-charging-point.jpg` | AC Charging Point |
| `earthing-strips-and-lightning-protection.jpg` | Earthing Strips & Lightning Protection |

## Giving a new product its own picture

Add the file here, then add one line to `productImages` in
`lib/product-images.ts` — import it and key it by the product's slug:

```ts
import ringMainUnit from "@/public/assets/products/sf6-ring-main-unit.jpg";

export const productImages: Record<string, StaticImageData> = {
  "sf6-ring-main-unit": ringMainUnit,   // ← wins over the category image
  // …
};
```

Import it rather than writing the path as a string: static imports are
fingerprinted, which is what makes a replaced file appear immediately instead of
being served from a year-long cache.

## Where real photos can come from

- Photographs of your own stock, workshop and completed installations. These
  are the most credible and carry no licensing risk.
- Manufacturer photography from your approved makes, **with written permission**
  — most OEMs allow channel partners to use their product images.
- Licensed stock photography (Adobe Stock, Shutterstock, iStock).

Do not take images from a competitor's or manufacturer's website without
permission. They are copyrighted, and showing another maker's unit as your own
product is a misrepresentation to buyers.

## Guidance

| Slot           | Aspect ratio | Suggested width |
| -------------- | ------------ | --------------- |
| Product card   | 4:3          | 1000 px         |
| Product detail | 4:3          | 1400 px         |

- Use `.jpg` for photographs, `.png` where transparency is needed.
- Frames crop to fill, so keep the product near the centre.
- Next.js resizes and serves AVIF/WebP automatically — no need to pre-optimise.
- Photos on a plain white or light grey background sit best against the site's
  card styling.

## Datasheets

Put PDFs in `public/assets/products/datasheets/` and reference them with the
`datasheet` field:

```ts
datasheet: "/assets/products/datasheets/sf6-ring-main-unit.pdf",
```

When a product has no `datasheet`, the detail page shows a "Request Datasheet"
button that opens an email to the sales address instead of a dead download
link.
