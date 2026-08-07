import type { Metadata } from "next";

import ContactCTA from "@/components/sections/ContactCTA";
import GalleryGrid from "@/components/sections/GalleryGrid";
import PageHero from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { gallery, galleryCategories } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Gallery",
  description:
    "Photographs from Avri Energy project sites — substation erection, solar installation, cable laying, panel assembly, street lighting and EV charging commissioning.",
  path: "/gallery",
  keywords: ["electrical project gallery", "substation photos", "solar installation photos"],
});

export default function GalleryPage() {
  return (
    <>
      <PageHero
        breadcrumb="Gallery"
        eyebrow="Gallery"
        title="From the field"
        lead="Work in progress and finished installations, across substations, solar, panels and site works."
      />

      <Section>
        <SectionHeading
          eyebrow="Site photographs"
          title="Browse by category"
          lead="Placeholder artwork is shown until real photographs are added to public/assets/gallery/ — see the README in that folder."
        />

        <div className="mt-12">
          <GalleryGrid items={gallery} categories={galleryCategories} />
        </div>
      </Section>

      <ContactCTA
        title="Want to see a site in person?"
        body="We are happy to arrange a reference visit to a completed installation near you."
      />
    </>
  );
}
