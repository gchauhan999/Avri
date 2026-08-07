# Image sources and licensing

## What is in this folder

| | Count | Licence | Credit needed? |
| --- | --- | --- | --- |
| Photographs from Wikimedia Commons / Openverse | 33 | CC BY-SA, CC BY, CC0 | **Yes**, for the 30 under CC BY / CC BY-SA |
| Photographs from Pexels | 4 | Pexels | No |
| Original catalogue renders drawn for this project | 4 | ours | No |

The 30 photographs that require a credit are named on the site's
**[/image-credits](../../../app/image-credits/page.tsx)** page, which is linked
from the footer of every page. The data behind that page is
`lib/image-credits.ts` — **if you replace one of those photographs with your
own, delete its entry there.** If you add another CC BY / CC BY-SA photograph,
you must add an entry, otherwise the licence is not satisfied.

## The four renders

These four have no usable free-licence photograph, so they remain original
artwork in the catalogue-render style:

| File | Product | Why no photograph |
| ---- | ------- | ----------------- |
| `rmu.jpg` | SF6 Ring Main Unit | Searches return kiosks and enclosures, not the unit itself |
| `switchgear.jpg` | Air Circuit Breaker | The only clear ACB photographs carry a legible maker's name |
| `hybrid-off-grid-inverter.jpg` | Hybrid & Off-Grid Inverter | Every candidate showed an inverter or battery brand |
| `distribution-box.jpg` | LT Distribution & Feeder Pillar Box | Every street cabinet photograph carried a utility's or cabinet maker's livery |

## The test any replacement must pass

1. **You hold the rights** — your own photograph, a licence you bought, or a
   licence that permits commercial use.
2. **No other company's branding is visible.** Several otherwise-good
   candidates were rejected here for exactly this: a distribution cabinet in a
   utility's livery, an ACB with the maker's product name moulded into the
   case, a telecom pillar carrying two manufacturers' logos.
3. **Nothing implies work you did not do.** These are illustrative equipment
   photographs, not records of Avri Energy supply.

## A caveat worth knowing

Metering products are the weak spot. Every real photograph of an energy meter
shows the maker's model markings somewhere on the case, because that is how
meters are built — there is no such thing as an unbranded meter photograph.
The ones chosen here keep those markings small and off-centre, but they are
legible at full size on the product detail page. **Replace the four meter
pictures with photographs of the meters you actually stock as soon as you can**
— that removes the issue entirely and is more convincing to a buyer.

## Replacing a photograph

Overwrite the file, keep the filename — no code change is needed. See
`README.md` in this folder for the filename-to-product tables. Then remove the
file's entry from `lib/image-credits.ts` if it had one.

Photographs of equipment you have actually supplied will always outperform both
these pictures and generic stock. Shoot against a plain light background, keep
the unit centred with a little space around it, and use 4:3 at 1400 px wide to
match the frames these were built for.
