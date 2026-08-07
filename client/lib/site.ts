/**
 * Site content model.
 *
 * Company and contact details come from the environment (`lib/env.ts`, driven
 * by `.env`). The catalogue below — services, industries, projects and so
 * on — is placeholder content written to be edited in place.
 */

import { env } from "./env";
import type {
  Certification,
  Client,
  Faq,
  Feature,
  GalleryItem,
  Industry,
  KeyContact,
  NavItem,
  ProcessStep,
  Project,
  Service,
  Stat,
  Testimonial,
} from "./types";

/* -------------------------------------------------------------------------- */
/*  Company                                                                    */
/* -------------------------------------------------------------------------- */

export const company = {
  name: env.companyName,
  legalName: env.legalName,
  tagline: env.tagline,
  description: env.description,
  foundedYear: env.foundedYear,
  gstin: env.gstin,
  cin: env.cin,
  siteUrl: env.siteUrl,
} as const;

export const contact = {
  email: env.email,
  salesEmail: env.salesEmail || env.email,
  careersEmail: env.careersEmail || env.email,
  /** Blank entries are dropped so the UI never renders an empty row. */
  phones: [env.phone, env.phoneAlt].filter(Boolean),
  landline: env.landline,
  whatsapp: env.whatsapp,
  address: env.address,
  /** The address split on commas, for multi-line display. */
  addressLines: env.address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean),
  postalCode: env.postalCode,
  googleMap: env.googleMap,
  hours: [env.hoursWeekdays, env.hoursWeekend].filter(Boolean),
} as const;

/**
 * People a visitor can write to by name, listed on the contact page under the
 * general addresses.
 *
 * These sit here rather than in the environment because they change with the
 * team rather than with the deployment — edit the list and the page follows.
 * Add `role` once a designation is confirmed; it renders only when present.
 */
export const keyContacts: KeyContact[] = [
  { name: "Aryan", email: "aryan@avrienergy.com" },
  { name: "Ashu Gupta", email: "ashu.gupta@avrienergy.com" },
];

export const socials = [
  { label: "LinkedIn", href: env.linkedin },
  { label: "Facebook", href: env.facebook },
  { label: "Instagram", href: env.instagram },
  { label: "YouTube", href: env.youtube },
  { label: "X", href: env.twitter },
].filter((s) => s.href);

/** `tel:` needs digits only, so strip formatting. */
export const telHref = (n: string) => `tel:${n.replace(/[^\d+]/g, "")}`;

export const whatsappHref = contact.whatsapp
  ? `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`
  : "";

/* -------------------------------------------------------------------------- */
/*  Navigation                                                                 */
/* -------------------------------------------------------------------------- */

export const nav: NavItem[] = [
  { href: "/", label: "Home" },
  {
    href: "/about",
    label: "About Us",
    children: [
      { href: "/about", label: "About Us" },
      { href: "/industries", label: "Industries We Serve" },
      { href: "/projects", label: "Projects" },
      { href: "/clients", label: "Clients" },
      { href: "/gallery", label: "Gallery" },
      { href: "/careers", label: "Careers" },
    ],
  },
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact Us" },
];

/** Every routable path in the menu, parents and children, de-duplicated. */
export const navHrefs: string[] = Array.from(
  new Set(nav.flatMap((item) => [item.href, ...(item.children ?? []).map((c) => c.href)]))
);

export const legalNav: NavItem[] = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-and-conditions", label: "Terms & Conditions" },
  // Several product photographs are CC BY / CC BY-SA, which permit commercial
  // use only if the photographer is credited somewhere reachable from the page.
 // { href: "/image-credits", label: "Image Credits" },
];

/* -------------------------------------------------------------------------- */
/*  Headline figures                                                           */
/* -------------------------------------------------------------------------- */

export const stats: Stat[] = [
  { value: "80,000+", label: "Smart meters installed" },
  { value: "50+", label: "Projects completed" },
  { value: "10+", label: "States served" },
  { value: "99%", label: "Client satisfaction" },
];

/* -------------------------------------------------------------------------- */
/*  Services                                                                   */
/* -------------------------------------------------------------------------- */

export const services: Service[] = [
  {
    slug: "electrical-epc-turnkey",
    title: "Electrical EPC & Turnkey Projects",
    summary:
      "Single-point responsibility for engineering, procurement and construction of complete electrical systems.",
    description:
      "We take a project from concept through to energisation — detailed engineering, approved-vendor procurement, construction, testing and statutory clearances — under one contract and one accountable team.",
    scope: [
      "Detailed engineering, SLDs and GA drawings",
      "Procurement from approved and tested makes",
      "Construction, erection and cable networks",
      "Pre-commissioning tests and energisation",
      "Statutory liaison, approvals and handover dossiers",
    ],
    image: "/assets/services/electrical-epc-turnkey.jpg",
    illustration: "epc",
  },
  {
    slug: "ht-lt-electrical-works",
    title: "HT & LT Electrical Works",
    summary:
      "High- and low-tension distribution networks built to IS, CEA and utility standards.",
    description:
      "From incoming HT lines to the last LT distribution board, we design and build networks that carry load safely, balance phases correctly and stay maintainable for decades.",
    scope: [
      "HT lines, feeders and ring-main units",
      "LT distribution, busduct and cable trays",
      "Cable laying, jointing and termination",
      "Earthing systems and lightning protection",
      "Load balancing, testing and commissioning",
    ],
    image: "/assets/services/ht-lt-electrical-works.jpg",
    illustration: "htlt",
  },
  {
    slug: "substations",
    title: "Substations",
    summary:
      "Indoor and outdoor substations from 11 kV up to 220 kV, built turnkey.",
    description:
      "Complete substation packages covering civil interface, equipment erection, protection and control, SCADA integration and charging — executed to utility specifications and inspection regimes.",
    scope: [
      "11 kV / 33 kV / 132 kV / 220 kV substations",
      "Switchyard erection and bus-bar work",
      "Protection relays, control and relay panels",
      "SCADA and RTU integration",
      "Charging, testing and utility handover",
    ],
    image: "/assets/services/substations.jpg",
    illustration: "substation",
  },
  {
    slug: "transformers",
    title: "Transformers",
    summary:
      "Supply, erection, testing, overhaul and maintenance of distribution and power transformers.",
    description:
      "We supply and install transformers across the distribution and power range, and keep them healthy afterwards with oil filtration, testing and full overhaul when required.",
    scope: [
      "Distribution transformers 25 kVA – 2500 kVA",
      "Power transformers and dry-type units",
      "Erection, oil filling and pre-charging tests",
      "Oil filtration, BDV testing and rewinding",
      "Preventive maintenance and breakdown response",
    ],
    image: "/assets/services/transformers.jpg",
    illustration: "transformer",
  },
  {
    slug: "smart-metering",
    title: "Smart Metering Solutions",
    summary:
      "Smart and prepaid metering roll-outs with communication, integration and data validation.",
    description:
      "End-to-end metering programmes — survey, installation, communication network, HES/MDM integration and the data validation that makes billing defensible.",
    scope: [
      "Smart, prepaid and net-metering installation",
      "RF, PLC and cellular communication networks",
      "HES and MDM system integration",
      "Meter data acquisition and validation",
      "Consumer indexing and GIS mapping",
    ],
    image: "/assets/services/smart-metering.jpg",
    illustration: "metering",
  },
  {
    slug: "energy-management",
    title: "Energy Management Solutions",
    summary:
      "Audits, monitoring and correction that turn energy data into a lower bill.",
    description:
      "We measure where energy is actually going, then fix it — power factor, harmonics, demand profile and load scheduling — with a costed, prioritised action plan and verified savings.",
    scope: [
      "Detailed electrical and energy audits",
      "Power factor correction and APFC panels",
      "Harmonic analysis and mitigation",
      "Real-time energy monitoring dashboards",
      "Maximum-demand and load optimisation",
    ],
    image: "/assets/services/energy-management.jpg",
    illustration: "energy",
  },
  {
    slug: "solar-solutions",
    title: "Solar Solutions",
    summary:
      "Rooftop and ground-mount solar plants, delivered turnkey with net metering and O&M.",
    description:
      "Feasibility, yield modelling, structure design, installation, DISCOM liaison and long-term operations — for captive rooftop plants and utility-scale ground-mount alike.",
    scope: [
      "Rooftop, ground-mount and carport plants",
      "Shadow analysis and generation modelling",
      "Module, inverter and structure engineering",
      "Net metering and DISCOM approvals",
      "Monitoring, cleaning and annual maintenance",
    ],
    image: "/assets/services/solar-solutions.jpg",
    illustration: "solar",
  },
  {
    slug: "electrical-automation",
    title: "Electrical Automation",
    summary:
      "PLC, SCADA and control systems that make plants observable and repeatable.",
    description:
      "Control and automation packages built around your process — panel design, logic development, instrumentation and the HMI your operators will actually use.",
    scope: [
      "PLC and SCADA design and programming",
      "MCC, PCC and control panel engineering",
      "VFD and soft-starter integration",
      "Instrumentation and field wiring",
      "HMI development and operator training",
    ],
    image: "/assets/services/electrical-automation.jpg",
    illustration: "automation",
  },
  {
    slug: "operation-maintenance",
    title: "Operation & Maintenance",
    summary:
      "Planned maintenance and rapid response that protect uptime and asset life.",
    description:
      "Structured O&M contracts with scheduled preventive visits, condition monitoring, spares management and a response commitment for breakdowns.",
    scope: [
      "Scheduled preventive maintenance visits",
      "Thermography and insulation resistance testing",
      "Substation and transformer O&M",
      "Solar plant O&M and module cleaning",
      "Spares management and 24×7 breakdown support",
    ],
    image: "/assets/services/operation-maintenance.jpg",
    illustration: "maintenance",
  },
  {
    slug: "industrial-commercial-works",
    title: "Industrial & Commercial Electrical Works",
    summary:
      "Complete internal electrification for factories, warehouses and commercial buildings.",
    description:
      "Everything inside the fence — power distribution, lighting, fire-safety interfaces and utilities — designed for the load profile of the building and delivered on programme.",
    scope: [
      "Internal electrification and power distribution",
      "Lighting design and installation",
      "DG sets, UPS and standby power",
      "Fire alarm and safety system interfaces",
      "Testing, certification and statutory approvals",
    ],
    image: "/assets/services/industrial-commercial-works.jpg",
    illustration: "industrial",
  },
  {
    slug: "street-lighting",
    title: "Street Lighting",
    summary:
      "LED and solar street lighting projects, from photometric design to centralised control.",
    description:
      "Municipal and campus street lighting delivered end to end — pole and luminaire design, cabling, feeder pillars and centralised control and monitoring systems.",
    scope: [
      "LED street lighting design and installation",
      "Solar-powered and hybrid street lights",
      "High-mast and flood lighting",
      "Feeder pillars, timers and control systems",
      "Retrofit programmes and energy savings audits",
    ],
    image: "/assets/services/street-lighting.jpg",
    illustration: "street-light",
  },
  {
    slug: "ev-charging",
    title: "EV Charging Infrastructure",
    summary:
      "AC and DC charging stations with the upstream power infrastructure they need.",
    description:
      "Charging hubs planned around the real constraint — the incoming supply. We handle load augmentation, transformer and panel work, civil interface, chargers and network integration.",
    scope: [
      "AC slow and DC fast charging stations",
      "Load assessment and supply augmentation",
      "Transformer, panel and cabling infrastructure",
      "Civil works, canopies and site layout",
      "Network integration and O&M contracts",
    ],
    image: "/assets/services/ev-charging.jpg",
    illustration: "ev",
  },
  {
    slug: "supply-of-equipment",
    title: "Supply of Electrical Equipment",
    summary:
      "Material supply from approved makes, with full test documentation.",
    description:
      "Item-wise supply against your BOQ — transformers, panels, switchgear, cables, meters and solar equipment — correctly rated, genuinely sourced and delivered with certificates.",
    scope: [
      "Transformers, panels and switchgear",
      "HT and LT cables, conductors and accessories",
      "Meters, relays and protection devices",
      "Solar modules, inverters and structures",
      "LED luminaires and lighting accessories",
    ],
    image: "/assets/services/supply-of-equipment.jpg",
    illustration: "supply",
  },
];

/* -------------------------------------------------------------------------- */
/*  Industries                                                                 */
/* -------------------------------------------------------------------------- */

export const industries: Industry[] = [
  {
    slug: "power-utilities",
    title: "Power Utilities",
    summary:
      "Network strengthening, substations and loss-reduction works for transmission and distribution utilities.",
    highlights: [
      "Substation erection and augmentation",
      "Feeder bifurcation and network strengthening",
      "AT&C loss reduction programmes",
    ],
    image: "/assets/industries/power-utilities.jpg",
    illustration: "utility",
  },
  {
    slug: "government-departments",
    title: "Government Departments",
    summary:
      "Tendered electrical works executed to departmental specifications, timelines and audit requirements.",
    highlights: [
      "Departmental electrical works and upgrades",
      "Compliance-ready documentation",
      "Execution under standard tender conditions",
    ],
    image: "/assets/industries/government-departments.jpg",
    illustration: "government",
  },
  {
    slug: "cpwd",
    title: "CPWD",
    summary:
      "Internal and external electrification for CPWD buildings and campuses, to CPWD specifications.",
    highlights: [
      "Internal electrification of buildings",
      "External services and street lighting",
      "Works to CPWD schedule and specification",
    ],
    image: "/assets/industries/cpwd.jpg",
    illustration: "government",
  },
  {
    slug: "discoms",
    title: "DISCOMs",
    summary:
      "Distribution-side works — metering roll-outs, LT network upgrades and consumer indexing.",
    highlights: [
      "Smart and prepaid metering roll-outs",
      "LT network augmentation and re-conductoring",
      "Consumer indexing and GIS survey",
    ],
    image: "/assets/industries/discoms.jpg",
    illustration: "utility",
  },
  {
    slug: "renewable-energy",
    title: "Renewable Energy",
    summary:
      "Solar generation and evacuation infrastructure, from rooftop plants to pooling substations.",
    highlights: [
      "Rooftop and ground-mount solar EPC",
      "Evacuation lines and pooling substations",
      "Long-term plant operations and maintenance",
    ],
    image: "/assets/industries/renewable-energy.jpg",
    illustration: "solar",
  },
  {
    slug: "industries",
    title: "Industries",
    summary:
      "Plant electrification, automation and reliability programmes for manufacturing sites.",
    highlights: [
      "Captive substations and plant distribution",
      "MCC, PCC and process automation",
      "Energy audits and power factor correction",
    ],
    image: "/assets/industries/industries.jpg",
    illustration: "industrial",
  },
  {
    slug: "commercial-buildings",
    title: "Commercial Buildings",
    summary:
      "Electrical services for offices, malls, hotels and hospitals where downtime is unacceptable.",
    highlights: [
      "Complete building electrification",
      "Standby power and UPS systems",
      "Lighting design and energy management",
    ],
    image: "/assets/industries/commercial-buildings.jpg",
    illustration: "commercial",
  },
  {
    slug: "residential-projects",
    title: "Residential Projects",
    summary:
      "Electrification for townships, group housing and residential societies.",
    highlights: [
      "Township and society electrification",
      "Substations, DG backup and lift power",
      "Common-area lighting and metering",
    ],
    image: "/assets/industries/residential-projects.jpg",
    illustration: "residential",
  },
  {
    slug: "infrastructure-projects",
    title: "Infrastructure Projects",
    summary:
      "Electrical packages for highways, metros and public infrastructure.",
    highlights: [
      "Highway and tunnel lighting",
      "Metro electrical packages",
      "Utility shifting and power distribution",
    ],
    image: "/assets/industries/infrastructure-projects.jpg",
    illustration: "infrastructure",
  },
  {
    slug: "railways",
    title: "Railways",
    summary:
      "Electrification, station power and signalling supply for railway works.",
    highlights: [
      "Station electrification and platform lighting",
      "Auxiliary substations and feeder arrangements",
      "Power supply for signalling and telecom rooms",
    ],
    image: "/assets/industries/railways.jpg",
    illustration: "infrastructure",
  },
  {
    slug: "airports",
    title: "Airports",
    summary:
      "Terminal and airside electrical works executed to aviation-grade standards.",
    highlights: [
      "Terminal building electrification and lighting",
      "Standby power, UPS and load segregation",
      "Airside and apron power distribution",
    ],
    image: "/assets/industries/airports.jpg",
    illustration: "infrastructure",
  },
  {
    slug: "hospitals",
    title: "Hospitals",
    summary:
      "Healthcare electrical systems where an outage is never acceptable.",
    highlights: [
      "Essential and non-essential supply segregation",
      "DG backup, UPS and medical-grade earthing",
      "Operation theatre and ICU power distribution",
    ],
    image: "/assets/industries/hospitals.jpg",
    illustration: "commercial",
  },
  {
    slug: "smart-cities",
    title: "Smart Cities",
    summary:
      "Smart lighting, metering and connected infrastructure for urban modernisation programmes.",
    highlights: [
      "Centralised smart street lighting",
      "Smart metering and command-centre integration",
      "EV charging and public infrastructure",
    ],
    image: "/assets/industries/smart-cities.jpg",
    illustration: "smart-city",
  },
];

/* -------------------------------------------------------------------------- */
/*  Projects                                                                   */
/* -------------------------------------------------------------------------- */

export const projects: Project[] = [
  {
    slug: "33-11-kv-substation-ghaziabad",
    title: "33/11 kV Substation — Industrial Area",
    client: "State Distribution Utility",
    location: "Ghaziabad, Uttar Pradesh",
    year: "2024",
    category: "Substations",
    scope:
      "Turnkey erection of a 33/11 kV substation including switchyard, protection panels, transformer erection and charging.",
    facts: [
      { label: "Capacity", value: "2 × 5 MVA" },
      { label: "Voltage", value: "33/11 kV" },
      { label: "Duration", value: "7 months" },
    ],
    image: "/assets/projects/33-11-kv-substation-ghaziabad.jpg",
    illustration: "substation",
    featured: true,
  },
  {
    slug: "rooftop-solar-manufacturing-plant",
    title: "1.2 MW Rooftop Solar Plant",
    client: "Auto Components Manufacturer",
    location: "Meerut, Uttar Pradesh",
    year: "2024",
    category: "Solar Solutions",
    scope:
      "Design, supply and installation of a captive rooftop solar plant with net metering and a five-year O&M contract.",
    facts: [
      { label: "Capacity", value: "1.2 MWp" },
      { label: "Annual yield", value: "1.7 GWh" },
      { label: "Duration", value: "4 months" },
    ],
    image: "/assets/projects/rooftop-solar-manufacturing-plant.jpg",
    illustration: "solar",
    featured: true,
  },
  {
    slug: "smart-metering-rollout",
    title: "Smart Metering Roll-out",
    client: "Distribution Company",
    location: "West Uttar Pradesh",
    year: "2023",
    category: "Smart Metering Solutions",
    scope:
      "Survey, installation and HES integration of smart meters across residential and commercial consumers.",
    facts: [
      { label: "Meters", value: "18,000+" },
      { label: "Integration", value: "HES / MDM" },
      { label: "Duration", value: "11 months" },
    ],
    image: "/assets/projects/smart-metering-rollout.jpg",
    illustration: "metering",
    featured: true,
  },
  {
    slug: "led-street-lighting-municipal",
    title: "Municipal LED Street Lighting",
    client: "Municipal Corporation",
    location: "Modinagar, Uttar Pradesh",
    year: "2023",
    category: "Street Lighting",
    scope:
      "Retrofit of conventional street lighting to LED with feeder pillars and centralised control and monitoring.",
    facts: [
      { label: "Luminaires", value: "6,400" },
      { label: "Energy saved", value: "58%" },
      { label: "Duration", value: "6 months" },
    ],
    image: "/assets/projects/led-street-lighting-municipal.jpg",
    illustration: "street-light",
    featured: true,
  },
  {
    slug: "ht-lt-network-warehouse-park",
    title: "HT & LT Network — Warehousing Park",
    client: "Logistics Developer",
    location: "Hapur, Uttar Pradesh",
    year: "2023",
    category: "HT & LT Electrical Works",
    scope:
      "Complete HT ring main, LT distribution and internal electrification across eight warehouse blocks.",
    facts: [
      { label: "Connected load", value: "4.5 MW" },
      { label: "Cabling", value: "22 km" },
      { label: "Duration", value: "9 months" },
    ],
    image: "/assets/projects/ht-lt-network-warehouse-park.jpg",
    illustration: "htlt",
  },
  {
    slug: "ev-charging-hub-highway",
    title: "Highway EV Charging Hub",
    client: "Mobility Operator",
    location: "NH-58 Corridor",
    year: "2024",
    category: "EV Charging Infrastructure",
    scope:
      "Power infrastructure and installation of DC fast and AC charging points, including transformer and panel works.",
    facts: [
      { label: "Chargers", value: "12 points" },
      { label: "Capacity", value: "600 kW" },
      { label: "Duration", value: "5 months" },
    ],
    image: "/assets/projects/ev-charging-hub-highway.jpg",
    illustration: "ev",
  },
  {
    slug: "plant-automation-upgrade",
    title: "Plant Automation Upgrade",
    client: "Process Industry",
    location: "Ghaziabad, Uttar Pradesh",
    year: "2022",
    category: "Electrical Automation",
    scope:
      "PLC and SCADA upgrade with new MCC panels, VFD integration and operator HMI stations.",
    facts: [
      { label: "Panels", value: "14 MCC" },
      { label: "I/O points", value: "900+" },
      { label: "Duration", value: "5 months" },
    ],
    image: "/assets/projects/plant-automation-upgrade.jpg",
    illustration: "automation",
  },
  {
    slug: "campus-electrification-institution",
    title: "Institutional Campus Electrification",
    client: "Educational Institution",
    location: "Muzaffarnagar, Uttar Pradesh",
    year: "2022",
    category: "Industrial & Commercial Electrical Works",
    scope:
      "Internal and external electrification of an academic campus with substation, DG backup and campus lighting.",
    facts: [
      { label: "Built-up area", value: "3.2 lakh sq ft" },
      { label: "Substation", value: "1.6 MVA" },
      { label: "Duration", value: "10 months" },
    ],
    image: "/assets/projects/campus-electrification-institution.jpg",
    illustration: "commercial",
  },
];

export const projectCategories = [
  "All",
  ...Array.from(new Set(projects.map((p) => p.category))),
];

/* -------------------------------------------------------------------------- */
/*  Gallery                                                                    */
/* -------------------------------------------------------------------------- */

export const galleryCategories = [
  "All",
  "Substations",
  "Solar",
  "Site Works",
  "Panels",
  "Team",
];

export const gallery: GalleryItem[] = [
  { id: "g1", caption: "33/11 kV switchyard under erection", category: "Substations", illustration: "substation" },
  { id: "g2", caption: "Power transformer positioning", category: "Substations", illustration: "transformer" },
  { id: "g3", caption: "Rooftop module installation", category: "Solar", illustration: "solar" },
  { id: "g4", caption: "String inverter commissioning", category: "Solar", illustration: "energy" },
  { id: "g5", caption: "HT cable laying in progress", category: "Site Works", illustration: "htlt" },
  { id: "g6", caption: "Overhead line stringing", category: "Site Works", illustration: "epc" },
  { id: "g7", caption: "MCC panel assembly", category: "Panels", illustration: "automation" },
  { id: "g8", caption: "Relay and control panel wiring", category: "Panels", illustration: "metering" },
  { id: "g9", caption: "LED high-mast installation", category: "Site Works", illustration: "street-light" },
  { id: "g10", caption: "DC fast charger commissioning", category: "Site Works", illustration: "ev" },
  { id: "g11", caption: "Site safety briefing", category: "Team", illustration: "team" },
  { id: "g12", caption: "Maintenance crew on shift", category: "Team", illustration: "maintenance" },
];

/* -------------------------------------------------------------------------- */
/*  Careers                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Brand copy for the careers page. Stays here rather than in the database:
 * job *openings* change weekly and are managed in the admin panel, but why
 * someone should want to work here changes about as often as the mission
 * statement does.
 */
export const careerValues: Feature[] = [
  {
    title: "Site work, not slide decks",
    description:
      "You will be at substations, rooftops and feeder pillars, commissioning equipment you specified. Engineers here own their work from drawing to charging.",
  },
  {
    title: "Learn from people who have done it",
    description:
      "Every junior engineer works alongside someone who has commissioned dozens of installations. Nobody is handed a site and left to guess.",
  },
  {
    title: "Work that is going somewhere",
    description:
      "Smart metering, solar and EV charging are where India's grid is heading. The experience you build here will still matter in ten years.",
  },
];

export const careerBenefits: string[] = [
  "Provident fund and ESI as applicable",
  "Group accident cover for site staff",
  "Full PPE and safety training before site deployment",
  "Travel and site allowance",
  "Certification support — electrical supervisor licence and safety courses",
  "Annual review with a clear path to senior roles",
];

export const hiringSteps: ProcessStep[] = [
  {
    step: "01",
    title: "You apply",
    description: "Send your CV through the site. Everything lands with our HR team the same day.",
  },
  {
    step: "02",
    title: "First call",
    description:
      "A short conversation about your experience and what you want next. Usually within a week.",
  },
  {
    step: "03",
    title: "Technical discussion",
    description:
      "With the engineer you would work under. Practical questions about real situations, not puzzles.",
  },
  {
    step: "04",
    title: "Offer",
    description:
      "Written offer with the role, package and start date. If it is a no, we tell you — we do not leave people waiting.",
  },
];

/* -------------------------------------------------------------------------- */
/*  Certifications and testimonials                                            */
/* -------------------------------------------------------------------------- */

/**
 * Clients used to be a list of eight placeholder names here ("State Power
 * Utility", "Municipal Corporation", …) with no logos behind them. They now
 * live in the database and are managed in the admin panel, because they are
 * the one piece of editorial content that needs an authorisation step:
 * publishing a company's logo without written permission is a trademark risk,
 * so each row records who approved it and how, and nothing is visible on the
 * site until it is both authorised and published.
 *
 * See `lib/content.ts` → `getClients()`.
 */

export const certifications: Certification[] = [
  {
    code: "ISO 9001",
    title: "Quality Management",
    description:
      "Documented quality processes across engineering, procurement and execution.",
  },
  {
    code: "ISO 14001",
    title: "Environmental Management",
    description:
      "Waste, disposal and environmental controls applied on every site.",
  },
  {
    code: "ISO 45001",
    title: "Occupational Health & Safety",
    description:
      "Method statements, PPE discipline and incident reporting as standard practice.",
  },
  {
    code: "Class A",
    title: "Electrical Contractor Licence",
    description:
      "Licensed to execute HT and LT electrical works under state regulation.",
  },
  {
    code: "MSME",
    title: "Registered Enterprise",
    description:
      "Registered under the Government of India MSME framework.",
  },
  {
    code: "GST",
    title: "GST Compliant",
    description:
      "Fully compliant billing and documentation for institutional buyers.",
  },
];

export const testimonials: Testimonial[] = [
  {
    quote:
      "They took over a substation package that was already behind schedule and still energised it on the revised date. The documentation at handover was the cleanest we have received.",
    author: "Project Head",
    role: "Transmission Projects",
    company: "State Power Utility",
  },
  {
    quote:
      "Our rooftop plant has run for two summers without an unplanned outage. When a string tripped, their team was on site the same day.",
    author: "Plant Manager",
    role: "Manufacturing Operations",
    company: "Auto Components Ltd",
  },
  {
    quote:
      "What stood out was the honesty during design. They talked us out of an oversized system and saved us a substantial amount of capital.",
    author: "Director",
    role: "Facilities & Infrastructure",
    company: "Educational Trust",
  },
];

/* -------------------------------------------------------------------------- */
/*  Supporting content                                                         */
/* -------------------------------------------------------------------------- */

export const whyChooseUs: Feature[] = [
  {
    title: "Single-Point Accountability",
    description:
      "Design, supply, execution and maintenance sit with one team, so nothing falls between vendors.",
  },
  {
    title: "Engineering Discipline",
    description:
      "Every cable size, protection setting and drawing is calculated and justified before it reaches site.",
  },
  {
    title: "Safety Without Exception",
    description:
      "Documented method statements, PPE compliance and trained supervision on every site, every day.",
  },
  {
    title: "On-Time Delivery",
    description:
      "Committed programmes with weekly reporting, so you always know exactly where the project stands.",
  },
  {
    title: "In-House Capability",
    description:
      "Our own design team and installation crews mean your schedule does not depend on somebody else's.",
  },
  {
    title: "Long-Term Support",
    description:
      "We stay after energisation with maintenance contracts, spares and a responsive service desk.",
  },
];

export const processSteps: ProcessStep[] = [
  {
    step: "01",
    title: "Consultation & Survey",
    description:
      "We visit the site, study the load profile and establish what the installation genuinely needs to do.",
  },
  {
    step: "02",
    title: "Engineering & Proposal",
    description:
      "Detailed design, BOQ and a transparent commercial proposal with no hidden line items.",
  },
  {
    step: "03",
    title: "Procurement",
    description:
      "Material sourced from approved makes, inspected and delivered against the project programme.",
  },
  {
    step: "04",
    title: "Execution",
    description:
      "Construction by our own supervised crews, with weekly progress reporting and safety oversight.",
  },
  {
    step: "05",
    title: "Testing & Handover",
    description:
      "Pre-commissioning tests, statutory approvals and a complete handover dossier with drawings.",
  },
  {
    step: "06",
    title: "Operation & Maintenance",
    description:
      "Scheduled preventive maintenance and rapid breakdown response keep the asset performing.",
  },
];

export const faqs: Faq[] = [
  {
    question: "Which regions do you work in?",
    answer:
      "We are headquartered in Modinagar, Ghaziabad and execute regularly across Delhi NCR and West Uttar Pradesh. For larger EPC contracts we mobilise across India.",
  },
  {
    question: "Do you work on tendered government contracts?",
    answer:
      "Yes. We execute works for utilities, CPWD and government departments under standard tender conditions, with the documentation and compliance those contracts require.",
  },
  {
    question: "Do you handle DISCOM approvals and net metering?",
    answer:
      "Yes. For solar and connection works we manage the complete application, liaison and inspection process with the utility as part of the turnkey scope.",
  },
  {
    question: "Can you supply material without execution?",
    answer:
      "Certainly. We supply transformers, panels, cables, meters and solar equipment against your BOQ on a material-only basis, with full test documentation.",
  },
  {
    question: "What does your O&M contract cover?",
    answer:
      "Scheduled preventive visits, condition monitoring such as thermography and insulation testing, spares management, and a defined response commitment for breakdowns.",
  },
  {
    question: "How quickly can you respond to a breakdown?",
    answer:
      "For sites under an O&M contract we commit to a defined response window, typically same-day within our core region. Call our number directly rather than using the form for emergencies.",
  },
];
