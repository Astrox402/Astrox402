import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHASES = [
  {
    id: 0,
    label: "Request",
    desc: "Agent calls the paid endpoint",
    active: "agent",
    arrow: "right",
    packet: { label: "POST /infer", color: "accent" },
  },
  {
    id: 1,
    label: "Quote",
    desc: "Server returns HTTP 402 with price",
    active: "protocol",
    arrow: "left",
    packet: { label: "402 ·  0.0021 USDC", color: "accent" },
  },
  {
    id: 2,
    label: "Intent",
    desc: "Agent signs payment intent",
    active: "agent",
    arrow: "right",
    packet: { label: "Signed intent", color: "purple" },
  },
  {
    id: 3,
    label: "Settlement",
    desc: "Settled on Solana · 200 OK",
    active: "resource",
    arrow: "rightlong",
    packet: { label: "200 OK · receipt", color: "green" },
  },
];

const PHASE_DURATION = 2200;

const QUOTE_LINES = [
  { k: "price", v: "0.0021 USDC" },
  { k: "scope", v: "inference.gpt" },
  { k: "ttl",   v: "60s" },
  { k: "chain", v: "solana" },
];

const RECEIPT_LINES = [
  { k: "tx",     v: "5JhkL…q9Rv" },
  { k: "slot",   v: "281,492,088" },
  { k: "amount", v: "0.0021 USDC" },
  { k: "status", v: "settled" },
];

function useCycle(count: number, duration: number) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPhase((p) => (p + 1) % count), duration);
    return () => clearInterval(id);
  }, [count, duration]);
  return phase;
}

function PacketDot({ direction, label, color }: { direction: string; label: string; color: string }) {
  const isRight = direction !== "left";
  const fromX = direction === "left" ? "68%" : "2%";
  const toX = direction === "left" ? "2%" : direction === "rightlong" ? "98%" : "68%";

  const col =
    color === "purple" ? "oklch(0.72 0.18 290)" :
    color === "green"  ? "oklch(0.75 0.18 155)" :
                         "oklch(0.78 0.13 195)";

  return (
    <motion.div
      className="absolute top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none z-20 whitespace-nowrap"
      initial={{ left: fromX, opacity: 0, scale: 0.8 }}
      animate={{ left: toX,   opacity: [0, 1, 1, 0], scale: [0.8, 1, 1, 0.8] }}
      transition={{ duration: PHASE_DURATION / 1000 - 0.3, ease: [0.4, 0, 0.2, 1] }}
      style={{ color: col }}
    >
      <span className="text-[10px] font-mono px-2 py-1 rounded border text-current border-current/30 bg-background/90 shadow-sm shadow-current/20">
        {label}
      </span>
      {isRight ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M6.5 1l5 5-5 5V7.5H.5v-3h6V1z"/></svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ transform: "scaleX(-1)" }}><path d="M6.5 1l5 5-5 5V7.5H.5v-3h6V1z"/></svg>
      )}
    </motion.div>
  );
}

function NodeBox({
  label, sub, code, active, highlight,
}: {
  label: string; sub: string; code: string; active: boolean; highlight?: boolean;
}) {
  return (
    <motion.div
      className={`rounded-xl border p-5 relative overflow-hidden transition-colors duration-300 ${
        active
          ? highlight
            ? "border-emerald-500/60 bg-emerald-500/5"
            : "border-accent/60 bg-accent/5"
          : highlight
            ? "border-border bg-background/40"
            : "border-border bg-background/40"
      }`}
      animate={{ boxShadow: active ? (highlight ? "0 0 20px oklch(0.75 0.18 155 / 0.15)" : "0 0 20px oklch(0.78 0.13 195 / 0.15)") : "0 0 0px transparent" }}
      transition={{ duration: 0.4 }}
    >
      {active && (
        <motion.div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: highlight ? "oklch(0.75 0.18 155)" : "oklch(0.78 0.13 195)" }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      )}
      <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3">{sub}</div>
      <div className="text-[15px] font-medium mb-2">{label}</div>
      <motion.div
        className={`font-mono text-[12px] ${active ? (highlight ? "text-emerald-400" : "text-accent") : "text-muted-foreground"}`}
        animate={{ opacity: active ? 1 : 0.5 }}
      >
        {code}
      </motion.div>
    </motion.div>
  );
}

function ProtocolBox({ active, phase }: { active: boolean; phase: number }) {
  const lines = phase === 3 ? RECEIPT_LINES : QUOTE_LINES;
  const headerText = phase === 3 ? "200 OK · Settled" : "402 Payment Required";
  const headerColor = phase === 3 ? "oklch(0.75 0.18 155)" : "oklch(0.78 0.13 195)";

  return (
    <motion.div
      className="rounded-xl border relative overflow-hidden transition-colors duration-300"
      style={{
        borderColor: active ? (phase === 3 ? "oklch(0.75 0.18 155 / 0.6)" : "oklch(0.78 0.13 195 / 0.5)") : "oklch(0.22 0.01 250)",
        background: active ? (phase === 3 ? "oklch(0.75 0.18 155 / 0.04)" : "oklch(0.78 0.13 195 / 0.04)") : "oklch(0 0 0 / 0.40)",
      }}
      animate={{ boxShadow: active ? "0 0 24px oklch(0.78 0.13 195 / 0.12)" : "0 0 0px transparent" }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${headerColor}, transparent)` }}
        animate={{ opacity: active ? 1 : 0.3 }}
        transition={{ duration: 0.4 }}
      />
      <div className="p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase === 3 ? "receipt" : "quote"}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="text-[11px] font-mono uppercase tracking-[0.18em] mb-3"
              style={{ color: headerColor }}
            >
              {headerText}
            </div>
            <div className="space-y-1.5 font-mono text-[12px] text-foreground/80">
              {lines.map((l, i) => (
                <motion.div
                  key={l.k}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.07 }}
                  className="flex gap-2"
                >
                  <span className="text-muted-foreground w-14 flex-shrink-0">{l.k}</span>
                  <span className={l.k === "status" ? "text-emerald-400" : ""}>{l.v}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ArrowTrack({ direction, active }: { direction: string; active: boolean }) {
  return (
    <div className="hidden md:flex items-center justify-center relative h-5 min-w-[40px]">
      <svg width="48" height="20" viewBox="0 0 48 20" fill="none" className="overflow-visible">
        <path
          d="M2 10 H42"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 4"
          className={active ? "text-accent/80" : "text-border"}
          style={{ transition: "color 0.3s" }}
        />
        <motion.path
          d="M36 4 L42 10 L36 16"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
          className={active ? "text-accent" : "text-border"}
          style={{
            transform: direction === "left" ? "rotate(180deg) translateX(-4px) translateY(-20px)" : "none",
            transition: "color 0.3s",
          }}
        />
      </svg>
    </div>
  );
}

export function FlowDiagram() {
  const phase = useCycle(PHASES.length, PHASE_DURATION);
  const current = PHASES[phase];

  return (
    <div className="relative mx-auto max-w-5xl rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-8 accent-glow">

      <div className="flex items-center justify-between mb-5 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        <span className="flex items-center gap-2">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-accent"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          Live request flow
        </span>
        <span className="text-accent/70">x402.astro</span>
      </div>

      <div className="flex items-center gap-1 mb-6">
        {PHASES.map((p, i) => (
          <div key={p.id} className="flex items-center gap-1 flex-1">
            <motion.div
              className="flex items-center gap-1.5 text-[10px] font-mono tracking-wide"
              animate={{ color: phase === i ? "oklch(0.78 0.13 195)" : "oklch(0.55 0.02 250)" }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="h-1 rounded-full flex-1 min-w-[20px]"
                animate={{ backgroundColor: phase === i ? "oklch(0.78 0.13 195)" : phase > i ? "oklch(0.78 0.13 195 / 0.3)" : "oklch(0.22 0.01 250)" }}
                style={{ height: "2px", minWidth: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </div>
        ))}
      </div>

      <div className="mb-4 h-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <span className="text-[11px] font-mono text-accent bg-accent/10 border border-accent/20 rounded px-2 py-0.5">
              {String(phase + 1).padStart(2, "0")} / {String(PHASES.length).padStart(2, "0")}
            </span>
            <span className="text-[13px] font-medium text-foreground">{current.label}</span>
            <span className="text-[12px] text-muted-foreground">— {current.desc}</span>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="grid md:grid-cols-[1fr_auto_1.3fr_auto_1fr] items-center gap-4 relative">

        <div className="absolute inset-0 pointer-events-none hidden md:block" style={{ zIndex: 10 }}>
          <div className="relative h-full w-full">
            <AnimatePresence>
              {(phase === 0 || phase === 2) && (
                <PacketDot
                  key={`pk-${phase}`}
                  direction={current.arrow}
                  label={current.packet.label}
                  color={current.packet.color}
                />
              )}
              {phase === 1 && (
                <PacketDot
                  key={`pk-1`}
                  direction="left"
                  label={current.packet.label}
                  color="accent"
                />
              )}
              {phase === 3 && (
                <PacketDot
                  key={`pk-3`}
                  direction="rightlong"
                  label={current.packet.label}
                  color="green"
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        <NodeBox
          label="Agent"
          sub="caller"
          code={phase === 2 ? "intent signed" : "POST /infer"}
          active={current.active === "agent"}
        />

        <ArrowTrack direction={phase === 1 ? "left" : "right"} active={phase === 0 || phase === 1 || phase === 2} />

        <ProtocolBox active={current.active === "protocol" || phase === 3} phase={phase} />

        <ArrowTrack direction="right" active={phase === 3} />

        <NodeBox
          label="Resource"
          sub="endpoint"
          code={phase === 3 ? "200 OK ✓" : "awaiting…"}
          active={current.active === "resource"}
          highlight
        />
      </div>

      <div className="mt-6 pt-5 border-t border-border grid grid-cols-3 gap-6 text-[12px]">
        {[
          { k: "Settlement", v: "~400ms" },
          { k: "Fee", v: "< 0.001 SOL" },
          { k: "Network", v: "Solana" },
        ].map(({ k, v }) => (
          <div key={k}>
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{k}</div>
            <div className="mt-1 text-foreground font-mono">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
