import type { ReactNode } from "react";
import { Reveal } from "./Motion";

export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function Section({
  id,
  className = "",
  containerClassName = "",
  children,
}: {
  id?: string;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`py-16 sm:py-24 ${className}`}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}

export function Eyebrow({
  children,
  tone = "dark",
  className = "",
}: {
  children: ReactNode;
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${
        tone === "light"
          ? "bg-white/10 text-white ring-1 ring-white/20"
          : "bg-brand-50 text-brand-700 ring-1 ring-brand-100"
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-accent-500"
      />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  tone = "dark",
  align = "left",
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: "dark" | "light";
  align?: "left" | "center";
  className?: string;
}) {
  const centred = align === "center";

  return (
    <Reveal
      className={`max-w-3xl ${centred ? "mx-auto text-center" : ""} ${className}`}
    >
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      <h2
        className={`mt-5 text-3xl font-bold tracking-tight sm:text-4xl ${
          tone === "light" ? "text-white" : "text-ink-900"
        }`}
      >
        {title}
      </h2>
      {lead ? (
        <p
          className={`mt-4 text-base leading-relaxed sm:text-lg ${
            tone === "light" ? "text-white/75" : "text-ink-500"
          }`}
        >
          {lead}
        </p>
      ) : null}
    </Reveal>
  );
}
