import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight, Check, Phone } from "@/components/ui/Icons";
import Media from "@/components/ui/Media";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Motion";
import { Container, Eyebrow } from "@/components/ui/Section";
import { company, contact, stats, telHref } from "@/lib/site";

const promises = [
  "Turnkey EPC — single point of accountability",
  "Licensed HT & LT execution up to 220 kV",
  "In-house design, execution and O&M teams",
];

/** Home page hero banner. */
export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink-900">
      {/* Brand glows and grid */}
      <div
        aria-hidden="true"
        className="absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-brand-500/22 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-52 left-1/5 h-[26rem] w-[26rem] rounded-full bg-accent-500/14 blur-3xl"
      />
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
        <defs>
          <pattern id="hero-lines" width="52" height="52" patternUnits="userSpaceOnUse">
            <path
              d="M52 0H0v52"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-white/[0.06]"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-lines)" />
      </svg>

      <Container className="relative grid items-center gap-14 py-20 lg:grid-cols-2 lg:py-28">
        {/* Copy */}
        <div>
          <Reveal>
            <Eyebrow tone="light">{company.tagline}</Eyebrow>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Electrical EPC &amp;
              <span className="text-brand-400"> renewable energy</span>
              <br className="hidden sm:block" /> infrastructure
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
              From substations and HT/LT networks to solar plants, smart
              metering and EV charging — {company.name} engineers, builds and
              maintains the power infrastructure your operations depend on.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <ul className="mt-8 space-y-3">
              {promises.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm text-white/80">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="mt-9 flex flex-wrap gap-3">
              <ButtonLink href="/request-a-quote" size="lg">
                Request a Quote
                <ArrowRight />
              </ButtonLink>
              <ButtonLink href="/services" variant="ghostLight" size="lg">
                Explore Services
              </ButtonLink>
            </div>
          </Reveal>

          <RevealGroup
            as="dl"
            className="mt-12 grid max-w-lg grid-cols-2 gap-x-8 gap-y-6 border-t border-white/10 pt-8 sm:grid-cols-4"
          >
            {stats.map((s) => (
              <RevealItem key={s.label}>
                <dt className="text-2xl font-bold text-white">{s.value}</dt>
                <dd className="mt-1 text-xs leading-snug text-white/55">
                  {s.label}
                </dd>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        {/* Visual + glass contact card */}
        <Reveal preset="scale" delay={0.15} className="relative lg:justify-self-end lg:pb-14">
          {/* Drop a photo at public/assets/hero/hero.jpg and pass it as `src`
              to replace the branded illustration. */}
          <Media
            illustration="epc"
            alt={`${company.name} electrical infrastructure project`}
            ratio="aspect-[4/3]"
            sizes="(min-width: 1024px) 46vw, 100vw"
            priority
            className="shadow-2xl shadow-black/40 ring-1 ring-white/10"
          />

          <div className="glass-dark mt-6 rounded-2xl p-6 ring-1 ring-white/12 lg:absolute lg:-bottom-2 lg:-left-12 lg:mt-0 lg:w-72">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">
              Speak to an engineer
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              Free site survey and load assessment, anywhere in our region.
            </p>
            <div className="mt-5 space-y-2">
              {contact.phones.map((p) => (
                <a
                  key={p}
                  href={telHref(p)}
                  className="flex items-center justify-between rounded-xl bg-white/8 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <span className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4 text-brand-300" />
                    {p}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-brand-300" />
                </a>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
