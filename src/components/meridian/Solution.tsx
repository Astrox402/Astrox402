import { SectionHeader } from "./Section";

export function Solution() {
  return (
    <section id="protocol" className="relative py-32 border-t border-border">
      <div className="absolute inset-0 grid-bg radial-fade opacity-30" />
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="The protocol"
          title={<>Access and payment, <span className="font-serif italic">unified into one request.</span></>}
          intro="Meridian collapses entitlement, metering, and settlement into a single primitive. Every resource declares its price. Every caller — human or machine — pays in the same flow that grants access."
        />

        <div className="mt-16 grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-surface/40 p-8">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-6">Before</div>
            <pre className="font-mono text-[12.5px] leading-relaxed text-muted-foreground overflow-x-auto">{`auth.verify(token)
plan.checkLimit(user)
ratelimit.consume(user)
metering.record(usage)
billing.invoice(month)
stripe.charge(invoice)
ledger.reconcile()
support.handle(disputes)`}</pre>
          </div>
          <div className="rounded-2xl border border-accent/30 bg-surface/60 p-8 accent-glow">
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-accent mb-6">With Meridian</div>
            <pre className="font-mono text-[12.5px] leading-relaxed text-foreground overflow-x-auto">{`meridian.serve({
  resource: "/infer",
  price:    "0.0021 USDC",
  scope:    "inference.gpt",
  settle:   "ethereum"
})

// access ⇆ payment ⇆ proof
// in one round-trip`}</pre>
          </div>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            ["Per-request", "Price by call, capability, payload, or outcome."],
            ["Programmable", "Logic-driven pricing, not static SKUs."],
            ["Composable", "Settle in any token, on any chain Meridian routes."],
            ["Verifiable", "Onchain proof of access and exchange, by default."],
          ].map(([t, d]) => (
            <div key={t} className="border-t border-border pt-5">
              <div className="text-[14px] font-medium mb-1.5">{t}</div>
              <div className="text-[13px] text-muted-foreground leading-relaxed">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
