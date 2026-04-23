import { SectionHeader } from "./Section";

const problems = [
  { t: "Subscriptions are blunt", d: "Flat tiers ignore real usage. Power users subsidize idle ones; precision pricing is impossible." },
  { t: "Billing stacks are heavy", d: "Metering, invoicing, retries, dunning, tax. A monetization team before you have monetization." },
  { t: "Access is fragmented", d: "Auth, rate limits, entitlements and payments live in four systems that rarely agree." },
  { t: "Resources can't price themselves", d: "Endpoints have no native way to declare cost, scope, or settlement terms at request time." },
  { t: "Agents can't transact", d: "Autonomous software has no protocol-level way to pay for the capabilities it consumes." },
  { t: "Business models are static", d: "The web distributes information beautifully — and prices it the same way it did in 2008." },
];

export function Problem() {
  return (
    <section className="relative py-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="The gap"
          title={<>Distribution is solved. <span className="font-serif italic text-muted-foreground">Monetization isn't.</span></>}
          intro="The internet became extraordinary at moving information. It never became fluent at moving value alongside it."
        />

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
          {problems.map((p, i) => (
            <div key={i} className="bg-background p-7 hover:bg-surface/40 transition-colors">
              <div className="font-mono text-[11px] text-muted-foreground mb-4">0{i + 1}</div>
              <h3 className="text-[17px] font-medium mb-2 tracking-tight">{p.t}</h3>
              <p className="text-[14px] leading-relaxed text-muted-foreground">{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
