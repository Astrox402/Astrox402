import { createFileRoute, Link } from "@tanstack/react-router";
import { useResources } from "@/lib/resourceStore";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

const RECENT_ACTIVITY = [
  { time: "just now", event: "Payment settled", resource: "GPT Inference API", amount: "+$0.0021", type: "paid"   },
  { time: "12s ago",  event: "Payment settled", resource: "Image Generation",  amount: "+$0.015",  type: "paid"   },
  { time: "34s ago",  event: "402 issued",      resource: "Embeddings v2",     amount: "0.0004",   type: "quote"  },
  { time: "1m ago",   event: "Payment settled", resource: "GPT Inference API", amount: "+$0.0021", type: "paid"   },
  { time: "2m ago",   event: "Intent failed",   resource: "Dataset Access",    amount: "0.50",     type: "failed" },
  { time: "3m ago",   event: "Payment settled", resource: "Embeddings v2",     amount: "+$0.0004", type: "paid"   },
];

const CHART_BARS = [42, 67, 53, 88, 71, 95, 60, 78, 84, 92, 70, 100];

function DashboardOverview() {
  const resources = useResources();

  const totalRevenue = resources.reduce((s, r) => s + (parseFloat(r.revenue.replace("$", "")) || 0), 0);
  const totalRequests = resources.reduce((s, r) => s + r.requests, 0);
  const activeCount = resources.filter((r) => r.status === "active").length;
  const paidRate = totalRequests > 0 ? "96.3%" : "—";

  const STATS = [
    { label: "Total Revenue",     value: `$${totalRevenue.toFixed(2)}`, sub: "+12.4% this week",  color: "accent"  },
    { label: "Total Requests",    value: totalRequests.toLocaleString(), sub: "+2,103 today",       color: "blue"    },
    { label: "Active Resources",  value: activeCount.toString(),          sub: `${resources.length} total`,  color: "purple"  },
    { label: "Paid Requests",     value: paidRate,                       sub: "34 failed (0.07%)", color: "green"   },
  ];

  const recentResources = [...resources].reverse().slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your x402 control plane</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface/50 p-5 relative overflow-hidden">
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

      {/* Chart + Activity */}
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

      {/* Recent resources */}
      <div className="rounded-xl border border-border bg-surface/50 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[13px] font-medium">Recent resources</div>
          <Link to="/dashboard/resources" className="text-[11px] font-mono text-accent/70 hover:text-accent transition-colors">View all →</Link>
        </div>

        {recentResources.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-[12px] text-muted-foreground mb-3">No resources yet.</p>
            <Link to="/dashboard/resources/new" className="text-[12px] text-accent hover:underline">Create your first resource →</Link>
          </div>
        ) : (
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
                {recentResources.map((r) => (
                  <tr key={r.id} className="group">
                    <td className="py-3 pr-6">
                      <Link to="/dashboard/resources/$id" params={{ id: r.id }} className="font-medium hover:text-accent transition-colors">{r.name}</Link>
                    </td>
                    <td className="py-3 pr-6 text-muted-foreground font-mono text-[11px]">{r.type}</td>
                    <td className="py-3 pr-6 font-mono text-accent/80">{r.amount} {r.asset}</td>
                    <td className="py-3 pr-6 font-mono">{r.requests.toLocaleString()}</td>
                    <td className="py-3 pr-6 font-mono text-emerald-400">{r.revenue}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        r.status === "active" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                        r.status === "paused" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
                        "bg-border/30 border-border text-muted-foreground"
                      }`}>
                        <span className={`h-1 w-1 rounded-full ${r.status === "active" ? "bg-emerald-400" : r.status === "paused" ? "bg-yellow-400" : "bg-muted-foreground"}`}/>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
