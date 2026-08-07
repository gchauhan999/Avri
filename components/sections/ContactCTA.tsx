import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight, Mail, Phone } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Motion";
import { Container, Eyebrow } from "@/components/ui/Section";
import { contact, telHref } from "@/lib/site";

/** Full-width contact call-to-action band. */
export default function ContactCTA({
  title = "Let us look at your requirement",
  body = "Send a drawing, a load list or a short description of the site. You will get a technically sound scope and a straight price.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-600">
      <div
        aria-hidden="true"
        className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent-500/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />

      <Container className="relative py-16 sm:py-20">
        <Reveal className="grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <Eyebrow tone="light">Get in touch</Eyebrow>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
              {body}
            </p>

            <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/90">
              <a
                href={telHref(contact.phones[0])}
                className="inline-flex items-center gap-2.5 font-semibold transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4" />
                {contact.phones[0]}
              </a>
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2.5 font-semibold transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4" />
                {contact.email}
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-stretch">
            <ButtonLink
              href="/request-a-quote"
              variant="accent"
              size="lg"
              className="justify-center"
            >
              Request a Quote
              <ArrowRight />
            </ButtonLink>
            <ButtonLink
              href="/contact"
              variant="ghostLight"
              size="lg"
              className="justify-center"
            >
              Contact Us
            </ButtonLink>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
