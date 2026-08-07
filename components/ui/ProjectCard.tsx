import Media from "./Media";
import { HoverLift } from "./Motion";
import type { Project } from "@/lib/types";

/** Project card, shared by the home page and the projects listing. */
export default function ProjectCard({ project }: { project: Project }) {
  return (
    <HoverLift className="h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white transition-colors hover:border-brand-200 hover:shadow-xl hover:shadow-ink-900/5">
        <div className="relative">
          <Media
            illustration={project.illustration}
            src={project.image}
            alt={project.title}
            ratio="aspect-[16/10]"
            rounded="rounded-none"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-semibold text-brand-700 backdrop-blur">
            {project.category}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-7">
          <h3 className="text-lg font-bold text-ink-900">{project.title}</h3>
          <p className="mt-1.5 text-xs font-medium text-ink-400">
            {project.client} · {project.location} · {project.year}
          </p>
          <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-500">
            {project.scope}
          </p>

          <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-ink-100 pt-5">
            {project.facts.map((f) => (
              <div key={f.label}>
                <dt className="text-[11px] uppercase tracking-wide text-ink-400">
                  {f.label}
                </dt>
                <dd className="mt-1 text-sm font-bold text-ink-900">
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </article>
    </HoverLift>
  );
}
