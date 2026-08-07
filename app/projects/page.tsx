import type { Metadata } from "next";

import ContactCTA from "@/components/sections/ContactCTA";
import ProjectsExplorer from "@/components/sections/ProjectsExplorer";
import Testimonials from "@/components/sections/Testimonials";
import { RevealGroup, RevealItem } from "@/components/ui/Motion";
import PageHero from "@/components/ui/PageHero";
import { Section, SectionHeading } from "@/components/ui/Section";
import { projectCategories, projects, stats } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Projects",
  description:
    "Substation, solar, smart metering, street lighting, EV charging and industrial electrification projects delivered by Avri Energy across Delhi NCR and Uttar Pradesh.",
  path: "/projects",
  keywords: ["electrical projects", "substation projects", "solar projects"],
});

export default function ProjectsPage() {
  return (
    <>
      <PageHero
        breadcrumb="Projects"
        eyebrow="Our work"
        title="Projects delivered, energised and maintained"
        lead="A selection of recent work across substations, solar, metering, lighting, automation and EV infrastructure."
      />

      {/* --------------------------------------------------------- Key figures */}
      <div className="border-b border-ink-100 bg-ink-50/60">
        <Section className="py-10 sm:py-12">
          <RevealGroup
            as="dl"
            className="grid grid-cols-2 gap-x-8 gap-y-8 lg:grid-cols-4"
          >
            {stats.map((s) => (
              <RevealItem key={s.label}>
                <dt className="text-3xl font-bold text-ink-900">{s.value}</dt>
                <dd className="mt-1.5 text-sm text-ink-500">{s.label}</dd>
              </RevealItem>
            ))}
          </RevealGroup>
        </Section>
      </div>

      {/* ------------------------------------------------------ Filtered grid */}
      <Section>
        <SectionHeading
          eyebrow="Project portfolio"
          title="Filter by category"
          lead="Project details are indicative placeholders — replace them with your real portfolio in lib/site.ts."
        />

        <div className="mt-12">
          <ProjectsExplorer
            projects={projects}
            categories={projectCategories}
          />
        </div>
      </Section>

      <Testimonials />

      <ContactCTA
        title="Have a similar project?"
        body="Share the scope and we will tell you how we would approach it, what it will take and what it should cost."
      />
    </>
  );
}
