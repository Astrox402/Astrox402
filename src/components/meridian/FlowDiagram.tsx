export function FlowDiagram() {
  return (
    <div className="relative mx-auto max-w-5xl rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-8 accent-glow">
      <div className="flex items-center justify-between mb-6 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Live request flow
        </span>
        <span>x402.meridian.eth</span>
      </div>

      <div className="grid md:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-4">
        {/* Agent */}
        <Node label="Agent" sub="caller" code="POST /infer" />

        <Arrow />

        {/* Protocol */}
        <div className="rounded-xl border border-accent/40 bg-background/60 p-5 relative">
          <div className="absolute -top-px left-4 right-4 scan-line h-px" />
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-accent mb-3">402 Payment Required</div>
          <div className="space-y-1.5 font-mono text-[12px] text-foreground/80">
            <div><span className="text-muted-foreground">price</span>  = 0.0021 USDC</div>
            <div><span className="text-muted-foreground">scope</span>  = inference.gpt</div>
            <div><span className="text-muted-foreground">ttl</span>    = 60s</div>
            <div><span className="text-muted-foreground">chain</span>  = solana</div>
          </div>
        </div>

        <Arrow />

        <Node label="Resource" sub="endpoint" code="200 OK" highlight />
      </div>

      <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-6 text-[12px]">
        <Stat k="Settlement" v="~1.2s" />
        <Stat k="Fee" v="0.3%" />
        <Stat k="Onchain" v="Solana" />
      </div>
    </div>
  );
}

function Node({ label, sub, code, highlight }: { label: string; sub: string; code: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border ${highlight ? "border-accent/30" : "border-border"} bg-background/40 p-5`}>
      <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3">{sub}</div>
      <div className="text-[15px] font-medium mb-2">{label}</div>
      <div className="font-mono text-[12px] text-muted-foreground">{code}</div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden md:flex items-center justify-center">
      <svg width="48" height="20" viewBox="0 0 48 20" fill="none">
        <path d="M2 10 H42 M36 4 L42 10 L36 16" stroke="currentColor" strokeWidth="1" className="text-accent/60" strokeDasharray="4 4" pathLength={1} />
      </svg>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{k}</div>
      <div className="mt-1 text-foreground">{v}</div>
    </div>
  );
}
