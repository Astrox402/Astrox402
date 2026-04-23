import { SectionHeader } from "./Section";

export function Dashboard() {
  return (
    <section className="relative py-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Console"
          title={<>One surface for endpoints, <span className="font-serif italic">pricing, and proofs.</span></>}
          intro="Define resources, watch settlement land, audit access. Built for engineers who ship."
        />

        <div className="mt-16 rounded-2xl border border-border bg-surface/40 overflow-hidden accent-glow">
          {/* Window chrome */}
          <div className="flex items-center justify-between px-5 h-11 border-b border-border bg-background/60">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                <div className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
                <div className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
              </div>
              <div className="ml-3 font-mono text-[11px] text-muted-foreground">console.meridian.eth / endpoints</div>
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-slow" />
              Live
            </div>
          </div>

          <div className="grid lg:grid-cols-[220px_1fr] min-h-[520px]">
            {/* Sidebar */}
            <div className="border-r border-border p-5 space-y-1 text-[13px]">
              {[
                ["Endpoints", true],
                ["Pricing rules", false],
                ["Settlements", false],
                ["Access policies", false],
                ["Agents", false],
                ["Webhooks", false],
                ["API keys", false],
                ["Audit log", false],
              ].map(([label, active]) => (
                <div key={label as string} className={`px-3 py-2 rounded-md flex items-center justify-between ${active ? "bg-surface text-foreground" : "text-muted-foreground"}`}>
                  <span>{label}</span>
                  {active && <span className="font-mono text-[10px] text-accent">8</span>}
                </div>
              ))}
            </div>

            {/* Main */}
            <div className="p-7">
              <div className="flex items-end justify-between mb-7">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-1">Last 24h revenue</div>
                  <div className="text-[34px] font-medium tracking-tight">2,481.42 <span className="text-[14px] text-muted-foreground font-mono">USDC</span></div>
                </div>
                <div className="text-right text-[12px] text-muted-foreground">
                  <div>+18.2% vs yesterday</div>
                  <div className="font-mono">412,930 calls</div>
                </div>
              </div>

              {/* Sparkline */}
              <div className="h-24 mb-7 relative rounded-lg border border-border bg-background/40 p-2 overflow-hidden">
                <svg viewBox="0 0 400 80" className="w-full h-full">
                  <defs>
                    <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.78 0.13 195)" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="oklch(0.78 0.13 195)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,60 L30,55 L60,58 L90,40 L120,45 L150,30 L180,38 L210,22 L240,28 L270,18 L300,24 L330,12 L360,18 L400,8 L400,80 L0,80 Z" fill="url(#spark)" />
                  <path d="M0,60 L30,55 L60,58 L90,40 L120,45 L150,30 L180,38 L210,22 L240,28 L270,18 L300,24 L330,12 L360,18 L400,8" fill="none" stroke="oklch(0.78 0.13 195)" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Endpoints table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-4 py-2.5 bg-background/60 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground border-b border-border">
                  <div>Endpoint</div><div>Price</div><div>Calls / 24h</div><div>Revenue</div><div>Status</div>
                </div>
                {[
                  ["/v1/infer", "0.0021 USDC", "184,210", "386.84", "200"],
                  ["/v1/translate", "0.0008 USDC", "92,441", "73.95", "200"],
                  ["/v1/embed", "0.00012 USDC", "1.2M", "144.00", "200"],
                  ["/v1/render", "0.012 USDC", "8,442", "101.30", "200"],
                  ["/v1/agent.tools.search", "0.0004 USDC", "126,837", "50.73", "200"],
                ].map((row, i) => (
                  <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr_80px] gap-4 px-4 py-3 text-[13px] border-b border-border last:border-0 hover:bg-surface/40 transition-colors">
                    <div className="font-mono text-foreground">{row[0]}</div>
                    <div className="font-mono text-muted-foreground">{row[1]}</div>
                    <div className="font-mono text-muted-foreground">{row[2]}</div>
                    <div className="font-mono">{row[3]}</div>
                    <div className="font-mono text-accent text-[11px]">● {row[4]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
