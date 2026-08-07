import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight } from "@/components/ui/Icons";
import { RevealGroup, RevealItem } from "@/components/ui/Motion";
import ProjectCard from "@/components/ui/ProjectCard";
import { Section, SectionHeading } from "@/components/ui/Section";
import { projects } from "@/lib/site";

/** Featured projects strip for the home page. */
export default function FeaturedProjects() {
  const featured = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <Section>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <SectionHeading
          eyebrow="Featured projects"
          title="Recently delivered"
          lead="A sample of substation, solar, metering and lighting projects completed across the region."
        />
        <ButtonLink href="/projects" variant="outline" className="shrink-0">
          All Projects
          <ArrowRight />
        </ButtonLink>
      </div>

      <RevealGroup className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featured.map((project) => (
          <RevealItem key={project.slug}>
            <ProjectCard project={project} />
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
