/**
 * Product catalogue.
 *
 * This file is the single source of truth for everything on `/products`. To add
 * a product, append an entry to `products` below — the listing, filters,
 * search, detail page, sitemap and related-product logic all derive from it.
 * No component needs to change.
 *
 * To add a *category*, add its name to the relevant group in `productGroups`
 * first, then use that exact string as the product's `category`.
 *
 * Photographs are optional. Drop a file into `public/assets/products/` and set
 * `image: "/assets/products/<file>.jpg"`; until then the branded vector
 * artwork in `components/ui/Illustration.tsx` is shown instead, so the layout
 * never breaks. Datasheets work the same way — set `datasheet` once the PDF
 * exists in `public/assets/products/datasheets/`.
 */

import { categoryImages, productImages } from "./product-images";
import type { Product } from "./types";

/* -------------------------------------------------------------------------- */
/*  Categories                                                                 */
/* -------------------------------------------------------------------------- */

export interface ProductGroup {
  title: string;
  categories: string[];
}

/** Categories, arranged into the groups used by the filter sidebar. */
export const productGroups: ProductGroup[] = [
  {
    title: "Transformers",
    categories: ["Distribution Transformers", "Power Transformers"],
  },
  {
    title: "Panels & Switchgear",
    categories: [
      "HT Panels",
      "LT Panels",
      "RMU (Ring Main Unit)",
      "VCB Panels",
      "Switchgear",
      "Bus Ducts",
      "Distribution Boxes",
    ],
  },
  {
    title: "Metering & Instrument Transformers",
    categories: ["Smart Meters", "DT Meters", "LTCT Meters", "CT/PT"],
  },
  {
    title: "Cables & Accessories",
    categories: [
      "Power Cables",
      "Control Cables",
      "AB Cables",
      "Cable Accessories",
      "Electrical Accessories",
      "Junction Boxes",
    ],
  },
  {
    title: "Lighting & Poles",
    categories: [
      "Street Light Poles",
      "LED Street Lights",
      "High Mast Lighting",
    ],
  },
  {
    title: "Solar & EV",
    categories: [
      "Solar Panels",
      "Solar Inverters",
      "Solar Structures",
      "EV Charging Stations",
    ],
  },
  {
    title: "Substation Materials",
    categories: ["Earthing Materials", "Insulators"],
  },
];

/** Flat list of every category, in group order. */
export const productCategories: string[] = productGroups.flatMap(
  (g) => g.categories
);

/* -------------------------------------------------------------------------- */
/*  Products                                                                   */
/* -------------------------------------------------------------------------- */

const catalogue: Product[] = [
  /* ----------------------------------------------------- Transformers */
  {
    id: "p01",
    slug: "oil-immersed-distribution-transformer",
    name: "Oil-Immersed Distribution Transformer",
    category: "Distribution Transformers",
    shortDescription:
      "Sealed corrugated-tank distribution transformers from 25 kVA to 2500 kVA, built to IS 1180 loss levels.",
    fullDescription:
      "Our oil-immersed distribution transformers are wound with electrolytic-grade copper or aluminium and assembled in sealed corrugated tanks that need no conservator and lose no oil to breathing. Every unit is routine tested for ratio, vector group, no-load and load losses, insulation resistance and separate-source withstand before dispatch, and is supplied with a full test certificate and rating plate to the ordered specification.",
    specifications: [
      { label: "Rating", value: "25 kVA – 2500 kVA" },
      { label: "Voltage class", value: "11/0.433 kV, 33/0.433 kV" },
      { label: "Vector group", value: "Dyn11 (others on request)" },
      { label: "Cooling", value: "ONAN, sealed corrugated tank" },
      { label: "Winding", value: "Copper or aluminium, class A insulation" },
      { label: "Standard", value: "IS 1180 Level 2 / IS 2026" },
    ],
    applications: [
      "Urban and rural distribution feeders",
      "Industrial and captive plant substations",
      "Housing societies, townships and commercial complexes",
      "Auxiliary supply for solar and infrastructure sites",
    ],
    illustration: "transformer",
    featured: true,
  },
  {
    id: "p02",
    slug: "cast-resin-dry-type-transformer",
    name: "Cast Resin Dry Type Transformer",
    category: "Distribution Transformers",
    shortDescription:
      "Oil-free vacuum-cast transformers for indoor installations where fire load must stay low.",
    fullDescription:
      "Cast resin transformers carry no oil, so they can be installed inside basements, plant rooms and occupied buildings without a fire wall or oil-containment pit. Windings are vacuum cast in epoxy, giving a self-extinguishing, moisture-resistant unit with class F insulation and excellent short-circuit strength. Forced-air cooling raises the continuous rating by up to 40% when the load profile demands it.",
    specifications: [
      { label: "Rating", value: "100 kVA – 3150 kVA" },
      { label: "Voltage class", value: "Up to 33 kV" },
      { label: "Insulation class", value: "Class F (155 °C)" },
      { label: "Cooling", value: "AN / AF with fan kit" },
      { label: "Enclosure", value: "IP23 sheet-steel enclosure, optional" },
      { label: "Standard", value: "IS 11171 / IEC 60076-11" },
    ],
    applications: [
      "Hospitals, hotels, malls and high-rise buildings",
      "Basement and indoor substations",
      "Metro stations, airports and tunnels",
      "Data centres and clean-room facilities",
    ],
    illustration: "transformer",
  },
  {
    id: "p03",
    slug: "power-transformer",
    name: "Power Transformer up to 220 kV",
    category: "Power Transformers",
    shortDescription:
      "Oil-filled power transformers from 5 MVA to 100 MVA with on-load tap changing.",
    fullDescription:
      "Power transformers for transmission and heavy industrial duty, supplied with on-load tap changers, Buchholz and oil-surge relays, winding and oil temperature indicators, and marshalling boxes wired to your protection scheme. We handle the complete package — factory acceptance testing, transport, erection, oil filtration to the required BDV, pre-charging tests and energisation with the utility.",
    specifications: [
      { label: "Rating", value: "5 MVA – 100 MVA" },
      { label: "Voltage class", value: "33 kV / 66 kV / 132 kV / 220 kV" },
      { label: "Cooling", value: "ONAN / ONAF / OFAF" },
      { label: "Tap changer", value: "OLTC ±10% in 17 steps" },
      { label: "Bushings", value: "Porcelain or OIP condenser type" },
      { label: "Standard", value: "IS 2026 / IEC 60076" },
    ],
    applications: [
      "Utility transmission and pooling substations",
      "Captive generation and heavy industry",
      "Solar and wind evacuation schemes",
      "Furnace and rolling-mill feeds",
    ],
    illustration: "transformer",
  },

  /* ------------------------------------------------ Panels & switchgear */
  {
    id: "p04",
    slug: "ht-metal-clad-switchgear-panel",
    name: "HT Metal-Clad Switchgear Panel",
    category: "HT Panels",
    shortDescription:
      "Indoor draw-out HT switchboards at 11 kV and 33 kV with numerical protection.",
    fullDescription:
      "Metal-clad, compartmentalised HT switchboards with draw-out vacuum breakers, integral earthing switch and full interlocking, so no operation can be carried out in the wrong sequence. Each panel is supplied with numerical relays configured to your protection philosophy, a wired control scheme and internal arc-fault classification where the specification calls for it.",
    specifications: [
      { label: "Rated voltage", value: "11 kV / 33 kV" },
      { label: "Busbar rating", value: "630 A – 2500 A" },
      { label: "Short-circuit rating", value: "25 kA / 31.5 kA for 3 s" },
      { label: "Construction", value: "Indoor, metal-clad, draw-out truck" },
      { label: "Protection", value: "Numerical IDMT, differential, REF" },
      { label: "Standard", value: "IS 3427 / IEC 62271-200" },
    ],
    applications: [
      "Substation incomer and outgoing feeder control",
      "Industrial HT distribution boards",
      "Solar plant pooling stations",
      "Commercial and institutional campuses",
    ],
    illustration: "substation",
  },
  {
    id: "p05",
    slug: "ht-metering-cubicle",
    name: "HT Metering Cubicle",
    category: "HT Panels",
    shortDescription:
      "Sealed HT metering kiosks with class 0.2S instrument transformers for boundary metering.",
    fullDescription:
      "Utility-approved HT metering cubicles housing metering-class current and potential transformers, test terminal blocks and the energy meter itself, all behind sealed covers. Built for the boundary point between the utility and the consumer, they are supplied with calibration certificates and are dimensioned to suit the local DISCOM's approved drawing.",
    specifications: [
      { label: "Rated voltage", value: "11 kV / 33 kV" },
      { label: "Metering accuracy", value: "Class 0.2S" },
      { label: "Instrument transformers", value: "Resin-cast metering CT & PT" },
      { label: "Construction", value: "Indoor cubicle or outdoor kiosk" },
      { label: "Sealing", value: "Utility-sealable covers and TTB" },
      { label: "Standard", value: "IS 3156 / IS 2705 / IS 3427" },
    ],
    applications: [
      "HT consumer boundary metering",
      "DISCOM interface points",
      "Captive generation export metering",
      "HT-side solar net metering",
    ],
    illustration: "metering",
  },
  {
    id: "p06",
    slug: "lt-power-control-centre-panel",
    name: "LT Power Control Centre (PCC) Panel",
    category: "LT Panels",
    shortDescription:
      "Form 3b and Form 4b LT switchboards rated to 6300 A with 50 kA fault withstand.",
    fullDescription:
      "Type-tested LT power control centres built on a modular CRCA frame with silver-plated aluminium or copper busbars, sized for the site's fault level and ambient temperature. Compartmentalisation to Form 3b or Form 4b keeps outgoing feeders isolated from the busbar chamber, so a single feeder can be worked on without shutting the board down.",
    specifications: [
      { label: "System", value: "415 V, 3 phase, 4 wire, 50 Hz" },
      { label: "Busbar rating", value: "630 A – 6300 A" },
      { label: "Fault level", value: "50 kA for 1 s" },
      { label: "Form of separation", value: "Form 3b / Form 4b" },
      { label: "Degree of protection", value: "IP42 indoor / IP54 outdoor" },
      { label: "Standard", value: "IS/IEC 61439-1 & 2" },
    ],
    applications: [
      "Main LT distribution in plants and factories",
      "Substation LT side and transformer outgoing",
      "Commercial buildings and hospitals",
      "Infrastructure and utility projects",
    ],
    illustration: "automation",
  },
  {
    id: "p07",
    slug: "motor-control-centre-panel",
    name: "Motor Control Centre (MCC) Panel",
    category: "LT Panels",
    shortDescription:
      "Fixed and draw-out motor control centres with DOL, star-delta, soft-start and VFD modules.",
    fullDescription:
      "Motor control centres engineered around your process load list, with each starter module sized, protected and labelled to the schedule. Draw-out construction allows a module to be withdrawn and replaced without de-energising the bus, which keeps plant downtime to minutes. Control wiring is ferruled and terminated on a marshalling section ready for the PLC interface.",
    specifications: [
      { label: "System", value: "415 V, 3 phase, 50 Hz" },
      { label: "Busbar rating", value: "Up to 4000 A" },
      { label: "Starter types", value: "DOL, star-delta, soft starter, VFD" },
      { label: "Construction", value: "Fixed, semi draw-out or draw-out" },
      { label: "Control supply", value: "240 V AC / 24 V DC with MCB" },
      { label: "Standard", value: "IS/IEC 61439-2" },
    ],
    applications: [
      "Process plant motor control",
      "Pump houses and water treatment plants",
      "Conveyor and material-handling systems",
      "HVAC and utility plant rooms",
    ],
    illustration: "automation",
  },
  {
    id: "p08",
    slug: "apfc-panel",
    name: "APFC Panel",
    category: "LT Panels",
    shortDescription:
      "Automatic power factor correction panels from 25 kVAr to 1000 kVAr, with detuned options.",
    fullDescription:
      "Automatic power factor correction panels that hold the power factor at your target through the day, switching capacitor steps on a microprocessor controller as the load moves. Where the installation carries drives, UPS or LED lighting, detuned reactors are fitted to keep harmonic currents out of the capacitors and protect them from resonance. The result shows up directly on the utility bill.",
    specifications: [
      { label: "Rating", value: "25 kVAr – 1000 kVAr" },
      { label: "Steps", value: "6 / 8 / 12 stage" },
      { label: "Capacitors", value: "Heavy-duty cylindrical or APP type" },
      { label: "Switching", value: "Contactor or thyristor (real time)" },
      { label: "Detuning", value: "7% / 14% reactors, optional" },
      { label: "Standard", value: "IS 13340 / IS 13925" },
    ],
    applications: [
      "Power factor penalty elimination",
      "Maximum demand reduction",
      "Harmonic-rich industrial installations",
      "Commercial and institutional supplies",
    ],
    illustration: "energy",
  },
  {
    id: "p09",
    slug: "sf6-ring-main-unit",
    name: "SF6 Ring Main Unit (RMU)",
    category: "RMU (Ring Main Unit)",
    shortDescription:
      "Sealed-for-life gas-insulated ring main units in 2, 3 and 4-way configurations.",
    fullDescription:
      "Compact ring main units with the switching functions sealed inside a stainless-steel SF6 tank, so performance does not drift with dust, damp or salt in the air. Ring switches and tee-off breakers can be motorised and fitted with an RTU for feeder automation, letting the control room isolate a faulted section without a truck roll. Footprint is small enough for a kiosk or a basement substation.",
    specifications: [
      { label: "Rated voltage", value: "11 kV / 22 kV / 33 kV" },
      { label: "Configuration", value: "2, 3 and 4 way (CC, CCF, CCV)" },
      { label: "Ring current", value: "630 A ring, 200 A tee-off" },
      { label: "Short-circuit rating", value: "21 kA for 3 s" },
      { label: "Insulation", value: "SF6, sealed for life" },
      { label: "Standard", value: "IEC 62271-200 / IEC 62271-105" },
    ],
    applications: [
      "Underground HT ring distribution",
      "Townships, IT parks and campuses",
      "Metro, airport and hospital networks",
      "Solar plant feeder switching",
    ],
    illustration: "htlt",
    featured: true,
  },
  {
    id: "p10",
    slug: "indoor-vcb-panel",
    name: "Indoor Vacuum Circuit Breaker Panel",
    category: "VCB Panels",
    shortDescription:
      "Draw-out indoor VCB panels rated 630 A to 2500 A with 31.5 kA breaking capacity.",
    fullDescription:
      "Vacuum circuit breakers switch in a sealed interrupter, so the contacts do not oxidise and the maintenance interval runs into thousands of operations. Supplied on a draw-out truck with motor-wound spring mechanism, anti-pumping relay and trip-circuit supervision, the panel is wired for local and remote control and can be integrated with substation SCADA.",
    specifications: [
      { label: "Rated voltage", value: "11 kV / 33 kV" },
      { label: "Rated current", value: "630 A – 2500 A" },
      { label: "Breaking capacity", value: "25 / 31.5 / 40 kA" },
      { label: "Mechanism", value: "Motor-wound spring, draw-out truck" },
      { label: "Control supply", value: "30 V / 110 V / 220 V DC" },
      { label: "Standard", value: "IEC 62271-100" },
    ],
    applications: [
      "Substation incomers and bus couplers",
      "Transformer and feeder protection",
      "Capacitor bank switching duty",
      "Industrial HT distribution",
    ],
    illustration: "substation",
  },
  {
    id: "p11",
    slug: "outdoor-pole-mounted-vcb",
    name: "Outdoor Pole-Mounted VCB",
    category: "VCB Panels",
    shortDescription:
      "Weatherproof pole-mounted vacuum breakers for overhead feeder sectionalising.",
    fullDescription:
      "Pole-mounted vacuum circuit breakers let an overhead network be sectionalised so a fault takes out one section instead of the whole feeder. Housed in a stainless enclosure with integral current sensors and a relay control box at working height, they can be supplied with auto-reclose logic and a communication module for remote operation from the control centre.",
    specifications: [
      { label: "Rated voltage", value: "11 kV / 33 kV" },
      { label: "Rated current", value: "630 A" },
      { label: "Breaking capacity", value: "12.5 / 16 kA" },
      { label: "Operation", value: "Manual, remote and auto-reclose" },
      { label: "Enclosure", value: "Stainless steel, IP65" },
      { label: "Standard", value: "IEC 62271-111" },
    ],
    applications: [
      "Rural and semi-urban feeder sectionalising",
      "Overhead line fault isolation",
      "Auto-reclose and recloser schemes",
      "Distribution feeder automation",
    ],
    illustration: "utility",
  },
  {
    id: "p12",
    slug: "air-circuit-breaker",
    name: "Air Circuit Breaker (ACB)",
    category: "Switchgear",
    shortDescription:
      "Draw-out ACBs from 630 A to 6300 A with microprocessor LSIG releases.",
    fullDescription:
      "Air circuit breakers for LT incomers, bus couplers and large outgoing feeders, supplied with microprocessor releases offering long-time, short-time, instantaneous and earth-fault protection with settable curves. Communication modules make the breaker a metering point in its own right, reporting current, energy and trip history to the plant SCADA.",
    specifications: [
      { label: "Rated current", value: "630 A – 6300 A" },
      { label: "Rated voltage", value: "415 V / 690 V AC" },
      { label: "Breaking capacity", value: "50 kA – 100 kA" },
      { label: "Poles", value: "3 pole / 4 pole" },
      { label: "Release", value: "Microprocessor LSIG with LCD" },
      { label: "Standard", value: "IS/IEC 60947-2" },
    ],
    applications: [
      "LT panel incomers and bus couplers",
      "Generator and transformer breakers",
      "Large feeder and busbar protection",
      "Changeover and synchronising schemes",
    ],
    illustration: "automation",
  },
  {
    id: "p13",
    slug: "mccb-mcb-protection-range",
    name: "MCCB & MCB Protection Range",
    category: "Switchgear",
    shortDescription:
      "Moulded case and miniature circuit breakers, RCCBs and isolators for every final circuit.",
    fullDescription:
      "A complete final-circuit protection range from a single approved make, so discrimination between the MCB, the MCCB upstream and the incoming ACB actually holds when a fault occurs. Supplied with the accessories that installations really need — shunt trips, auxiliary contacts, under-voltage releases, rotary handles and terminal shrouds.",
    specifications: [
      { label: "MCCB range", value: "16 A – 1600 A, 25 – 70 kA" },
      { label: "MCB range", value: "0.5 A – 125 A, 10 kA" },
      { label: "Tripping curves", value: "B, C and D characteristic" },
      { label: "RCCB sensitivity", value: "30 mA / 100 mA / 300 mA" },
      { label: "Accessories", value: "Shunt trip, aux contact, UV release" },
      { label: "Standard", value: "IS/IEC 60898 & IS/IEC 60947" },
    ],
    applications: [
      "Final circuit and sub-distribution protection",
      "Earth-leakage protection in buildings",
      "Panel internal and control circuit protection",
      "Retrofit of ageing rewirable protection",
    ],
    illustration: "supply",
  },
  {
    id: "p14",
    slug: "sandwich-bus-duct",
    name: "Sandwich Bus Duct",
    category: "Bus Ducts",
    shortDescription:
      "Compact busbar trunking from 400 A to 6300 A for transformer links and building risers.",
    fullDescription:
      "Sandwich construction busbar trunking replaces large parallel cable runs with a compact, low-impedance link that is easier to route, quicker to install and far simpler to tap into later. Epoxy-insulated conductors are clamped face to face, which keeps the voltage drop and the magnetic field low, and plug-in tap-off boxes let floors be fed without cutting the run.",
    specifications: [
      { label: "Rated current", value: "400 A – 6300 A" },
      { label: "Rated voltage", value: "415 V / 690 V" },
      { label: "Conductor", value: "Aluminium or copper, epoxy insulated" },
      { label: "Short-circuit rating", value: "50 kA – 100 kA" },
      { label: "Degree of protection", value: "IP55 indoor / IP66 outdoor" },
      { label: "Standard", value: "IEC 61439-6" },
    ],
    applications: [
      "Transformer to LT panel links",
      "Vertical risers in high-rise buildings",
      "Plant and shop-floor power distribution",
      "Data centre power distribution",
    ],
    illustration: "industrial",
  },
  {
    id: "p15",
    slug: "lt-distribution-and-feeder-pillar-box",
    name: "LT Distribution & Feeder Pillar Box",
    category: "Distribution Boxes",
    shortDescription:
      "Indoor distribution boards and outdoor feeder pillars from 4 to 24 ways.",
    fullDescription:
      "Distribution boards and feeder pillars for the last stage of the network, built in CRCA, SMC or polycarbonate depending on where they will stand. Outdoor pillars are supplied with a rain canopy, gasketed door, padlockable handle and a pre-drilled gland plate, and are hot-dip galvanised or powder coated for coastal and industrial atmospheres.",
    specifications: [
      { label: "Type", value: "SPN / TPN DB, feeder pillar, meter box" },
      { label: "Ways", value: "4 – 24 way" },
      { label: "Enclosure", value: "CRCA powder coated, SMC or PC" },
      { label: "Degree of protection", value: "IP42 indoor / IP54 – IP65 outdoor" },
      { label: "Protection modules", value: "MCB, MCCB, RCCB, isolator" },
      { label: "Standard", value: "IS/IEC 61439-3" },
    ],
    applications: [
      "Final circuit distribution in buildings",
      "Street lighting feeder pillars",
      "Site temporary and construction supply",
      "Society, campus and market metering points",
    ],
    illustration: "automation",
  },

  /* ---------------------------------------------------------- Metering */
  {
    id: "p16",
    slug: "single-three-phase-smart-meter",
    name: "Single & Three Phase Smart Meter",
    category: "Smart Meters",
    shortDescription:
      "DLMS-compliant prepaid smart meters with remote connect, disconnect and TOD billing.",
    fullDescription:
      "Whole-current smart meters built to the IS 16444 specification, supporting prepaid and postpaid modes, time-of-day tariffs, remote connection and disconnection, and a complete tamper and event log. Communication is available over RF mesh, cellular or NB-IoT, and the meter speaks DLMS/COSEM so it integrates with any compliant head-end system without custom drivers.",
    specifications: [
      { label: "Type", value: "Whole current, 10-60 A / 10-100 A" },
      { label: "Accuracy class", value: "Class 1.0 / 0.5S" },
      { label: "Communication", value: "RF mesh, 2G/4G cellular, NB-IoT" },
      { label: "Features", value: "Prepaid, remote connect/disconnect, TOD" },
      { label: "Protocol", value: "DLMS/COSEM as per IS 15959" },
      { label: "Standard", value: "IS 16444 / IS 13779" },
    ],
    applications: [
      "DISCOM advanced metering infrastructure roll-outs",
      "Prepaid billing for societies and townships",
      "Sub-metering in commercial and industrial parks",
      "Net metering for rooftop solar consumers",
    ],
    illustration: "metering",
    featured: true,
  },
  {
    id: "p17",
    slug: "ct-operated-smart-meter",
    name: "Three Phase CT Operated Smart Meter",
    category: "Smart Meters",
    shortDescription:
      "Class 0.5S CT and CT-VT operated smart meters for HT and bulk LT consumers.",
    fullDescription:
      "For connections too large to meter directly, these CT and CT-VT operated meters record consumption at class 0.5S accuracy with a full load survey, maximum demand register and tamper log. RS-485 and cellular modem options push the data to the head-end system automatically, so the monthly reading visit and the disputes that follow it simply disappear.",
    specifications: [
      { label: "Type", value: "CT operated / CT-VT operated" },
      { label: "Accuracy class", value: "Class 0.5S / 0.2S" },
      { label: "Secondary current", value: "5 A or 1 A" },
      { label: "Communication", value: "RS-485, GPRS / 4G modem, optical port" },
      { label: "Data", value: "Load survey, MD, TOD, tamper events" },
      { label: "Standard", value: "IS 16444 Part 2 / IS 14697" },
    ],
    applications: [
      "HT and bulk LT industrial consumer metering",
      "Boundary and feeder-level metering",
      "Captive generation and export accounting",
      "Energy audit and check-metering points",
    ],
    illustration: "metering",
  },
  {
    id: "p18",
    slug: "dt-meter",
    name: "DT (Distribution Transformer) Meter",
    category: "DT Meters",
    shortDescription:
      "Weatherproof transformer-level meters that expose loss and overload feeder by feeder.",
    fullDescription:
      "A DT meter measures what actually leaves the transformer, so energy sent out can be compared with energy billed and the loss on that section becomes a number rather than an argument. Housed in an IP54 pillar box for pole or plinth mounting, it logs load survey data, phase currents, outage events and tamper alarms, and pushes them over GPRS or RF to the utility's system.",
    specifications: [
      { label: "Type", value: "Three phase, CT operated or whole current" },
      { label: "Accuracy class", value: "Class 0.5S" },
      { label: "Communication", value: "GPRS / RF with integrated modem" },
      { label: "Mounting", value: "Pole or plinth, IP54 enclosure" },
      { label: "Data", value: "Load survey, outage, overload, tamper" },
      { label: "Standard", value: "IS 14697 / IS 15959" },
    ],
    applications: [
      "Feeder and transformer level energy accounting",
      "AT&C loss measurement and reduction",
      "Transformer overload and failure prediction",
      "Distribution network performance monitoring",
    ],
    illustration: "metering",
  },
  {
    id: "p19",
    slug: "ltct-energy-meter",
    name: "LTCT Energy Meter",
    category: "LTCT Meters",
    shortDescription:
      "LT CT operated multifunction meters for bulk commercial and industrial connections.",
    fullDescription:
      "LTCT meters serve connections where the current is beyond a whole-current meter but the supply is still at low tension. Supplied with matched class 0.5S current transformers and a sealed test terminal block, they display and log every parameter an energy manager needs — kWh, kVAh, kVA demand, power factor, phase voltages and currents — with time-of-day registers for tariff verification.",
    specifications: [
      { label: "Type", value: "Three phase, LT CT operated" },
      { label: "Secondary current", value: "5 A or 1 A" },
      { label: "CT ratio", value: "Up to 800/5 A" },
      { label: "Accuracy class", value: "Class 0.5S / 1.0" },
      { label: "Display", value: "Multi-parameter LCD with TOD registers" },
      { label: "Standard", value: "IS 14697" },
    ],
    applications: [
      "LT industrial and commercial connections",
      "Bulk consumer and mall main metering",
      "Society and campus internal billing",
      "Departmental sub-metering and energy audits",
    ],
    illustration: "metering",
  },
  {
    id: "p20",
    slug: "current-and-potential-transformers",
    name: "Current & Potential Transformers (CT/PT)",
    category: "CT/PT",
    shortDescription:
      "Resin-cast and oil-filled instrument transformers for metering and protection duty.",
    fullDescription:
      "Instrument transformers supplied to the ratio, burden and accuracy class your scheme actually requires — metering cores at class 0.2S or 0.5S, protection cores at 5P10 or 5P20 with the knee-point voltage calculated for the relay and lead burden. Every unit is routine tested for ratio, polarity and insulation, and supplied with its own test certificate.",
    specifications: [
      { label: "Voltage class", value: "415 V to 33 kV" },
      { label: "CT ratio", value: "50/5 A to 2000/5 A" },
      { label: "Accuracy class", value: "0.2S / 0.5S metering, 5P10 / 5P20 protection" },
      { label: "Burden", value: "5 VA – 30 VA" },
      { label: "Insulation", value: "Resin cast or oil filled" },
      { label: "Standard", value: "IS 2705 / IS 3156 / IEC 61869" },
    ],
    applications: [
      "Metering and protection circuits",
      "Panel instrumentation and transducers",
      "Substation protection schemes",
      "Energy audit and check metering",
    ],
    illustration: "energy",
  },

  /* ------------------------------------------------ Cables & accessories */
  {
    id: "p21",
    slug: "ht-xlpe-power-cable",
    name: "HT XLPE Power Cable",
    category: "Power Cables",
    shortDescription:
      "3.3 kV to 33 kV XLPE cables with extruded semiconducting screens, in aluminium or copper.",
    fullDescription:
      "High-tension XLPE cables built with triple-extruded conductor screen, insulation and insulation screen, so there are no voids at the interfaces where partial discharge starts. Available earthed and unearthed grade, armoured or unarmoured, with FRLS or HDPE outer sheath for direct burial. Supplied on drums cut to your route length with test certificates and jointing kits to match.",
    specifications: [
      { label: "Voltage grade", value: "3.3 kV – 33 kV (E / UE)" },
      { label: "Conductor", value: "Aluminium or copper, stranded compacted" },
      { label: "Size range", value: "25 sq mm – 630 sq mm" },
      { label: "Insulation", value: "XLPE, triple-extruded screens" },
      { label: "Armour", value: "Aluminium wire or strip" },
      { label: "Standard", value: "IS 7098 Part 2 / IEC 60502-2" },
    ],
    applications: [
      "Substation to distribution feeder runs",
      "Underground HT ring networks",
      "Industrial plant HT distribution",
      "Solar plant power evacuation",
    ],
    illustration: "htlt",
  },
  {
    id: "p22",
    slug: "lt-xlpe-pvc-power-cable",
    name: "LT XLPE & PVC Power Cable",
    category: "Power Cables",
    shortDescription:
      "1.1 kV grade armoured and unarmoured cables from 1.5 to 630 sq mm.",
    fullDescription:
      "Low-tension power cables in XLPE or PVC insulation, single core through to four core with reduced neutral, sized against the actual load current, route length and voltage drop rather than a rule of thumb. FRLS and LSZH sheath options are available where the cable runs through occupied buildings and smoke is a life-safety issue.",
    specifications: [
      { label: "Voltage grade", value: "1.1 kV" },
      { label: "Cores", value: "1 to 4 core, with reduced neutral option" },
      { label: "Size range", value: "1.5 sq mm – 630 sq mm" },
      { label: "Insulation", value: "XLPE or PVC, FRLS / LSZH sheath option" },
      { label: "Armour", value: "GI round wire or strip" },
      { label: "Standard", value: "IS 7098 Part 1 / IS 1554 Part 1" },
    ],
    applications: [
      "LT distribution networks and feeders",
      "Panel to load and motor feeders",
      "Street lighting and external services",
      "Building and plant power wiring",
    ],
    illustration: "htlt",
  },
  {
    id: "p23",
    slug: "control-and-instrumentation-cable",
    name: "Control & Instrumentation Cable",
    category: "Control Cables",
    shortDescription:
      "Multicore screened control and signal cables from 2 to 61 cores.",
    fullDescription:
      "Control and instrumentation cables with individual and overall aluminium-mylar screening, drain wire and colour-coded cores, so signal runs stay clean alongside power cables. Ferruled, screened and correctly earthed at one end only, these are the cables that keep a 4-20 mA loop stable and a protection scheme free of spurious trips.",
    specifications: [
      { label: "Voltage grade", value: "1.1 kV" },
      { label: "Cores", value: "2 to 61 core" },
      { label: "Size range", value: "0.5 sq mm – 6 sq mm" },
      { label: "Screening", value: "Individual and/or overall Al-mylar with drain" },
      { label: "Sheath", value: "PVC, FRLS or LSZH" },
      { label: "Standard", value: "IS 1554 / IS 694" },
    ],
    applications: [
      "Panel control and interlock wiring",
      "PLC and SCADA signal runs",
      "Protection relay and tripping circuits",
      "Field instrumentation loops",
    ],
    illustration: "automation",
  },
  {
    id: "p24",
    slug: "aerial-bunched-cable",
    name: "Aerial Bunched (AB) Cable",
    category: "AB Cables",
    shortDescription:
      "Insulated overhead LT and HT bunched cables that end hooking and phase-to-phase faults.",
    fullDescription:
      "Aerial bunched cable replaces bare overhead conductor with insulated cores twisted around an AAAC messenger, which removes the two biggest sources of LT loss and outage — direct hooking and conductors clashing in the wind. UV-stabilised XLPE insulation holds up in Indian summers, and an integral street-light core can be run in the same bundle.",
    specifications: [
      { label: "Voltage grade", value: "1.1 kV / 11 kV" },
      { label: "Conductor", value: "Aluminium cores on AAAC messenger" },
      { label: "Size range", value: "16 sq mm – 150 sq mm" },
      { label: "Configuration", value: "3 phase + messenger + street light core" },
      { label: "Insulation", value: "UV-stabilised, weather-resistant XLPE" },
      { label: "Standard", value: "IS 14255" },
    ],
    applications: [
      "LT overhead distribution networks",
      "Theft-prone and congested localities",
      "Rural electrification schemes",
      "Street lighting distribution feeders",
    ],
    illustration: "utility",
  },
  {
    id: "p25",
    slug: "cable-jointing-kits-and-terminations",
    name: "Cable Jointing Kits & Terminations",
    category: "Cable Accessories",
    shortDescription:
      "Heat shrink, cold shrink and push-on kits for 1.1 kV to 33 kV cables, with lugs and glands.",
    fullDescription:
      "Termination and jointing kits matched to the exact cable construction, voltage grade and conductor size, because a kit that nearly fits is the most common cause of a cable failure two monsoons later. Heat shrink, cold shrink and push-on types are stocked for indoor and outdoor terminations and straight-through joints, complete with stress control, lugs and earthing braid.",
    specifications: [
      { label: "Kit types", value: "Heat shrink, cold shrink, push-on" },
      { label: "Voltage grade", value: "1.1 kV – 33 kV" },
      { label: "Application", value: "Indoor / outdoor termination, straight joint" },
      { label: "Lugs & ferrules", value: "Copper and bimetallic, 6 – 630 sq mm" },
      { label: "Glands", value: "Brass double compression, IP68" },
      { label: "Standard", value: "IS 13573 / IEC 60502" },
    ],
    applications: [
      "HT and LT cable terminations at panels",
      "Straight-through joints and route extensions",
      "Emergency cable fault repairs",
      "Transformer and switchgear terminations",
    ],
    illustration: "supply",
  },
  {
    id: "p26",
    slug: "electrical-installation-accessories",
    name: "Electrical Installation Accessories",
    category: "Electrical Accessories",
    shortDescription:
      "Trays, glands, lugs, conduits, modular wiring devices and the consumables a site runs on.",
    fullDescription:
      "The long tail of items that decide whether an installation looks and behaves professional — cable trays and raceways sized for the run, brass glands of the right thread and bore, tinned lugs, PVC and GI conduit, junction accessories and modular switch and socket ranges. Supplied against your BOQ from approved makes, with the certificates institutional buyers need.",
    specifications: [
      { label: "Cable trays", value: "GI / perforated / ladder, 50 – 900 mm" },
      { label: "Glands", value: "Brass double compression, IP68" },
      { label: "Lugs & ferrules", value: "Copper, aluminium and bimetallic" },
      { label: "Conduits", value: "PVC and GI, 20 – 50 mm with accessories" },
      { label: "Wiring devices", value: "Modular switches, sockets and plates" },
      { label: "Standard", value: "IS 12943 / IS 3480 / IS 3854" },
    ],
    applications: [
      "Panel and cable terminations",
      "Cable routing, support and containment",
      "Building and campus electrification",
      "Site installation and maintenance stock",
    ],
    illustration: "supply",
  },
  {
    id: "p27",
    slug: "junction-boxes",
    name: "Solar & Electrical Junction Boxes",
    category: "Junction Boxes",
    shortDescription:
      "IP65 and IP66 string combiner and field junction boxes with fuses, SPD and isolator.",
    fullDescription:
      "Array junction and string combiner boxes built in FRP, polycarbonate or powder-coated steel to survive outdoors for the life of the plant. Each box carries fused positive and negative inputs, a surge protection device and a load-break isolator, with clear polarity marking and a schematic pasted inside the lid so a technician can work on it safely years later.",
    specifications: [
      { label: "Type", value: "Array / string combiner, field junction box" },
      { label: "String inputs", value: "4 to 24 strings" },
      { label: "Enclosure", value: "FRP, polycarbonate or powder-coated MS" },
      { label: "Degree of protection", value: "IP65 / IP66" },
      { label: "Protection", value: "DC fuses, Type 2 SPD, DC isolator" },
      { label: "Standard", value: "IEC 61439 / IS 13947" },
    ],
    applications: [
      "Solar array string combining",
      "Outdoor distribution and tap-off points",
      "Street lighting and feeder junctions",
      "Industrial field wiring junctions",
    ],
    illustration: "solar",
  },

  /* ------------------------------------------------- Lighting and poles */
  {
    id: "p28",
    slug: "galvanised-street-light-pole",
    name: "Galvanised Street Light Pole",
    category: "Street Light Poles",
    shortDescription:
      "Octagonal, conical and swaged tubular poles from 6 m to 12 m, hot-dip galvanised.",
    fullDescription:
      "Street lighting poles rolled from high-tensile steel and hot-dip galvanised to 65-85 microns, which is what decides whether a pole is still sound at year fifteen or rusting at the base at year five. Supplied with single or double arm brackets, base plate or direct-buried root, an inspection door with a lockable cover and a factory-fitted earthing terminal.",
    specifications: [
      { label: "Height", value: "6 m – 12 m" },
      { label: "Section", value: "Octagonal, conical or swaged tubular" },
      { label: "Material", value: "S355 / IS 2062 steel" },
      { label: "Galvanising", value: "Hot dip, 65-85 micron to IS 2629" },
      { label: "Bracket", value: "Single or double arm, 1 m – 2 m" },
      { label: "Standard", value: "IS 2713 / EN 40" },
    ],
    applications: [
      "Urban roads, highways and service lanes",
      "Township and society internal roads",
      "Industrial and institutional campuses",
      "Parking areas and public spaces",
    ],
    illustration: "street-light",
  },
  {
    id: "p29",
    slug: "led-street-light-luminaire",
    name: "LED Street Light Luminaire",
    category: "LED Street Lights",
    shortDescription:
      "20 W to 250 W IP66 luminaires at up to 150 lm/W, CCMS and smart-control ready.",
    fullDescription:
      "Die-cast aluminium LED street light luminaires with a toughened glass cover, IP66 sealing and a driver compartment that can be opened without disturbing the optics. Surge protection to 10 kV as standard keeps drivers alive on rural feeders, and NEMA sockets allow a controller to be added later for dimming schedules and centralised monitoring.",
    specifications: [
      { label: "Wattage", value: "20 W – 250 W" },
      { label: "Efficacy", value: "130 – 150 lm/W" },
      { label: "Colour temperature", value: "5700 K / 4000 K" },
      { label: "Driver", value: "Constant current, 10 kV surge protection" },
      { label: "Ingress & impact", value: "IP66 / IK09" },
      { label: "Standard", value: "IS 10322 Part 5 / LM-79 tested" },
    ],
    applications: [
      "Road, highway and junction lighting",
      "Municipal conventional-to-LED retrofits",
      "Campus, society and factory road lighting",
      "Smart-city CCMS controlled networks",
    ],
    illustration: "street-light",
    featured: true,
  },
  {
    id: "p30",
    slug: "all-in-one-solar-street-light",
    name: "All-in-One Solar Street Light",
    category: "LED Street Lights",
    shortDescription:
      "Integrated solar street lights with lithium storage and three-day autonomy.",
    fullDescription:
      "Integrated units combining module, LiFePO4 battery, MPPT controller and LED luminaire in a single housing, which removes the separate battery box that gets stolen or waterlogged. Motion sensing holds the light at a low level on an empty road and brings it to full output when someone approaches, extending autonomy through overcast spells.",
    specifications: [
      { label: "Luminaire", value: "9 W – 40 W LED" },
      { label: "Solar module", value: "40 Wp – 150 Wp monocrystalline" },
      { label: "Battery", value: "LiFePO4, 3 day autonomy" },
      { label: "Controller", value: "MPPT with motion-sensing dimming" },
      { label: "Pole", value: "4 m – 9 m galvanised" },
      { label: "Standard", value: "MNRE specification compliant" },
    ],
    applications: [
      "Rural roads and off-grid locations",
      "Village electrification schemes",
      "Parks, pathways and campuses",
      "Highway rest areas and bus stops",
    ],
    illustration: "solar",
  },
  {
    id: "p31",
    slug: "high-mast-lighting-system",
    name: "High Mast Lighting System",
    category: "High Mast Lighting",
    shortDescription:
      "12 m to 40 m polygonal masts with motorised raising and lowering headframes.",
    fullDescription:
      "High masts light large open areas from a handful of points instead of a forest of poles. Each system is supplied as a complete package — continuously welded polygonal mast, lantern carriage with 4 to 16 luminaires, double-drum winch with motor and safety brake, lightning finial, aviation obstruction light and the feeder pillar that controls it — with foundation drawings against the local wind zone.",
    specifications: [
      { label: "Mast height", value: "12 m – 40 m" },
      { label: "Mast", value: "Polygonal, continuously welded, hot-dip galvanised" },
      { label: "Headframe", value: "4 to 16 luminaires, raising and lowering" },
      { label: "Winch", value: "Double drum with motor and safety brake" },
      { label: "Protection", value: "Lightning finial and aviation light" },
      { label: "Design", value: "Wind loading to IS 875 Part 3" },
    ],
    applications: [
      "Highway junctions and toll plazas",
      "Ports, container yards and logistics parks",
      "Stadiums and large public grounds",
      "Industrial open areas and storage yards",
    ],
    illustration: "street-light",
  },

  /* ------------------------------------------------------- Solar and EV */
  {
    id: "p32",
    slug: "mono-perc-solar-module",
    name: "Mono PERC Solar Module",
    category: "Solar Panels",
    shortDescription:
      "ALMM and BIS listed half-cut mono PERC modules from 400 Wp to 590 Wp.",
    fullDescription:
      "Half-cut mono PERC and TOPCon modules with multi-busbar cells, anti-reflective coated glass and a drainage-slotted anodised frame. Half-cut construction lowers resistive loss and keeps a shaded row producing instead of shutting down. Supplied ALMM and BIS listed, which is a precondition for most subsidy, net-metering and government tenders in India.",
    specifications: [
      { label: "Power output", value: "400 Wp – 590 Wp" },
      { label: "Cell technology", value: "Mono PERC / TOPCon, half cut" },
      { label: "Module efficiency", value: "Up to 22.5%" },
      { label: "Temperature coefficient", value: "-0.34%/°C typical" },
      { label: "Warranty", value: "12 year product, 27 year performance" },
      { label: "Certification", value: "IEC 61215 / 61730, ALMM & BIS listed" },
    ],
    applications: [
      "Rooftop captive solar plants",
      "Ground-mount and utility-scale projects",
      "Solar pumps and off-grid systems",
      "Carports, sheds and elevated structures",
    ],
    illustration: "solar",
    featured: true,
  },
  {
    id: "p33",
    slug: "bifacial-glass-glass-module",
    name: "Bifacial Glass-Glass Module",
    category: "Solar Panels",
    shortDescription:
      "Dual-glass bifacial modules to 700 Wp that harvest reflected light from the rear face.",
    fullDescription:
      "Bifacial glass-glass modules generate from both faces, picking up light reflected off the ground beneath the array. On a light-coloured surface or an elevated structure the rear-side gain typically adds 5 to 20% to annual yield for very little extra cost. The dual-glass laminate also resists PID, micro-cracking and moisture ingress far better than a backsheet.",
    specifications: [
      { label: "Power output", value: "545 Wp – 700 Wp" },
      { label: "Bifaciality factor", value: "70% ±5%" },
      { label: "Construction", value: "Dual glass, 2.0 mm heat-strengthened" },
      { label: "Rear-side gain", value: "5 – 20% depending on albedo" },
      { label: "Warranty", value: "12 year product, 30 year performance" },
      { label: "Certification", value: "IEC 61215 / 61730" },
    ],
    applications: [
      "Ground-mount plants over light-coloured surfaces",
      "Elevated structures and solar carports",
      "Utility-scale and open-access projects",
      "High-albedo and cool-climate sites",
    ],
    illustration: "solar",
  },
  {
    id: "p34",
    slug: "grid-tied-string-inverter",
    name: "Grid-Tied String Inverter",
    category: "Solar Inverters",
    shortDescription:
      "3 kW to 350 kW string inverters at up to 98.6% efficiency, IP65 and monitoring ready.",
    fullDescription:
      "Transformerless string inverters with multiple independent MPP trackers, so a shaded or differently-oriented string does not drag the rest of the array down. Integrated AC and DC surge protection, DC isolator and arc-fault detection reduce the external component count, and built-in monitoring reports string-level performance to a portal or your SCADA over Modbus.",
    specifications: [
      { label: "Capacity", value: "3 kW – 350 kW" },
      { label: "MPP trackers", value: "2 – 12 independent trackers" },
      { label: "Peak efficiency", value: "Up to 98.6%" },
      { label: "Protection", value: "IP65, integrated AC/DC SPD and isolator" },
      { label: "Monitoring", value: "Wi-Fi / GPRS portal, Modbus RTU-TCP" },
      { label: "Standard", value: "IEC 62109 / IS 16221 / CEI 0-21" },
    ],
    applications: [
      "Rooftop grid-tied and net-metered plants",
      "Distributed ground-mount blocks",
      "Commercial and industrial captive plants",
      "Open-access and third-party owned projects",
    ],
    illustration: "energy",
  },
  {
    id: "p35",
    slug: "hybrid-off-grid-inverter",
    name: "Hybrid & Off-Grid Inverter",
    category: "Solar Inverters",
    shortDescription:
      "3 kVA to 50 kVA hybrid inverters with battery support and sub-10 ms changeover.",
    fullDescription:
      "Hybrid inverters run solar, battery and grid together, deciding in software whether to serve the load from the array, charge the battery or import. Changeover to battery is fast enough that computers and process equipment do not notice the grid has gone. Lead-acid and lithium battery profiles are supported, with programmable charge and discharge windows for time-of-day tariffs.",
    specifications: [
      { label: "Capacity", value: "3 kVA – 50 kVA" },
      { label: "Battery voltage", value: "48 V lead-acid or lithium" },
      { label: "Changeover time", value: "Under 10 ms" },
      { label: "MPPT", value: "Dual tracker, up to 500 V DC" },
      { label: "Modes", value: "Grid-tied, hybrid, off-grid, generator support" },
      { label: "Standard", value: "IEC 62109" },
    ],
    applications: [
      "Homes and societies with frequent outages",
      "Telecom towers and remote installations",
      "Micro-grids and rural facilities",
      "Solar-plus-storage retrofits",
    ],
    illustration: "energy",
  },
  {
    id: "p36",
    slug: "module-mounting-structure",
    name: "Module Mounting Structure",
    category: "Solar Structures",
    shortDescription:
      "Hot-dip galvanised rooftop, ground-mount, elevated and carport structures.",
    fullDescription:
      "Mounting structures designed against the site's wind zone and terrain category rather than a generic drawing, because the structure is what fails first in a storm. Hot-dip galvanised to 80 microns for a 25-year design life, with pre-galvanised fasteners, and detailed for RCC roofs, metal sheet roofs, ground mounting, elevated platforms and carports.",
    specifications: [
      { label: "Material", value: "Hot-dip galvanised MS or aluminium" },
      { label: "Tilt", value: "Fixed 10° – 30°, seasonal adjustable option" },
      { label: "Wind design", value: "Up to 180 km/h, IS 875 Part 3" },
      { label: "Galvanising", value: "80 micron HDG, 25 year design life" },
      { label: "Types", value: "Rooftop, ground-mount, elevated, carport" },
      { label: "Fasteners", value: "SS 304 / pre-galvanised, with EPDM washers" },
    ],
    applications: [
      "RCC and metal-sheet rooftop plants",
      "Ground-mount and utility-scale arrays",
      "Elevated structures over yards and walkways",
      "Solar carports and shed installations",
    ],
    illustration: "solar",
  },
  {
    id: "p37",
    slug: "dc-fast-charging-station",
    name: "DC Fast Charging Station",
    category: "EV Charging Stations",
    shortDescription:
      "30 kW to 240 kW CCS-2 fast chargers, OCPP networked and IS 17017 compliant.",
    fullDescription:
      "DC fast chargers supplied with the upstream infrastructure they actually need — load assessment, transformer, LT panel, cabling and civil work — because the charger is rarely the constraint. Units are OCPP 1.6J compliant so they work with any compatible network operator, support RFID, app and card payment, and log every session for reconciliation.",
    specifications: [
      { label: "Output power", value: "30 kW – 240 kW" },
      { label: "Connectors", value: "CCS-2, CHAdeMO, GB/T" },
      { label: "Input", value: "415 V AC, 3 phase" },
      { label: "Efficiency", value: "Over 94%, power factor above 0.98" },
      { label: "Network", value: "OCPP 1.6J over 4G or Ethernet" },
      { label: "Standard", value: "IS 17017 / IEC 61851 / IEC 62196" },
    ],
    applications: [
      "Highway charging corridors",
      "Bus, fleet and last-mile depots",
      "Public charging hubs and fuel stations",
      "Commercial parking and retail sites",
    ],
    illustration: "ev",
    featured: true,
  },
  {
    id: "p38",
    slug: "ac-charging-point",
    name: "AC Charging Point",
    category: "EV Charging Stations",
    shortDescription:
      "3.3 kW to 22 kW Type 2 and Bharat AC-001 chargers with inbuilt metering.",
    fullDescription:
      "AC charge points for locations where vehicles stand for hours and speed is not the point — homes, offices, hotels and society parking. Each unit carries its own MID-class meter so consumption can be billed back accurately, a Type A RCBO with 6 mA DC leakage detection, and RFID or app authorisation to stop unauthorised use.",
    specifications: [
      { label: "Output power", value: "3.3 kW / 7.4 kW / 22 kW" },
      { label: "Connector", value: "Type 2 socket or tethered cable" },
      { label: "Metering", value: "Inbuilt MID-class energy meter" },
      { label: "Protection", value: "Type A RCBO with 6 mA DC detection" },
      { label: "Network", value: "OCPP, RFID and mobile app start" },
      { label: "Standard", value: "IS 17017 Part 2 / IEC 61851-1" },
    ],
    applications: [
      "Residential and society parking",
      "Office and commercial parking bays",
      "Hotel and mall destination charging",
      "Two and three wheeler charging points",
    ],
    illustration: "ev",
  },

  /* -------------------------------------------------- Substation materials */
  {
    id: "p39",
    slug: "maintenance-free-earthing-electrode",
    name: "Maintenance-Free Earthing Electrode",
    category: "Earthing Materials",
    shortDescription:
      "Copper-bonded chemical earthing electrodes with backfill compound for sub-1 ohm results.",
    fullDescription:
      "Copper-bonded electrodes with a 250 micron molecularly bonded coating that does not peel the way plated pipe does, installed with a conductive backfill compound that holds moisture and lowers the resistance of the surrounding soil. Combined with the right electrode count and spacing, this reliably achieves the sub-1 ohm figure that transformer and panel earthing requires.",
    specifications: [
      { label: "Electrode", value: "48 mm / 80 mm copper-bonded or GI pipe" },
      { label: "Length", value: "2 m / 3 m" },
      { label: "Copper bonding", value: "250 micron, molecularly bonded" },
      { label: "Backfill", value: "Conductive compound, 25 kg bags" },
      { label: "Resistance", value: "Under 1 ohm achievable with treatment" },
      { label: "Standard", value: "IS 3043 / IEC 62561-2" },
    ],
    applications: [
      "Transformer neutral and body earthing",
      "Panel, motor and equipment earthing",
      "Lightning protection down-conductor earthing",
      "Solar plant and DC system earthing grids",
    ],
    illustration: "infrastructure",
  },
  {
    id: "p40",
    slug: "earthing-strips-and-lightning-protection",
    name: "Earthing Strips & Lightning Protection",
    category: "Earthing Materials",
    shortDescription:
      "GI and copper strips, conductors, test links and air terminals for a complete earth network.",
    fullDescription:
      "The rest of the earthing system — GI and copper strip for the grid and risers, bare and insulated down conductors, test links, earth pit covers, clamps and bonding accessories, together with conventional Franklin rods or ESE air terminals for structural lightning protection. Supplied against a designed layout, not a guess, with a bill of quantities that matches the drawing.",
    specifications: [
      { label: "Strips", value: "GI and copper, 25×3 mm to 50×6 mm" },
      { label: "Conductors", value: "8 SWG GI wire, copper tape and cable" },
      { label: "Air terminals", value: "Franklin rods and ESE terminals" },
      { label: "Accessories", value: "Test links, earth pits, clamps, bonds" },
      { label: "Coating", value: "Hot-dip galvanised to IS 2629" },
      { label: "Standard", value: "IS 3043 / IS/IEC 62305 / NBC 2016" },
    ],
    applications: [
      "Substation earthing grids and risers",
      "Building lightning protection systems",
      "Panel, tray and structure bonding",
      "Tower, pole and mast earthing",
    ],
    illustration: "infrastructure",
  },
  {
    id: "p41",
    slug: "ht-line-and-post-insulators",
    name: "HT Line & Post Insulators",
    category: "Insulators",
    shortDescription:
      "Porcelain and silicone composite pin, disc, post and long-rod insulators to 132 kV.",
    fullDescription:
      "Insulators for overhead lines and substation bus support in both porcelain and silicone rubber composite. Composite long-rod units weigh a fraction of a porcelain string, resist vandalism and hold up far better in polluted, coastal and industrial atmospheres where leakage current and flashover are the real failure mode. Creepage is specified to the pollution level of the site.",
    specifications: [
      { label: "Types", value: "Pin, disc, post and polymer long-rod" },
      { label: "Voltage class", value: "11 kV – 132 kV" },
      { label: "Material", value: "Porcelain and silicone composite" },
      { label: "Creepage", value: "25 mm/kV standard, 31 mm/kV heavy pollution" },
      { label: "Mechanical strength", value: "45 kN – 120 kN" },
      { label: "Standard", value: "IS 731 / IS 2486 / IEC 61109" },
    ],
    applications: [
      "Overhead HT line construction",
      "Substation bus and equipment support",
      "Feeder repair and insulator replacement",
      "Coastal and heavily polluted environments",
    ],
    illustration: "utility",
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * The catalogue, with each entry's picture filled in — an explicit `image` on
 * the entry first, then the product's own render, then its category's.
 */
export const products: Product[] = catalogue.map((product) => ({
  ...product,
  image:
    product.image ?? productImages[product.slug] ?? categoryImages[product.category],
}));

/** Products flagged for the home page strip. */
export const featuredProducts = products.filter((p) => p.featured);

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function productsInCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

/** The group a category belongs to, e.g. "Panels & Switchgear". */
export function groupOf(category: string): string | undefined {
  return productGroups.find((g) => g.categories.includes(category))?.title;
}

/**
 * Related products: everything else in the same category first, then the rest
 * of the same group, so a page always has something sensible to show.
 */
export function relatedProducts(product: Product, limit = 3): Product[] {
  const group = groupOf(product.category);

  const sameCategory = products.filter(
    (p) => p.slug !== product.slug && p.category === product.category
  );
  const sameGroup = products.filter(
    (p) =>
      p.slug !== product.slug &&
      p.category !== product.category &&
      groupOf(p.category) === group
  );

  return [...sameCategory, ...sameGroup].slice(0, limit);
}
