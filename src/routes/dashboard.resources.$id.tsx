import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/resources/$id")({
  component: ResourceDetailPage,
});

const RESOURCE_DATA: Record<string, any> = {
  r1: {
    name: "GPT Inference API", type: "Endpoint", price: "0.0021 USDC", network: "Solana",
    status: "active", url: "https://api.astro.x402/v1/infer", scope: "inference.gpt",
    ttl: "60s", asset: "USDC (SPL)", rule: "per-request", requests: 12840, revenue: "$26.96",
    successRate: "99.7%",
    logs: [
      { time: "2s ago",   method: "POST", path: "/v1/infer",   status: 200, amount: "0.0021", tx: "5JhkL…q9Rv" },
      { time: "18s ago",  method: "POST", path: "/v1/infer",   status: 402, amount: "—",      tx: "—" },
      { time: "22s ago",  method: "POST", path: "/v1/infer",   status: 200, amount: "0.0021", tx: "8KmNP…x3Tz" },
      { time: "1m ago",   method: "POST", path: "/v1/infer",   status: 200, amount: "0.0021", tx: "2QrST…n7Wv" },
      { time: "2m ago",   method: "POST", path: "/v1/infer",   status: 200, amount: "0.0021", tx: "9LpFK…m2Yx" },
    ],
    payments: [
      { time: "2s ago",   tx: "5JhkL…q9Rv", slot: "281,492,120", amount: "0.0021 USDC", status: "settled" },
      { time: "22s ago",  tx: "8KmNP…x3Tz", slot: "281,492,088", amount: "0.0021 USDC", status: "settled" },
      { time: "1m ago",   tx: "2QrST…n7Wv", slot: "281,492,010", amount: "0.0021 USDC", status: "settled" },
      { time: "2m ago",   tx: "9LpFK…m2Yx", slot: "281,491,980", amount: "0.0021 USDC", status: "settled" },
    ],
  },
};

const FALLBACK = {
  name: "Resource", type: "Endpoint", price: "0.005 USDC", network: "Solana",
  status: "active", url: "https://api.astro.x402/v1/resource", scope: "resource.default",
  ttl: "60s", asset: "USDC (SPL)", rule: "per-request", requests: 0, revenue: "$0.00",
  successRate: "—", logs: [], payments: [],
};

function ResourceDetailPage() {
  const { id } = Route.useParams();
  const r = RESOURCE_DATA[id] ?? FALLBACK;

  return (
    <div className="p-6 space-y-6 max-w-[1100px]">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/resources" className="text-[12px] font-mono text-muted-foreground hover:text-foreground transition-colors">← Resources</Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-[12px] font-mono text-foreground">{r.name}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">{r.name}</h1>
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
              r.status === "active" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
            }`}>
              <span className={`h-1 w-1 rounded-full ${r.status === "active" ? "bg-emerald-400" : "bg-yellow-400"}`}/>
              {r.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 font-mono">{r.url}</p>
        </div>
        <button className="flex-shrink-0 h-9 px-4 rounded-lg border border-border text-[13px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
          Edit resource
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { k: "Requests", v: r.requests.toLocaleString() },
          { k: "Revenue",  v: r.revenue, color: "text-emerald-400" },
          { k: "Success rate", v: r.successRate, color: "text-accent" },
          { k: "Network",  v: r.network },
        ].map((s) => (
          <div key={s.k} className="rounded-xl border border-border bg-surface/50 p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{s.k}</div>
            <div className={`text-xl font-semibold font-mono mt-1 ${s.color ?? "text-foreground"}`}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface/50 p-5">
          <div className="text-[13px] font-medium mb-4">Pricing config</div>
          <div className="space-y-3 font-mono text-[12px]">
            {[
              { k: "price",   v: r.price },
              { k: "scope",   v: r.scope },
              { k: "ttl",     v: r.ttl },
              { k: "asset",   v: r.asset },
              { k: "rule",    v: r.rule },
              { k: "network", v: r.network },
            ].map(({ k, v }) => (
              <div key={k} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                <span className="text-muted-foreground">{k}</span>
                <span className="text-foreground">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/50 p-5">
          <div className="text-[13px] font-medium mb-4">402 header (live)</div>
          <pre className="text-[11px] font-mono text-muted-foreground leading-relaxed overflow-x-auto">{`HTTP/1.1 402 Payment Required
X-Payment-Price: ${r.price}
X-Payment-Scope: ${r.scope}
X-Payment-TTL: ${r.ttl}
X-Payment-Asset: ${r.asset.split(" ")[0]}
X-Payment-Network: ${r.network.toLowerCase()}
X-Payment-Dest: 8xMHk…rV2Qw`}</pre>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/50">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="text-[13px] font-medium">Request logs</div>
          <span className="text-[11px] font-mono text-muted-foreground">Last 5 requests</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border/60">
                {["Time", "Method", "Path", "Status", "Amount", "TX"].map((h) => (
                  <th key={h} className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {r.logs.map((l: any, i: number) => (
                <tr key={i} className="hover:bg-white/2">
                  <td className="px-5 py-3 font-mono text-muted-foreground">{l.time}</td>
                  <td className="px-5 py-3 font-mono text-accent/80">{l.method}</td>
                  <td className="px-5 py-3 font-mono">{l.path}</td>
                  <td className="px-5 py-3">
                    <span className={`font-mono text-[11px] ${l.status === 200 ? "text-emerald-400" : "text-yellow-400"}`}>{l.status}</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-emerald-400/80">{l.amount}</td>
                  <td className="px-5 py-3 font-mono text-muted-foreground/60">{l.tx}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/50">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="text-[13px] font-medium">Settlement events</div>
          <span className="text-[11px] font-mono text-muted-foreground">On-chain</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border/60">
                {["Time", "TX hash", "Slot", "Amount", "Status"].map((h) => (
                  <th key={h} className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {r.payments.map((p: any, i: number) => (
                <tr key={i} className="hover:bg-white/2">
                  <td className="px-5 py-3 font-mono text-muted-foreground">{p.time}</td>
                  <td className="px-5 py-3 font-mono text-accent/70">{p.tx}</td>
                  <td className="px-5 py-3 font-mono text-muted-foreground">{p.slot}</td>
                  <td className="px-5 py-3 font-mono text-emerald-400">{p.amount}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                      <span className="h-1 w-1 rounded-full bg-emerald-400"/>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
