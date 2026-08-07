import type { IllustrationKey } from "@/lib/types";

/**
 * Branded line-art used wherever a real photograph has not been supplied.
 *
 * Drawn on a fixed 400×260 canvas and scaled with `xMidYMid slice`, so it
 * behaves like a background image inside any frame. Replace it with real
 * photography by setting the `image` field on the relevant entry in
 * `lib/site.ts` — see `public/assets/README.md`.
 */

const G = "var(--color-brand-500)";
const A = "var(--color-accent-500)";
const L = "var(--color-brand-300)";

/** Common stroke settings for the line-art. */
const line = {
  fill: "none",
  stroke: G,
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
const soft = { ...line, stroke: L, strokeWidth: 1.8 };

const scenes: Record<IllustrationKey, React.ReactNode> = {
  /* Engineering drawing over a pylon */
  epc: (
    <g>
      <rect x="46" y="70" width="150" height="118" rx="6" {...line} />
      <path d="M64 96h72M64 116h108M64 136h56M64 156h88" {...soft} />
      <path d="M262 196 288 74l26 122" {...line} />
      <path d="M270 166h36M276 138h24M281 112h14" {...line} />
      <path d="M244 122h88M252 96h72" {...line} />
      <circle cx="288" cy="66" r="7" fill={A} />
      <path d="M28 206h344" {...soft} />
    </g>
  ),

  /* Transmission pylon with catenary lines */
  htlt: (
    <g>
      <path d="M108 196 138 62l30 134" {...line} />
      <path d="M116 162h44M122 130h32M128 102h20" {...line} />
      <path d="M92 112h92M100 84h76" {...line} />
      <path d="M262 196 282 88l20 108" {...soft} />
      <path d="M268 168h28M272 136h20" {...soft} />
      <path d="M250 122h64" {...soft} />
      <path d="M92 112q95 44 158 10" {...soft} />
      <path d="M100 84q92 46 150 38" {...soft} />
      <circle cx="138" cy="56" r="7" fill={A} />
      <path d="M28 206h344" {...soft} />
    </g>
  ),

  /* Switchyard bus-bars and insulator stacks */
  substation: (
    <g>
      <path d="M56 196V96M144 196V96M232 196V96M320 196V96" {...line} />
      <path d="M40 96h296M40 122h296" {...line} />
      {[56, 144, 232, 320].map((x) => (
        <g key={x}>
          <path d={`M${x - 12} 140h24M${x - 12} 154h24M${x - 12} 168h24`} {...soft} />
        </g>
      ))}
      <circle cx="144" cy="82" r="7" fill={A} />
      <path d="M28 206h344" {...soft} />
    </g>
  ),

  /* Distribution transformer with radiator fins */
  transformer: (
    <g>
      <rect x="132" y="104" width="136" height="92" rx="8" {...line} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={106} y={116 + i * 20} width="26" height="9" rx="3" {...soft} />
          <rect x={268} y={116 + i * 20} width="26" height="9" rx="3" {...soft} />
        </g>
      ))}
      {[164, 200, 236].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 104V78`} {...line} />
          <path d={`M${x - 10} 92h20M${x - 10} 84h20`} {...soft} />
          <circle cx={x} cy={70} r="6" fill={i === 1 ? A : G} />
        </g>
      ))}
      <path d="M28 206h344" {...soft} />
    </g>
  ),

  /* Smart meter with signal arcs */
  metering: (
    <g>
      <rect x="120" y="66" width="120" height="140" rx="12" {...line} />
      <rect x="140" y="88" width="80" height="42" rx="6" {...soft} />
      <path d="M152 110h26M188 110h20" {...line} />
      <circle cx="160" cy="158" r="12" {...soft} />
      <circle cx="200" cy="158" r="12" {...soft} />
      <path d="M262 96a52 52 0 0 1 0 74" {...line} />
      <path d="M284 76a84 84 0 0 1 0 114" {...soft} />
      <circle cx="248" cy="133" r="6" fill={A} />
    </g>
  ),

  /* Efficiency gauge with trend line */
  energy: (
    <g>
      <path d="M96 176a86 86 0 0 1 172 0" {...line} />
      <path d="M118 176a64 64 0 0 1 128 0" {...soft} />
      <path d="M182 176 232 118" stroke={A} strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="182" cy="176" r="8" fill={A} />
      <path d="M110 206h148" {...soft} />
      <path d="M292 156l22-26 20 14 26-42" {...line} />
      <circle cx="360" cy="102" r="5" fill={A} />
    </g>
  ),

  /* Solar array with sun */
  solar: (
    <g>
      <path d="M74 178 96 106h130l-22 72Z" {...line} />
      <path d="M88 154h122M102 130h116M124 106 108 178M170 106l-16 72" {...soft} />
      <path d="M140 178v24M120 202h44" {...line} />
      <circle cx="308" cy="82" r="24" fill={A} opacity="0.9" />
      <path d="M308 40v-12M308 136v-12M266 82h-12M362 82h-12M279 53l-9-9M346 120l-9-9M337 53l9-9M270 120l9-9" {...line} stroke={A} />
      <path d="M28 206h344" {...soft} />
    </g>
  ),

  /* Control screen and gears */
  automation: (
    <g>
      <rect x="70" y="66" width="176" height="118" rx="10" {...line} />
      <path d="M70 96h176" {...soft} />
      <path d="M92 126h48M92 146h72M92 166h36" {...soft} />
      <path d="M158 184v18h-56" {...soft} />
      <circle cx="304" cy="118" r="34" {...line} />
      <circle cx="304" cy="118" r="13" {...soft} />
      {Array.from({ length: 8 }).map((_, i) => (
        <path
          key={i}
          d="M304 76v-12"
          {...line}
          transform={`rotate(${i * 45} 304 118)`}
        />
      ))}
      <circle cx="304" cy="176" r="16" {...soft} />
      <circle cx="86" cy="81" r="4" fill={A} />
    </g>
  ),

  /* Spanner, gear and a checked report */
  maintenance: (
    <g>
      <circle cx="130" cy="130" r="46" {...line} />
      <circle cx="130" cy="130" r="18" {...soft} />
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d="M130 76v-14" {...line} transform={`rotate(${i * 45} 130 130)`} />
      ))}
      <g transform="rotate(-38 244 140)">
        <rect x="232" y="96" width="22" height="96" rx="9" {...line} />
        <path d="M230 96a13 13 0 1 1 26 0l-7 8h-12Z" {...line} />
      </g>
      <rect x="288" y="82" width="76" height="94" rx="8" {...line} />
      <path d="M302 128l12 12 22-28" stroke={A} strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M302 100h48M302 158h32" {...soft} />
    </g>
  ),

  /* Factory outline with a bolt */
  industrial: (
    <g>
      <path d="M62 196V116l52 30V116l52 30V88h64v108Z" {...line} />
      <path d="M182 116h28M182 142h28M182 168h28" {...soft} />
      <path d="M82 166h20M134 166h20" {...soft} />
      <path d="M266 196V96h76v100" {...soft} />
      <path d="M286 122h36M286 148h36" {...soft} />
      <path d="M300 60l-18 38h16l-6 34 28-44h-18l10-28z" fill={A} />
      <path d="M28 206h344" {...soft} />
    </g>
  ),

  /* Street lighting poles with light cones */
  "street-light": (
    <g>
      {[
        { x: 96, h: 72 },
        { x: 216, h: 60 },
        { x: 320, h: 50 },
      ].map((p, i) => (
        <g key={p.x} opacity={1 - i * 0.22}>
          <path d={`M${p.x} 196V${p.h}`} {...line} />
          <path d={`M${p.x} ${p.h}q22 0 26 22`} {...line} />
          <rect x={p.x + 14} y={p.h + 20} width="26" height="9" rx="4" fill={A} />
          <path
            d={`M${p.x + 14} ${p.h + 29}L${p.x - 6} 196h74Z`}
            fill={A}
            opacity="0.13"
          />
        </g>
      ))}
      <path d="M28 200h344" {...soft} />
      <path d="M28 210h60M116 210h60M204 210h60M292 210h60" {...soft} stroke={A} />
    </g>
  ),

  /* EV charger and vehicle */
  ev: (
    <g>
      <rect x="256" y="76" width="72" height="120" rx="12" {...line} />
      <rect x="272" y="94" width="40" height="34" rx="5" {...soft} />
      <path d="M292 60l-12 26h11l-4 22 18-30h-12l7-18z" fill={A} />
      <path d="M256 148h-24a12 12 0 0 0-12 12v14" {...soft} />
      <path d="M60 172h132M74 172l14-40h74l20 40" {...line} />
      <circle cx="94" cy="180" r="14" {...line} />
      <circle cx="168" cy="180" r="14" {...line} />
      <path d="M100 132h40" {...soft} />
      <path d="M28 206h344" {...soft} />
    </g>
  ),

  /* Stacked equipment crates */
  supply: (
    <g>
      <rect x="66" y="112" width="96" height="84" rx="6" {...line} />
      <rect x="170" y="86" width="82" height="110" rx="6" {...line} />
      <rect x="260" y="130" width="76" height="66" rx="6" {...soft} />
      <path d="M66 140h96M170 118h82M260 152h76" {...soft} />
      <path d="M106 112V96h16v16M202 86V70h18v16" {...soft} />
      <path d="M210 150l-10 22h9l-3 18 15-25h-10l6-15z" fill={A} />
      <path d="M28 206h344" {...soft} />
    </g>
  ),

  /* Utility network nodes */
  utility: (
    <g>
      <circle cx="200" cy="130" r="26" {...line} />
      <path d="M200 106l-10 22h9l-3 18 15-25h-10l6-15z" fill={A} />
      {[
        [86, 74],
        [314, 74],
        [70, 178],
        [330, 178],
        [200, 200],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <path d={`M200 130L${x} ${y}`} {...soft} />
          <circle cx={x} cy={y} r="13" {...line} />
        </g>
      ))}
    </g>
  ),

  /* Institutional building */
  government: (
    <g>
      <path d="M78 96 200 52l122 44" {...line} />
      <path d="M78 96h244" {...line} />
      {[104, 152, 200, 248, 296].map((x) => (
        <path key={x} d={`M${x} 110v70`} {...line} />
      ))}
      <path d="M78 110h244M70 180h260M60 196h280" {...line} />
      <circle cx="200" cy="74" r="6" fill={A} />
    </g>
  ),

  /* Bridge and roadway */
  infrastructure: (
    <g>
      <path d="M36 152h328" {...line} />
      <path d="M36 168h328" {...soft} />
      <path d="M108 152V72M292 152V72" {...line} />
      <path d="M36 128q72-56 72-56 0 0 92 46 92-46 92-46t72 56" {...soft} />
      {[64, 148, 200, 252, 336].map((x) => (
        <path key={x} d={`M${x} 152V${x === 200 ? 110 : 118}`} {...soft} />
      ))}
      <path d="M60 190h44M140 190h44M220 190h44M300 190h44" {...soft} stroke={A} />
    </g>
  ),

  /* Connected city skyline */
  "smart-city": (
    <g>
      <rect x="64" y="118" width="54" height="78" rx="4" {...line} />
      <rect x="130" y="86" width="60" height="110" rx="4" {...line} />
      <rect x="202" y="130" width="50" height="66" rx="4" {...soft} />
      <rect x="264" y="100" width="62" height="96" rx="4" {...line} />
      <path d="M78 138h26M78 158h26M146 106h28M146 128h28M146 150h28M278 120h34M278 142h34" {...soft} />
      <circle cx="160" cy="66" r="7" fill={A} />
      <circle cx="295" cy="80" r="7" fill={A} />
      <path d="M160 66q68 6 135 14" {...soft} stroke={A} />
      <path d="M28 206h344" {...soft} />
    </g>
  ),

  /* Commercial tower */
  commercial: (
    <g>
      <rect x="118" y="60" width="112" height="136" rx="6" {...line} />
      <rect x="240" y="112" width="72" height="84" rx="6" {...soft} />
      {[0, 1, 2, 3, 4].map((r) =>
        [0, 1, 2].map((c) => (
          <rect
            key={`${r}-${c}`}
            x={134 + c * 30}
            y={78 + r * 24}
            width="20"
            height="14"
            rx="3"
            {...soft}
          />
        ))
      )}
      <path d="M252 130h48M252 154h48M252 178h48" {...soft} />
      <circle cx="174" cy="48" r="6" fill={A} />
      <path d="M28 206h344" {...soft} />
    </g>
  ),

  /* Housing cluster */
  residential: (
    <g>
      <path d="M78 196v-64l58-42 58 42v64Z" {...line} />
      <path d="M212 196v-48l48-34 48 34v48Z" {...soft} />
      <rect x="118" y="146" width="26" height="22" rx="3" {...soft} />
      <rect x="152" y="146" width="26" height="22" rx="3" {...soft} />
      <rect x="124" y="178" width="26" height="18" rx="3" {...line} />
      <rect x="244" y="158" width="22" height="18" rx="3" {...soft} />
      <path d="M136 90v-14h20" {...soft} />
      <circle cx="260" cy="102" r="6" fill={A} />
      <path d="M28 206h344" {...soft} />
    </g>
  ),

  /* Site crew */
  team: (
    <g>
      {[
        { x: 118, s: 1, c: G },
        { x: 200, s: 1.08, c: A },
        { x: 282, s: 1, c: G },
      ].map((p) => (
        <g key={p.x}>
          <path
            d={`M${p.x - 26} 100a26 26 0 0 1 52 0Z`}
            fill="none"
            stroke={p.c}
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path d={`M${p.x - 32} 100h64`} stroke={p.c} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx={p.x} cy={124} r="16" {...line} />
          <path
            d={`M${p.x} 142c-22 0-34 14-34 32v22h68v-22c0-18-12-32-34-32z`}
            {...line}
          />
        </g>
      ))}
      <path d="M28 206h344" {...soft} />
    </g>
  ),
};

/**
 * The background wash and grid are drawn in CSS rather than SVG `<defs>`, so
 * the same illustration can appear many times on one page without emitting
 * duplicate element ids.
 */
export default function Illustration({
  variant,
  className = "",
}: {
  variant: IllustrationKey;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`relative h-full w-full bg-gradient-to-br from-brand-50 via-white to-accent-50 ${className}`}
    >
      {/* Faint engineering grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-brand-500) 1px, transparent 1px), linear-gradient(to bottom, var(--color-brand-500) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <svg
        viewBox="0 0 400 260"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
        className="relative h-full w-full"
      >
        {scenes[variant] ?? scenes.epc}
      </svg>
    </div>
  );
}
