/**
 * Product imagery, imported statically.
 *
 * Importing the file rather than referencing its path by string means Next
 * fingerprints it — the emitted URL is `/_next/static/media/rmu.<hash>.jpg`.
 * When you replace a picture, the hash changes, so browsers and the image
 * optimiser fetch the new file immediately instead of serving a cached copy of
 * the old one. Referencing `/assets/products/rmu.jpg` as a plain string cannot
 * do that: the URL stays identical while the bytes change, and devices end up
 * showing different pictures for the same product depending on when they last
 * loaded the page.
 *
 * To swap in a real photograph: overwrite the file in
 * `public/assets/products/`, keeping the filename, and rebuild.
 */

import type { StaticImageData } from "next/image";

import abCable from "@/public/assets/products/ab-cable.jpg";
import acChargingPoint from "@/public/assets/products/ac-charging-point.jpg";
import allInOneSolarStreetLight from "@/public/assets/products/all-in-one-solar-street-light.jpg";
import apfcPanel from "@/public/assets/products/apfc-panel.jpg";
import bifacialModule from "@/public/assets/products/bifacial-glass-glass-module.jpg";
import busDuct from "@/public/assets/products/bus-duct.jpg";
import cableAccessories from "@/public/assets/products/cable-accessories.jpg";
import castResinTransformer from "@/public/assets/products/cast-resin-dry-type-transformer.jpg";
import controlCable from "@/public/assets/products/control-cable.jpg";
import ctOperatedSmartMeter from "@/public/assets/products/ct-operated-smart-meter.jpg";
import ctPt from "@/public/assets/products/ct-pt.jpg";
import distributionBox from "@/public/assets/products/distribution-box.jpg";
import dtMeter from "@/public/assets/products/dt-meter.jpg";
import earthing from "@/public/assets/products/earthing.jpg";
import earthingStrips from "@/public/assets/products/earthing-strips-and-lightning-protection.jpg";
import electricalAccessories from "@/public/assets/products/electrical-accessories.jpg";
import evChargingStation from "@/public/assets/products/ev-charging-station.jpg";
import highMast from "@/public/assets/products/high-mast.jpg";
import htMeteringCubicle from "@/public/assets/products/ht-metering-cubicle.jpg";
import htPanel from "@/public/assets/products/ht-panel.jpg";
import hybridInverter from "@/public/assets/products/hybrid-off-grid-inverter.jpg";
import insulator from "@/public/assets/products/insulator.jpg";
import junctionBox from "@/public/assets/products/junction-box.jpg";
import ledStreetLight from "@/public/assets/products/led-street-light.jpg";
import ltPanel from "@/public/assets/products/lt-panel.jpg";
import ltXlpePvcCable from "@/public/assets/products/lt-xlpe-pvc-power-cable.jpg";
import ltctMeter from "@/public/assets/products/ltct-meter.jpg";
import mccbMcbRange from "@/public/assets/products/mccb-mcb-protection-range.jpg";
import motorControlCentre from "@/public/assets/products/motor-control-centre-panel.jpg";
import outdoorPoleMountedVcb from "@/public/assets/products/outdoor-pole-mounted-vcb.jpg";
import powerCable from "@/public/assets/products/power-cable.jpg";
import powerTransformer from "@/public/assets/products/power-transformer.jpg";
import rmu from "@/public/assets/products/rmu.jpg";
import smartMeter from "@/public/assets/products/smart-meter.jpg";
import solarInverter from "@/public/assets/products/solar-inverter.jpg";
import solarPanel from "@/public/assets/products/solar-panel.jpg";
import solarStructure from "@/public/assets/products/solar-structure.jpg";
import streetLightPole from "@/public/assets/products/street-light-pole.jpg";
import switchgear from "@/public/assets/products/switchgear.jpg";
import transformer from "@/public/assets/products/transformer.jpg";
import vcb from "@/public/assets/products/vcb.jpg";

/**
 * Pictures belonging to one specific product, keyed by slug.
 *
 * A category image is the right default when a category holds a single
 * product, but where it holds several — an MCC panel and an APFC panel are
 * both "LT Panels" — sharing one picture makes the listing look like the same
 * item repeated. These entries take precedence over `categoryImages` so every
 * product in the catalogue shows its own equipment.
 */
export const productImages: Record<string, StaticImageData> = {
  "cast-resin-dry-type-transformer": castResinTransformer,
  "ht-metering-cubicle": htMeteringCubicle,
  "motor-control-centre-panel": motorControlCentre,
  "apfc-panel": apfcPanel,
  "outdoor-pole-mounted-vcb": outdoorPoleMountedVcb,
  "mccb-mcb-protection-range": mccbMcbRange,
  "ct-operated-smart-meter": ctOperatedSmartMeter,
  "lt-xlpe-pvc-power-cable": ltXlpePvcCable,
  "all-in-one-solar-street-light": allInOneSolarStreetLight,
  "bifacial-glass-glass-module": bifacialModule,
  "hybrid-off-grid-inverter": hybridInverter,
  "ac-charging-point": acChargingPoint,
  "earthing-strips-and-lightning-protection": earthingStrips,
};

/** One image per category, used by any product without an entry above. */
export const categoryImages: Record<string, StaticImageData> = {
  "Distribution Transformers": transformer,
  "Power Transformers": powerTransformer,
  "HT Panels": htPanel,
  "LT Panels": ltPanel,
  "RMU (Ring Main Unit)": rmu,
  "VCB Panels": vcb,
  Switchgear: switchgear,
  "Smart Meters": smartMeter,
  "DT Meters": dtMeter,
  "LTCT Meters": ltctMeter,
  "CT/PT": ctPt,
  "Power Cables": powerCable,
  "Control Cables": controlCable,
  "AB Cables": abCable,
  "Cable Accessories": cableAccessories,
  "Electrical Accessories": electricalAccessories,
  "Junction Boxes": junctionBox,
  "Street Light Poles": streetLightPole,
  "LED Street Lights": ledStreetLight,
  "High Mast Lighting": highMast,
  "EV Charging Stations": evChargingStation,
  "Solar Panels": solarPanel,
  "Solar Inverters": solarInverter,
  "Solar Structures": solarStructure,
  "Earthing Materials": earthing,
  Insulators: insulator,
  "Bus Ducts": busDuct,
  "Distribution Boxes": distributionBox,
};

/** The URL for an image that may be a static import or a plain path. */
export function imageSrc(image: string | StaticImageData | undefined): string {
  if (!image) return "";
  return typeof image === "string" ? image : image.src;
}
