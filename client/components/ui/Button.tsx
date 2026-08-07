import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60";

const variants = {
  primary:
    "bg-brand-500 text-white shadow-sm shadow-brand-900/20 hover:bg-brand-600 hover:shadow-md hover:shadow-brand-900/25",
  accent:
    "bg-accent-500 text-white shadow-sm shadow-accent-900/20 hover:bg-accent-600 hover:shadow-md",
  dark: "bg-ink-900 text-white hover:bg-ink-800",
  outline:
    "border border-ink-200 bg-white text-ink-800 hover:border-brand-500 hover:text-brand-600",
  ghostLight:
    "border border-white/25 text-white backdrop-blur hover:border-white/60 hover:bg-white/10",
  soft: "bg-brand-50 text-brand-700 hover:bg-brand-100",
} as const;

const sizes = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3",
  lg: "px-7 py-3.5 text-base",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

function classes(
  variant: ButtonVariant,
  size: ButtonSize,
  className: string
): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${className}`;
}

/** Anything that leaves the app (tel:, mailto:, http) renders a plain anchor. */
function isExternal(href: string) {
  return /^(https?:|tel:|mailto:|#)/.test(href);
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
  newTab = false,
  ...rest
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  newTab?: boolean;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">) {
  const cls = classes(variant, size, className);

  if (isExternal(href)) {
    return (
      <a
        href={href}
        className={cls}
        {...(newTab ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={cls}
      {...(newTab ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
} & ComponentProps<"button">) {
  return (
    <button className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}
