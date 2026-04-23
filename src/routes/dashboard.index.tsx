import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

const STATS = [
  { label: "Total Revenue", value: "$1,842.07", sub: "+12.4% this week", color: "accent", icon: "↑" },
  { label: "Total Requests", value: "48,291", sub: "+2,103 today", color: "blue", icon: "∿" },
  { label: "Active Resources", value: "7", sub: "3 endpoints, 4 assets", color: "purple", icon: "◉" },
  { label: "Paid Requests", value: "96.3%", sub: "34 failed (0.07%)", color: "green", icon: "✓" },
];

const RECENT_RESOURCES = [
  { id: "r1", name: "GPT Inference API", type: "Endpoint", price: "0.0021 USDC", status: "active", requests: 12840, revenue: "$26.96" },
  { id: "r2", name: "Image Generation", type: "Endpoint", price: "0.015 USDC", status: "active", requests: 4291, revenue: "$64.37" },
  { id: "r3", name: "Embeddings v2", type: "Endpoint", price: "0.0004 USDC", status: "active", requests: 22100, revenue: "$8.84" },
  { id: "r4", name: "Dataset Access", type: "Asset", price: "0.50 USDC", status: "paused", requests: 88, revenue: "$44.00" },
];

const RECENT_ACTIVITY = [
  { time: "just now",  event: "Payment settled", resource: "GPT Inference API", amount: "+$0.0021", type: "paid" },
  { time: "12s ago",   event: "Payment settled", resource: "Image Generation",  amount: "+$0.015",  type: "paid" },
  { time: "34s ago",   event: "402 issued",       resource: "Embeddings v2",     amount: "0.0004",   type: "quote" },
  { time: "1m ago",    event: "Payment settled", resource: "GPT Inference API", amount: "+$0.0021", type: "paid" },
  { time: "2m ago",    event: "Intent failed",   resource: "Dataset Access",    amount: "0.50",     type: "failed" },
  { time: "3m ago",    event: "Payment settled", resource: "Embeddings v2",     amount: "+$0.0004", type: "paid" },
];

const CHART_BARS = [42, 67, 53, 88, 71, 95, 60, 78, 84, 92, 70, 100];

function DashboardOverview() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your x402 control plane</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface/50 p-5 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-5 ${
              s.color === "accent" ? "bg-accent" : s.color === "blue" ? "bg-blue-500" : s.color === "purple" ? "bg-purple-500" : "bg-emerald-500"
            }`}/>
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">{s.label}</div>
            <div className="text-2xl font-semibold font-mono tracking-tight mb-1">{s.value}</div>
            <div className={`text-[11px] font-mono ${
              s.color === "accent" ? "text-accent/70" : s.color === "blue" ? "text-blue-400/70" : s.color === "purple" ? "text-purple-400/70" : "text-emerald-400/70"
            }`}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-xl border border-border bg-surface/50 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[13px] font-medium">Request volume</div>
              <div className="text-[11px] font-mono text-muted-foreground mt-0.5">Last 12 hours</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"/>
              <span className="text-[11px] font-mono text-muted-foreground">Live</span>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-28">
            {CHART_BARS.map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm bg-accent/20 hover:bg-accent/40 transition-colors relative group" style={{ height: `${h}%` }}>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {Math.round(h * 40)}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground/50">
            <span>12h ago</span><span>6h ago</span><span>now</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/50 p-5">
          <div className="text-[13px] font-medium mb-1">Recent activity</div>
          <div className="text-[11px] font-mono text-muted-foreground mb-4">Real-time payment stream</div>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                  a.type === "paid" ? "bg-emerald-400" : a.type === "failed" ? "bg-red-400" : "bg-accent"
                }`}/>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium truncate">{a.event}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{a.resource}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-[11px] font-mono ${a.type === "paid" ? "text-emerald-400" : a.type === "failed" ? "text-red-400" : "text-muted-foreground"}`}>
                    {a.amount}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[13px] font-medium">Resources</div>
          <Link to="/dashboard/resources" className="text-[11px] font-mono text-accent/70 hover:text-accent transition-colors">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border">
                {["Name", "Type", "Price", "Requests", "Revenue", "Status"].map((h) => (
                  <th key={h} className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground pb-3 pr-6 last:pr-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {RECENT_RESOURCES.map((r) => (
                <tr key={r.id} className="group">
                  <td className="py-3 pr-6">
                    <Link to="/dashboard/resources/$id" params={{ id: r.id }} className="font-medium hover:text-accent transition-colors">{r.name}</Link>
                  </td>
                  <td className="py-3 pr-6 text-muted-foreground font-mono text-[11px]">{r.type}</td>
                  <td className="py-3 pr-6 font-mono text-accent/80">{r.price}</td>
                  <td className="py-3 pr-6 font-mono">{r.requests.toLocaleString()}</td>
                  <td className="py-3 pr-6 font-mono text-emerald-400">{r.revenue}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      r.status === "active"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                    }`}>
                      <span className={`h-1 w-1 rounded-full ${r.status === "active" ? "bg-emerald-400" : "bg-yellow-400"}`}/>
                      {r.status}
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
