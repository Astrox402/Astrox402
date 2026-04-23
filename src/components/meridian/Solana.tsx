import { motion } from "framer-motion";
import { SectionHeader } from "./Section";

const A = "oklch(0.72 0.26 355)";
const A20 = "oklch(0.72 0.26 355 / 0.20)";
const A08 = "oklch(0.72 0.26 355 / 0.08)";
const A40 = "oklch(0.72 0.26 355 / 0.40)";
const DARK = "oklch(0.09 0.012 345)";

const NODES = [
  { id: 0, x: 200, y: 200, r: 10, hub: true,  label: "HUB"   },
  { id: 1, x:  88, y:  98, r:  6, hub: false, label: null    },
  { id: 2, x: 316, y:  82, r:  6, hub: false, label: null    },
  { id: 3, x: 362, y: 208, r:  6, hub: false, label: null    },
  { id: 4, x: 298, y: 332, r:  6, hub: false, label: null    },
  { id: 5, x: 104, y: 328, r:  6, hub: false, label: null    },
  { id: 6, x:  46, y: 210, r:  5, hub: false, label: null    },
  { id: 7, x: 200, y:  44, r:  5, hub: false, label: null    },
  { id: 8, x: 356, y: 318, r:  4, hub: false, label: null    },
  { id: 9, x:  54, y: 318, r:  4, hub: false, label: null    },
];

const EDGES = [
  { a: 0, b: 1, dur: 1.7,  delay: 0.0 },
  { a: 0, b: 2, dur: 1.9,  delay: 0.3 },
  { a: 0, b: 3, dur: 1.6,  delay: 0.7 },
  { a: 0, b: 4, dur: 2.0,  delay: 1.1 },
  { a: 0, b: 5, dur: 1.8,  delay: 0.5 },
  { a: 0, b: 6, dur: 2.1,  delay: 0.9 },
  { a: 1, b: 7, dur: 1.4,  delay: 0.2 },
  { a: 2, b: 7, dur: 1.5,  delay: 0.8 },
  { a: 3, b: 8, dur: 1.3,  delay: 0.4 },
  { a: 4, b: 8, dur: 1.6,  delay: 1.2 },
  { a: 5, b: 9, dur: 1.4,  delay: 0.6 },
  { a: 1, b: 6, dur: 1.9,  delay: 1.4 },
  { a: 2, b: 3, dur: 1.7,  delay: 0.1 },
];

const AMOUNTS = [
  { x: 148, y: 138, val: "0.002 SOL", delay: 0 },
  { x: 268, y: 122, val: "1.40 USDC", delay: 0.6 },
  { x: 320, y: 256, val: "0.50 USDC", delay: 1.1 },
  { x: 142, y: 284, val: "0.008 SOL", delay: 0.4 },
];

function nodeLookup(id: number) {
  return NODES[id];
}

function EdgeLine({ a, b }: { a: number; b: number }) {
  const na = nodeLookup(a);
  const nb = nodeLookup(b);
  return (
    <line
      x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
      stroke={A20} strokeWidth="1" strokeDasharray="3 5"
    />
  );
}

function Particle({ a, b, dur, delay, rev = false }: { a: number; b: number; dur: number; delay: number; rev?: boolean }) {
  const na = nodeLookup(a);
  const nb = nodeLookup(b);
  const [x1, y1, x2, y2] = rev
    ? [nb.x, nb.y, na.x, na.y]
    : [na.x, na.y, nb.x, nb.y];
  const path = `M${x1},${y1} L${x2},${y2}`;
  return (
    <g>
      <circle r="2.5" fill={A}>
        <animateMotion path={path} dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.92;1" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
      </circle>
      <circle r="5" fill={A08}>
        <animateMotion path={path} dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
        <animate attributeName="opacity" values="0;0.8;0.8;0" keyTimes="0;0.08;0.92;1" dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" />
      </circle>
    </g>
  );
}

function Node({ x, y, r, hub, delay = 0 }: { x: number; y: number; r: number; hub: boolean; delay?: number }) {
  return (
    <g>
      <motion.circle
        cx={x} cy={y} r={r + 10}
        fill="none" stroke={A}
        strokeWidth="0.8"
        initial={{ opacity: 0.3, scale: 0.85 }}
        animate={{ opacity: [0.3, 0], scale: [0.85, 1.6] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay, repeatDelay: 0.4 }}
        style={{ originX: `${x}px`, originY: `${y}px` }}
      />
      {hub && (
        <motion.circle
          cx={x} cy={y} r={r + 20}
          fill="none" stroke={A}
          strokeWidth="0.5"
          initial={{ opacity: 0.2, scale: 0.8 }}
          animate={{ opacity: [0.2, 0], scale: [0.8, 1.8] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: delay + 0.5, repeatDelay: 0 }}
          style={{ originX: `${x}px`, originY: `${y}px` }}
        />
      )}
      <circle cx={x} cy={y} r={r} fill={DARK} stroke={hub ? A : A40} strokeWidth={hub ? 1.8 : 1.2} />
      <circle cx={x} cy={y} r={r - 2.5} fill={hub ? A08 : "none"} />
      {hub && <circle cx={x} cy={y} r={3} fill={A} />}
    </g>
  );
}

function AmountTag({ x, y, val, delay }: { x: number; y: number; val: string; delay: number }) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay, repeatDelay: 1.2 }}
    >
      <rect x={x - 28} y={y - 9} width={56} height={16} rx={4} fill="oklch(0.14 0.015 250)" stroke={A20} strokeWidth="0.8" />
      <text x={x} y={y + 2.5} textAnchor="middle" fill={A} fontSize="7.5" fontFamily="monospace" letterSpacing="0.03em">
        {val}
      </text>
    </motion.g>
  );
}

export function Solana() {
  return (
    <section id="solana" className="relative py-32 border-t border-border overflow-hidden">
      <div className="absolute -right-40 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-accent/8 blur-[140px] pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <SectionHeader
            eyebrow="Settlement"
            title={<>Built on <span className="font-serif italic">Solana</span> — for reasons of substance, not signal.</>}
            intro="We chose Solana because the payment-native web needs fast, low-cost, composable settlement. Sub-second finality. Fractions of a cent per transaction. Not a tribe. Infrastructure."
          />
          <ul className="mt-10 space-y-5">
            {[
              ["Sub-second finality", "~400ms slot time means payments settle before your response returns."],
              ["Near-zero fees", "Fractions of a cent per transaction — micropayments are finally viable."],
              ["Composable ecosystem", "SPL tokens, stablecoins, wallets, and DeFi — already there."],
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
          <div className="aspect-square rounded-2xl border border-border bg-surface/40 relative overflow-hidden">

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-56 w-56 rounded-full bg-accent/6 blur-[60px]" />
            </div>

            <svg viewBox="0 0 400 400" className="w-full h-full relative z-10">
              <defs>
                <radialGradient id="mesh-rg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={A} stopOpacity="0.10" />
                  <stop offset="100%" stopColor={A} stopOpacity="0" />
                </radialGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              <circle cx="200" cy="200" r="190" fill="url(#mesh-rg)" />

              {EDGES.map((e, i) => (
                <EdgeLine key={i} a={e.a} b={e.b} />
              ))}

              {EDGES.map((e, i) => (
                <g key={i} filter="url(#glow)">
                  <Particle a={e.a} b={e.b} dur={e.dur} delay={e.delay} />
                  <Particle a={e.a} b={e.b} dur={e.dur} delay={e.delay + e.dur * 0.55} rev />
                </g>
              ))}

              {AMOUNTS.map((am, i) => (
                <AmountTag key={i} {...am} />
              ))}

              {NODES.map((n) => (
                <Node key={n.id} {...n} delay={n.id * 0.18} />
              ))}
            </svg>

            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground z-20">
              <span>Settlement mesh</span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-accent">Live · ~400ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
