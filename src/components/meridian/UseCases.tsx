import { SectionHeader } from "./Section";

const cases = [
  { t: "Paid APIs", d: "Turn any endpoint into a metered, monetized surface — no billing stack required.", tag: "endpoint" },
  { t: "Agent ⇄ tool commerce", d: "Let autonomous agents pay for capabilities they invoke, in real time, by request.", tag: "agentic" },
  { t: "Monetized data access", d: "Sell rows, queries, or feeds. Price granularly. Settle continuously.", tag: "data" },
  { t: "Premium content & resources", d: "Gate articles, models, weights, or media behind native protocol payments.", tag: "content" },
  { t: "Compute-on-demand", d: "Charge per inference, per render, per job — not per seat.", tag: "compute" },
  { t: "Infrastructure monetization", d: "Storage, RPC, indexing, vector search — every infra primitive becomes a paid endpoint.", tag: "infra" },
];

export function UseCases() {
  return (
    <section id="usecases" className="relative py-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Use cases"
          title={<>Anything callable <span className="font-serif italic">becomes priceable.</span></>}
          intro="Astro is a substrate, not a product category. These are early shapes of what the payment-native web makes possible."
        />

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cases.map((c) => (
            <div key={c.t} className="group relative rounded-xl border border-border bg-surface/30 p-7 hover:bg-surface/60 hover:border-accent/30 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="h-9 w-9 rounded-md border border-border bg-background flex items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{c.tag}</span>
              </div>
              <h3 className="text-[17px] font-medium mb-2 tracking-tight">{c.t}</h3>
              <p className="text-[13.5px] text-muted-foreground leading-relaxed">{c.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
