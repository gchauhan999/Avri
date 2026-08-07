import type { Metadata } from "next";

import { Reveal } from "@/components/ui/Motion";
import PageHero from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import {
  LICENCE_URLS,
  creditGroups,
  needsAttribution,
  type ImageCredit,
} from "@/lib/image-credits";
import { company } from "@/lib/site";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Image Credits",
  description: `Photographers and licences for the photographs used on the ${company.name} website.`,
  path: "/image-credits",
});

function Credit({ credit }: { credit: ImageCredit }) {
  return (
    <li className="flex flex-col gap-1 border-t border-ink-100 py-4 sm:flex-row sm:items-baseline sm:gap-6">
      <span className="text-sm font-semibold text-ink-900 sm:w-64 sm:shrink-0">
        {credit.subject}
      </span>
      <span className="text-sm leading-relaxed text-ink-500">
        {credit.author ? <>Photograph by {credit.author}. </> : null}
        <a
          href={LICENCE_URLS[credit.licence]}
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium text-brand-600 underline-offset-2 hover:underline"
        >
          {credit.licence}
        </a>
        {credit.sourceUrl ? (
          <>
            {" · "}
            <a
              href={credit.sourceUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="text-brand-600 underline-offset-2 hover:underline"
            >
              source
            </a>
          </>
        ) : null}
        <span className="ml-2 font-mono text-xs text-ink-300">{credit.file}</span>
      </span>
    </li>
  );
}

export default function ImageCreditsPage() {
  const attributed = creditGroups
    .flatMap((g) => g.credits)
    .filter((c) => needsAttribution(c.licence)).length;

  return (
    <>
      <PageHero
        eyebrow="Image credits"
        title="Photographers and licences"
        lead="Some of the photographs on this site are used under Creative Commons licences that ask for the photographer to be named. This page names them."
        breadcrumb="Image Credits"
      />

      <Section>
        <div className="max-w-3xl">
          <p className="text-base leading-relaxed text-ink-600">
            The product renders throughout the catalogue are our own artwork.
            The remaining imagery is either licensed from Pexels or in the
            public domain — neither requires a credit — except for the{" "}
            {attributed} photograph{attributed === 1 ? "" : "s"} listed below,
            which are used under a Creative Commons licence that does. Each
            entry links to the licence deed and to the original.
          </p>
          <p className="mt-5 text-base leading-relaxed text-ink-600">
            None of these photographs depicts work carried out by{" "}
            {company.name}. They illustrate the type of equipment and the
            sectors we work in. Photographs of our own installations replace
            them as they become available.
          </p>
        </div>

        <div className="mt-16 space-y-16">
          {creditGroups.map((group) => (
            <Reveal key={group.title}>
              <section>
                <h2 className="text-xl font-bold tracking-tight text-ink-900">
                  {group.title}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-500">
                  {group.note}
                </p>
                <ul className="mt-6">
                  {group.credits.map((credit) => (
                    <Credit key={credit.file} credit={credit} />
                  ))}
                </ul>
              </section>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
