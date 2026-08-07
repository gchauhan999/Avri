import type { ReactNode } from "react";
import { Reveal } from "./Motion";
import { Section } from "./Section";

export interface LegalClause {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

/**
 * Shared renderer for the privacy policy and terms pages, so both documents
 * stay visually consistent and are edited as plain data.
 */
export default function LegalDocument({
  updated,
  intro,
  clauses,
  footer,
}: {
  updated: string;
  intro: string;
  clauses: LegalClause[];
  footer?: ReactNode;
}) {
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-16">
        {/* Contents rail */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
            Contents
          </p>
          <ol className="mt-5 space-y-2.5 text-sm">
            {clauses.map((c, i) => (
              <li key={c.heading}>
                <a
                  href={`#clause-${i + 1}`}
                  className="text-ink-500 transition-colors hover:text-brand-600"
                >
                  {i + 1}. {c.heading}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        <div className="max-w-3xl">
          <p className="text-sm text-ink-400">Last updated: {updated}</p>
          <p className="mt-5 text-base leading-relaxed text-ink-600">{intro}</p>

          <div className="mt-12 space-y-12">
            {clauses.map((clause, i) => (
              <Reveal key={clause.heading}>
                <section id={`clause-${i + 1}`} className="scroll-mt-28">
                  <h2 className="text-xl font-bold tracking-tight text-ink-900">
                    <span className="mr-2.5 font-mono text-sm text-brand-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {clause.heading}
                  </h2>

                  {clause.paragraphs?.map((p) => (
                    <p
                      key={p}
                      className="mt-4 text-sm leading-relaxed text-ink-600"
                    >
                      {p}
                    </p>
                  ))}

                  {clause.bullets ? (
                    <ul className="mt-4 space-y-2.5">
                      {clause.bullets.map((b) => (
                        <li
                          key={b}
                          className="flex gap-3 text-sm leading-relaxed text-ink-600"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400"
                          />
                          {b}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              </Reveal>
            ))}
          </div>

          {footer ? (
            <div className="mt-14 rounded-3xl border border-ink-100 bg-ink-50/60 p-8">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
