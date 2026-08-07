import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { ArrowRight } from "@/components/ui/Icons";

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center py-28 text-center sm:py-36">
      <p className="font-mono text-sm font-bold tracking-widest text-accent-500">
        404
      </p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
        This circuit is open
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-ink-500">
        The page you were looking for does not exist or has been moved. Let us
        get you back to something useful.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">
          Back to Home
          <ArrowRight />
        </ButtonLink>
        <ButtonLink href="/contact" variant="outline">
          Contact Us
        </ButtonLink>
      </div>
    </Container>
  );
}
