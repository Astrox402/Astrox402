import { SectionHeader } from "./Section";

const steps = [
  {
    n: "01",
    t: "Define a resource",
    d: "Declare any endpoint, capability, or asset. Astro wraps it in a payment-aware envelope.",
    code: `meridian.define({\n  id: "translate.v1",\n  kind: "endpoint"\n})`,
  },
  {
    n: "02",
    t: "Set programmable pricing",
    d: "Price by request, payload size, compute, model, or arbitrary logic. Scope and TTL included.",
    code: `price: ({ tokens }) =>\n  tokens * 0.000004\n  + base(0.001)`,
  },
  {
    n: "03",
    t: "Caller pays in-flow",
    d: "Any client — user, app, or agent — receives a 402, signs a payment intent, retries, gets data.",
    code: `→ 402 Payment Required\n← signed intent\n→ 200 OK + receipt`,
  },
  {
    n: "04",
    t: "Settle and observe",
    d: "Settlement clears on Solana. Usage, revenue, and access proofs land in your dashboard live.",
    code: `settle.tx → 0x9f…2a\nrevenue +0.0021 USDC\nproof onchain ✓`,
  },
];

export function HowItWorks() {
  return (
    <section id="flow" className="relative py-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="How it works"
          title={<>Four steps. <span className="font-serif italic text-muted-foreground">One protocol.</span></>}
        />

        <div className="mt-16 grid lg:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {steps.map((s) => (
            <div key={s.n} className="bg-background p-7 flex flex-col">
              <div className="font-mono text-[11px] tracking-[0.2em] text-accent mb-6">{s.n}</div>
              <h3 className="text-[18px] font-medium mb-2 tracking-tight">{s.t}</h3>
              <p className="text-[13.5px] text-muted-foreground leading-relaxed mb-6 flex-1">{s.d}</p>
              <pre className="font-mono text-[11.5px] leading-relaxed text-foreground/70 bg-surface/40 border border-border rounded-md p-3 whitespace-pre-wrap">{s.code}</pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
