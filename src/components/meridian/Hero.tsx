import { motion } from "framer-motion";
import { FlowDiagram } from "./FlowDiagram";

export function Hero() {
  return (
    <section className="relative pt-40 pb-32 overflow-hidden">
      <div className="absolute inset-0 grid-bg radial-fade opacity-60" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <a href="#manifesto" className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface/50 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-slow" />
            Introducing the payment-native web
            <span className="text-foreground/60 group-hover:translate-x-0.5 transition-transform">→</span>
          </a>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="text-center text-[clamp(2.75rem,7vw,5.75rem)] leading-[0.98] tracking-[-0.035em] font-medium text-gradient max-w-5xl mx-auto"
        >
          Make every API,<br />agent, and digital<br />resource <span className="font-serif italic text-accent font-normal">monetizable</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-8 max-w-2xl mx-auto text-center text-[17px] leading-relaxed text-muted-foreground"
        >
          Astro is a payment-native protocol layer for the internet. Price requests,
          settle access, and let software transact with software — natively, on Solana.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <a href="#waitlist" className="inline-flex h-11 items-center px-5 rounded-md bg-foreground text-background text-[14px] font-medium hover:bg-foreground/90 transition-all hover:-translate-y-px">
            Request early access
          </a>
          <a href="/docs" className="inline-flex h-11 items-center px-5 rounded-md border border-border bg-surface/40 text-[14px] font-medium hover:bg-surface transition-colors">
            Read the protocol →
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-20 relative"
        >
          <FlowDiagram />
        </motion.div>

        <div className="mt-20 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground/70">
          <span>Trusted by builders from</span>
          <span className="text-foreground/70">Stripe</span>
          <span className="text-foreground/70">Cloudflare</span>
          <span className="text-foreground/70">Anthropic</span>
          <span className="text-foreground/70">Coinbase</span>
          <span className="text-foreground/70">Vercel</span>
          <span className="text-foreground/70">a16z</span>
        </div>
      </div>
    </section>
  );
}
