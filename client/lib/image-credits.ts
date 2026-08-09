/**
 * Attribution for the photographs used on this site.
 *
 * Most of the imagery here needs no credit — Pexels images and CC0 / public
 * domain images may be used commercially without attribution, and the product
 * renders are our own artwork. A number of the product photographs, however,
 * are licensed **CC BY** or **CC BY-SA**, which permit commercial use only if
 * the photographer is credited. `/image-credits` exists to carry those credits,
 * and is linked from the footer of every page.
 *
 * If you add a CC BY or CC BY-SA image, you must add its entry here. If you
 * replace one with your own photograph, delete the entry.
 */

export type Licence = "Pexels" | "CC0" | "CC BY" | "CC BY-SA";

export interface ImageCredit {
  /** Path under `public/`, e.g. "products/rmu.jpg". */
  file: string;
  /** What the picture shows, in our own words. */
  subject: string;
  /** Photographer or uploader, as named by the source. */
  author?: string;
  licence: Licence;
  /** Deed for the licence — omitted for Pexels, which has its own terms page. */
  licenceUrl?: string;
  /** The page the image was obtained from. */
  sourceUrl?: string;
}

export interface CreditGroup {
  title: string;
  /** Explains what this group of images is and where it appears. */
  note: string;
  credits: ImageCredit[];
}

export const LICENCE_URLS: Record<Licence, string> = {
  Pexels: "https://www.pexels.com/license/",
  CC0: "https://creativecommons.org/publicdomain/zero/1.0/",
  "CC BY": "https://creativecommons.org/licenses/by/4.0/",
  "CC BY-SA": "https://creativecommons.org/licenses/by-sa/4.0/",
};

/** True when the licence obliges us to name the photographer. */
export function needsAttribution(licence: Licence): boolean {
  return licence === "CC BY" || licence === "CC BY-SA";
}

export const creditGroups: CreditGroup[] = [
  {
    title: "Product photographs",
    note:
      "Equipment photographs used on the product catalogue. The remaining " +
      "product pictures are either Pexels images, public domain, or our own " +
      "catalogue renders, and carry no attribution requirement.",
    credits: [
      {
        file: "products/ab-cable.jpg",
        subject: "Aerial Bunched (AB) Cable",
        author: "Dave Bryant",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=28028723",
      },
      {
        file: "products/all-in-one-solar-street-light.jpg",
        subject: "All-in-One Solar Street Light",
        author: "McKay Savage from London, UK",
        licence: "CC BY",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=23464527",
      },
      {
        file: "products/apfc-panel.jpg",
        subject: "APFC Panel",
        author: "Rubin Observatory/NSF/AURA",
        licence: "CC BY",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=139261067",
      },
      {
        file: "products/cable-accessories.jpg",
        subject: "Cable Jointing Kits & Terminations",
        author: "Dmitry G",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=10998720",
      },
      {
        file: "products/control-cable.jpg",
        subject: "Control & Instrumentation Cable",
        author: "Холдинг 'Кабельный альянс'",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=56633349",
      },
      {
        file: "products/dt-meter.jpg",
        subject: "DT (Distribution Transformer) Meter",
        author: "Zuzu",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=4114675",
      },
      {
        file: "products/earthing-strips-and-lightning-protection.jpg",
        subject: "Earthing Strips & Lightning Protection",
        author: "Asurnipal",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=79634673",
      },
      {
        file: "products/electrical-accessories.jpg",
        subject: "Electrical Installation Accessories",
        author: "Dmitry G",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=10999232",
      },
      {
        file: "products/solar-inverter.jpg",
        subject: "Grid-Tied String Inverter",
        author: "Asurnipal",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=39799185",
      },
      {
        file: "products/high-mast.jpg",
        subject: "High Mast Lighting System",
        author: "OAlexander",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=146179190",
      },
      {
        file: "products/insulator.jpg",
        subject: "HT Line & Post Insulators",
        author: "unknown",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=840191",
      },
      {
        file: "products/ht-panel.jpg",
        subject: "HT Metal-Clad Switchgear Panel",
        author: "Wtshymanski (talk)",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=63338170",
      },
      {
        file: "products/ht-metering-cubicle.jpg",
        subject: "HT Metering Cubicle",
        author: "Ildar Sagdejev (Specious)",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=4948052",
      },
      {
        file: "products/power-cable.jpg",
        subject: "HT XLPE Power Cable",
        author: "Marshelec",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=19784075",
      },
      {
        file: "products/vcb.jpg",
        subject: "Indoor Vacuum Circuit Breaker Panel",
        author: "Jbarnard33",
        licence: "CC BY",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=151313100",
      },
      {
        file: "products/led-street-light.jpg",
        subject: "LED Street Light Luminaire",
        author: "Famartin",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=151212753",
      },
      {
        file: "products/lt-panel.jpg",
        subject: "LT Power Control Centre (PCC) Panel",
        author: "Jbarnard33",
        licence: "CC BY",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=151313101",
      },
      {
        file: "products/lt-xlpe-pvc-power-cable.jpg",
        subject: "LT XLPE & PVC Power Cable",
        author: "Cjp24",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=77364372",
      },
      {
        file: "products/ltct-meter.jpg",
        subject: "LTCT Energy Meter",
        author: "Sokoteshab",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=65344610",
      },
      {
        file: "products/earthing.jpg",
        subject: "Maintenance-Free Earthing Electrode",
        author: "Powerfox",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=81333790",
      },
      {
        file: "products/mccb-mcb-protection-range.jpg",
        subject: "MCCB & MCB Protection Range",
        author: "Balurbala",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=30813249",
      },
      {
        file: "products/motor-control-centre-panel.jpg",
        subject: "Motor Control Centre (MCC) Panel",
        author: "PEO ACWA",
        licence: "CC BY",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=80262818",
      },
      {
        file: "products/transformer.jpg",
        subject: "Oil-Immersed Distribution Transformer",
        author: "Bjoertvedt",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=20449182",
      },
      {
        file: "products/outdoor-pole-mounted-vcb.jpg",
        subject: "Outdoor Pole-Mounted VCB",
        author: "TheEnergeticEngineer",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=70499126",
      },
      {
        file: "products/power-transformer.jpg",
        subject: "Power Transformer up to 220 kV",
        author: "Bob Harvey",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=144896488",
      },
      {
        file: "products/bus-duct.jpg",
        subject: "Sandwich Bus Duct",
        author: "ToT89",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=77637880",
      },
      {
        file: "products/junction-box.jpg",
        subject: "Solar & Electrical Junction Boxes",
        author: "Dmitry G",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=11026257",
      },
      {
        file: "products/ct-operated-smart-meter.jpg",
        subject: "Three Phase CT Operated Smart Meter",
        author: "Asurnipal",
        licence: "CC BY-SA",
        sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=107428944",
      },
    ],
  },
];
