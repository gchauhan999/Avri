/** Small stroked icon set. All icons inherit `currentColor`. */

type IconProps = { className?: string };

function Svg({
  children,
  className = "h-5 w-5",
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

export const ArrowRight = ({ className = "h-4 w-4" }: IconProps) => (
  <Svg className={className}>
    <path d="M4 12h15m0 0-6-6m6 6-6 6" />
  </Svg>
);

export const ArrowUp = ({ className = "h-5 w-5" }: IconProps) => (
  <Svg className={className}>
    <path d="M12 19V5m0 0-6 6m6-6 6 6" />
  </Svg>
);

export const ChevronDown = ({ className = "h-4 w-4" }: IconProps) => (
  <Svg className={className}>
    <path d="m6 9.5 6 6 6-6" />
  </Svg>
);

export const Check = ({ className = "h-5 w-5" }: IconProps) => (
  <Svg className={className}>
    <path d="m4.5 12.5 5 5 10-11" />
  </Svg>
);

export const Phone = ({ className = "h-5 w-5" }: IconProps) => (
  <Svg className={className}>
    <path d="M5 4h3.5l1.6 4-2.2 1.4a12 12 0 0 0 5.7 5.7L15 12.9l4 1.6V18a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4 7.2 2 2 0 0 1 5 4Z" />
  </Svg>
);

export const Mail = ({ className = "h-5 w-5" }: IconProps) => (
  <Svg className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </Svg>
);

export const Pin = ({ className = "h-5 w-5" }: IconProps) => (
  <Svg className={className}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </Svg>
);

export const Clock = ({ className = "h-5 w-5" }: IconProps) => (
  <Svg className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.2l3.2 2" />
  </Svg>
);

export const Menu = ({ className = "h-5 w-5" }: IconProps) => (
  <Svg className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);

export const Close = ({ className = "h-5 w-5" }: IconProps) => (
  <Svg className={className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

export const Plus = ({ className = "h-4 w-4" }: IconProps) => (
  <Svg className={className}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const Search = ({ className = "h-5 w-5" }: IconProps) => (
  <Svg className={className}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </Svg>
);

export const Download = ({ className = "h-4 w-4" }: IconProps) => (
  <Svg className={className}>
    <path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" />
  </Svg>
);

export const Quote = ({ className = "h-8 w-8" }: IconProps) => (
  <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M13 8.5c-4.5 1.6-7 5-7 9.4 0 3.6 2.2 6.1 5.3 6.1 2.7 0 4.7-1.9 4.7-4.5 0-2.5-1.8-4.3-4.2-4.3-.4 0-.8 0-1.1.1.5-2 2-3.6 4.3-4.6l-2-2.2Zm13 0c-4.5 1.6-7 5-7 9.4 0 3.6 2.2 6.1 5.3 6.1 2.7 0 4.7-1.9 4.7-4.5 0-2.5-1.8-4.3-4.2-4.3-.4 0-.8 0-1.1.1.5-2 2-3.6 4.3-4.6l-2-2.2Z" />
  </svg>
);

export const WhatsApp = ({ className = "h-6 w-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.34-1.4a9.8 9.8 0 0 0 4.7 1.2h.01c5.43 0 9.84-4.4 9.84-9.84 0-2.63-1.02-5.1-2.88-6.96A9.76 9.76 0 0 0 12.04 2Zm0 17.96h-.01a8.2 8.2 0 0 1-4.16-1.14l-.3-.18-3.1.81.83-3.02-.2-.31a8.14 8.14 0 0 1-1.25-4.36c0-4.51 3.68-8.18 8.2-8.18a8.13 8.13 0 0 1 5.78 2.4 8.1 8.1 0 0 1 2.4 5.79c0 4.51-3.68 8.19-8.19 8.19Zm4.5-6.13c-.25-.13-1.46-.72-1.69-.8-.22-.09-.39-.13-.55.12s-.63.8-.77.97c-.14.16-.28.18-.53.06a6.7 6.7 0 0 1-1.97-1.22 7.4 7.4 0 0 1-1.36-1.7c-.15-.24 0-.38.11-.5.11-.11.25-.29.37-.44.12-.15.16-.25.25-.42.08-.16.04-.31-.02-.44-.06-.12-.55-1.33-.76-1.82-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.16 1.71 2.62 4.15 3.67.58.25 1.03.4 1.39.51.58.19 1.11.16 1.53.1.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.29Z" />
  </svg>
);

export const Facebook = ({ className = "h-4 w-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M14 8.5V7c0-.7.3-1 1-1h1.5V3H14c-2.2 0-3.5 1.4-3.5 3.7V8.5H8V12h2.5v9H14v-9h2.4l.4-3.5H14Z" />
  </svg>
);

export const LinkedIn = ({ className = "h-4 w-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.2 8.5h3.6V21H3.2V8.5Zm6 0h3.45v1.7h.05c.48-.9 1.66-1.86 3.42-1.86 3.66 0 4.33 2.35 4.33 5.4V21h-3.6v-5.6c0-1.34-.02-3.06-1.9-3.06-1.9 0-2.2 1.45-2.2 2.96V21H9.2V8.5Z" />
  </svg>
);

export const Instagram = ({ className = "h-4 w-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M12 2.9c2.96 0 3.31.01 4.48.07 1.08.05 1.67.23 2.06.38.52.2.89.44 1.28.83.39.39.64.76.83 1.28.15.39.33.98.38 2.06.06 1.17.07 1.52.07 4.48s-.01 3.31-.07 4.48c-.05 1.08-.23 1.67-.38 2.06-.2.52-.44.89-.83 1.28-.39.39-.76.64-1.28.83-.39.15-.98.33-2.06.38-1.17.06-1.52.07-4.48.07s-3.31-.01-4.48-.07c-1.08-.05-1.67-.23-2.06-.38a3.45 3.45 0 0 1-1.28-.83 3.45 3.45 0 0 1-.83-1.28c-.15-.39-.33-.98-.38-2.06C2.91 15.31 2.9 14.96 2.9 12s.01-3.31.07-4.48c.05-1.08.23-1.67.38-2.06.2-.52.44-.89.83-1.28.39-.39.76-.64 1.28-.83.39-.15.98-.33 2.06-.38C8.69 2.91 9.04 2.9 12 2.9Zm0 5.1a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 6.6a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2Zm5.1-6.75a.93.93 0 1 1-1.86 0 .93.93 0 0 1 1.86 0Z" />
  </svg>
);

export const YouTube = ({ className = "h-4 w-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M21.6 7.2s-.2-1.4-.8-2c-.75-.8-1.6-.8-2-.85C16 4.2 12 4.2 12 4.2h-.01s-4 0-6.8.2c-.4.05-1.25.05-2 .85-.6.6-.8 2-.8 2S2.2 8.8 2.2 10.4v1.5c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.75.8 1.74.78 2.2.87 1.6.15 6.8.2 6.8.2s4 0 6.8-.21c.4-.05 1.25-.05 2-.85.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.5c0-1.6-.2-3.2-.2-3.2ZM9.9 14.2V8.9l5.4 2.66-5.4 2.64Z" />
  </svg>
);

export const XIcon = ({ className = "h-4 w-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M17.53 3h3.02l-6.6 7.54L21.75 21h-5.9l-4.63-6.05L5.92 21H2.9l7.06-8.07L2.5 3h6.05l4.19 5.53L17.53 3Zm-1.06 16.2h1.67L7.6 4.71H5.81L16.47 19.2Z" />
  </svg>
);

/** Maps a social label from the site config onto its icon. */
export const socialIcons: Record<
  string,
  (props: IconProps) => React.JSX.Element
> = {
  Facebook,
  LinkedIn,
  Instagram,
  YouTube,
  X: XIcon,
};
