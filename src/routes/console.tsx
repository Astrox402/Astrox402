import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/meridian/Nav";
import { Footer } from "@/components/meridian/Footer";

export const Route = createFileRoute("/console")({
  component: ConsolePage,
});

const FEATURES = [
  {
    icon: "⬡",
    title: "Endpoint explorer",
    desc: "Browse every Meridian-enabled endpoint you've deployed. Inspect live pricing functions, scope configs, and settlement settings in one view.",
  },
  {
    icon: "◈",
    title: "Revenue streams",
    desc: "Real-time settlement feed across all your endpoints and chains. Filter by resource, caller, date range, or chain. Export to CSV or push to your warehouse.",
  },
  {
    icon: "◎",
    title: "Receipt log",
    desc: "Every paid call produces a verifiable onchain receipt. Browse, filter, and verify receipts directly — no third-party explorer required.",
  },
  {
    icon: "⬙",
    title: "Access policies",
    desc: "Define who can call what, at what price, under which scopes. Configure per-caller allowances, rate limits, and budget caps without touching your endpoint code.",
  },
  {
    icon: "◇",
    title: "Pricing playground",
    desc: "Write and test pricing functions interactively. Simulate different call patterns, token volumes, and chain conditions before deploying to production.",
  },
  {
    icon: "⬕",
    title: "API keys & teams",
    desc: "Issue scoped API keys for your team and integrations. Track usage per key, revoke instantly, and set per-key spend ceilings.",
  },
];

const STATS = [
  { v: "< 50 ms", l: "Median quote latency" },
  { v: "99.98 %", l: "Uptime SLA" },
  { v: "4 chains", l: "L1 + L2 settlement" },
  { v: "∞", l: "Receipts stored" },
];

function ConsolePage() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <Nav />

      <div className="pt-32 pb-24">
        <div className="mx-auto max-w-7xl px-6">

          <div className="max-w-3xl mb-20">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent mb-5">Console</div>
            <h1 className="text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] tracking-[-0.03em] font-medium text-gradient">
              Your control plane for the payment-native web.
            </h1>
            <p className="mt-6 text-[17px] leading-relaxed text-muted-foreground max-w-2xl">
              Meridian Console gives you full visibility into every endpoint, receipt, and revenue stream — across every chain, every caller, and every resource you've deployed.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <a href="#waitlist" className="inline-flex h-10 items-center px-5 rounded-md bg-foreground text-background text-[13.5px] font-medium hover:bg-foreground/90 transition-colors">
                Request early access
              </a>
              <Link to="/docs" className="inline-flex h-10 items-center px-5 rounded-md border border-border text-[13.5px] text-muted-foreground hover:text-foreground transition-colors">
                Read the docs →
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
            {STATS.map((s) => (
              <div key={s.l} className="rounded-2xl border border-border bg-surface/30 px-6 py-8 text-center">
                <div className="text-[2rem] font-medium tracking-tight text-foreground mb-2">{s.v}</div>
                <div className="text-[12px] font-mono uppercase tracking-[0.16em] text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-20 mb-20">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-10">Features</div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((f) => (
                <div key={f.title} className="rounded-2xl border border-border bg-surface/20 p-7 hover:border-accent/30 hover:bg-surface/40 transition-colors">
                  <div className="text-accent text-[22px] mb-4">{f.icon}</div>
                  <h3 className="text-[16px] font-medium mb-2">{f.title}</h3>
                  <p className="text-[13.5px] text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-20">
            <div className="rounded-2xl border border-border bg-surface/20 p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-[22px] font-medium mb-2">Console is in private beta.</h2>
                <p className="text-[14px] text-muted-foreground max-w-md">Join the waitlist to get early access. We're onboarding teams by workload — API providers, agent teams, and data marketplaces first.</p>
              </div>
              <a href="#waitlist" className="flex-shrink-0 inline-flex h-10 items-center px-6 rounded-md bg-foreground text-background text-[13.5px] font-medium hover:bg-foreground/90 transition-colors">
                Request access
              </a>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
