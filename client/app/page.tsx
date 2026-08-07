import type { Metadata } from "next";

import Hero from "@/components/sections/Hero";
import AboutPreview from "@/components/sections/AboutPreview";
import ServicesGrid from "@/components/sections/ServicesGrid";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import IndustriesGrid from "@/components/sections/IndustriesGrid";
import FeaturedProjects from "@/components/sections/FeaturedProjects";
import Clients from "@/components/sections/Clients";
import Certifications from "@/components/sections/Certifications";
import Testimonials from "@/components/sections/Testimonials";
import ContactCTA from "@/components/sections/ContactCTA";
import MapSection from "@/components/sections/MapSection";

import { company } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: `${company.name} — ${company.tagline}`,
  description: company.description,
  path: "/",
});

export default function HomePage() {
  return (
    <>
      {/* 1  */}
      <Hero />
      {/* 2  */}
      <AboutPreview />
      {/* 3  */}
      <ServicesGrid limit={6} />
      {/* 4  */}
      <WhyChooseUs />
      {/* 5  */}
      <FeaturedProducts limit={6} />
      {/* 6  */}
      <IndustriesGrid />
      {/* 7  */}
      <FeaturedProjects />
      {/* 8  */}
      <Clients />
      {/* 9  */}
      <Certifications />
      {/* 10 */}
      <Testimonials />
      {/* 11 */}
      <ContactCTA />
      {/* 12 */}
      <MapSection />
      {/* 13  Footer is rendered by the root layout. */}
    </>
  );
}
