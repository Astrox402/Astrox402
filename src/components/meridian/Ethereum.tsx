import { motion } from "framer-motion";
import { SectionHeader } from "./Section";

const ACCENT = "oklch(0.78 0.13 195)";
const ACCENT_DIM = "oklch(0.78 0.13 195 / 0.3)";
const LINE_COLOR = "oklch(1 0 0 / 0.08)";
const DOT_STROKE = "oklch(1 0 0 / 0.06)";

const ORBITS = [
  { r: 60,  duration: 10, dots: 6,  reverse: false },
  { r: 100, duration: 18, dots: 8,  reverse: true  },
  { r: 145, duration: 28, dots: 12, reverse: false },
];

function Orbit({ r, duration, dots, reverse }: { r: number; duration: number; dots: number; reverse: boolean }) {
  return (
    <g>
      <circle cx="200" cy="200" r={r} fill="none" stroke={DOT_STROKE} strokeDasharray="2 6" />
      <motion.g
        style={{ originX: "200px", originY: "200px" }}
        animate={{ rotate: reverse ? -360 : 360 }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
      >
        {Array.from({ length: dots }).map((_, i) => {
          const angle = (i / dots) * 2 * Math.PI;
          const x = 200 + r * Math.cos(angle);
          const y = 200 + r * Math.sin(angle);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="2.5" fill={ACCENT} />
              <circle cx={x} cy={y} r="6" fill="none" stroke={ACCENT_DIM} strokeWidth="1" />
            </g>
          );
        })}
      </motion.g>
    </g>
  );
}

export function Ethereum() {
  return (
    <section id="ethereum" className="relative py-32 border-t border-border overflow-hidden">
      <div className="absolute -right-40 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-accent/8 blur-[140px] pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <SectionHeader
            eyebrow="Settlement"
            title={<>Built on <span className="font-serif italic">Ethereum</span> — for reasons of substance, not signal.</>}
            intro="We chose Ethereum because the payment-native web needs neutral, programmable, composable settlement. Not a tribe. Infrastructure."
          />
          <ul className="mt-10 space-y-5">
            {[
              ["Credible neutrality", "A settlement layer no single party controls."],
              ["Programmable money", "Logic-defined value flows, not static rails."],
              ["Composable ecosystem", "Identity, stablecoins, accounts, intents — already there."],
              ["Open foundation", "Coordinated economics without a closed gatekeeper."],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-4">
                <div className="mt-1.5 h-1 w-6 bg-accent flex-shrink-0" />
                <div>
                  <div className="text-[15px] font-medium">{t}</div>
                  <div className="text-[13.5px] text-muted-foreground mt-0.5">{d}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="aspect-square rounded-2xl border border-border bg-surface/40 p-10 relative overflow-hidden">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <defs>
                <radialGradient id="eth-rg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="oklch(0.78 0.13 195)" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="oklch(0.78 0.13 195)" stopOpacity="0" />
                </radialGradient>
              </defs>

              <circle cx="200" cy="200" r="185" fill="url(#eth-rg)" />

              {[0, 60, 120, 180, 240, 300].map((a) => {
                const rad = (a * Math.PI) / 180;
                return (
                  <line
                    key={a}
                    x1="200" y1="200"
                    x2={200 + 185 * Math.cos(rad)}
                    y2={200 + 185 * Math.sin(rad)}
                    stroke={LINE_COLOR}
                  />
                );
              })}

              {ORBITS.map((o) => (
                <Orbit key={o.r} {...o} />
              ))}

              <g transform="translate(200, 200)">
                <circle r="34" fill="oklch(0.12 0.02 250)" stroke={ACCENT} strokeWidth="1.5" />
                <g transform="scale(0.9)">
                  <polygon points="0,-22 13,-4 0,-8 -13,-4" fill={ACCENT} fillOpacity="0.95" />
                  <polygon points="0,-22 13,-4 0,-8 -13,-4" fill="white" fillOpacity="0.08" />
                  <polygon points="0,-8 13,-4 0,10 -13,-4" fill={ACCENT} fillOpacity="0.65" />
                  <polygon points="0,10 13,-4 0,22 -13,-4" fill="white" fillOpacity="0.0" />
                  <polygon points="0,10 13,-4 0,22" fill={ACCENT} fillOpacity="0.95" />
                  <polygon points="0,10 -13,-4 0,22" fill={ACCENT} fillOpacity="0.7" />
                  <polygon points="0,-8 -13,-4 0,10" fill={ACCENT} fillOpacity="0.4" />
                </g>
              </g>
            </svg>

            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <span>Settlement mesh</span>
              <span className="text-accent">L1 + L2</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
