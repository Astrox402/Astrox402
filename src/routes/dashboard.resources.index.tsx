import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useResources, type ResourceStatus } from "@/lib/resourceStore";

export const Route = createFileRoute("/dashboard/resources/")({
  component: ResourcesPage,
});

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  paused: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  draft:  "bg-border/30 border-border text-muted-foreground",
};
const STATUS_DOT: Record<string, string> = {
  active: "bg-emerald-400",
  paused: "bg-yellow-400",
  draft:  "bg-muted-foreground",
};

function ResourcesPage() {
  const resources = useResources();
  const [filter, setFilter] = useState<"all" | ResourceStatus>("all");

  const filtered = filter === "all" ? resources : resources.filter((r) => r.status === filter);
  const totalRevenue = resources.reduce((sum, r) => {
    const n = parseFloat(r.revenue.replace("$", "")) || 0;
    return sum + n;
  }, 0);
  const totalRequests = resources.reduce((s, r) => s + r.requests, 0);
  const activeCount = resources.filter((r) => r.status === "active").length;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Resources</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monetized endpoints, capabilities, and digital assets</p>
        </div>
        <Link
          to="/dashboard/resources/new"
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-accent text-background text-[13px] font-medium hover:bg-accent/90 transition-colors flex-shrink-0"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.5 1v11M1 6.5h11"/></svg>
          Create resource
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active resources", value: activeCount.toString(),              color: "text-emerald-400" },
          { label: "Total requests",   value: totalRequests.toLocaleString(),      color: "text-foreground"  },
          { label: "Total revenue",    value: `$${totalRevenue.toFixed(2)}`,       color: "text-accent"      },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface/50 p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className={`text-2xl font-semibold font-mono mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface/50">
        <div className="flex items-center gap-2 p-4 border-b border-border">
          {(["all", "active", "paused", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-mono capitalize transition-colors ${
                filter === f
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {f === "all"
                ? `All (${resources.length})`
                : `${f} (${resources.filter((r) => r.status === f).length})`}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border">
                  {["Name", "Type", "Price", "Requests", "Revenue", "Status", "Last activity", ""].map((h) => (
                    <th key={h} className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-4 py-3 first:pl-5 last:pr-5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-4 py-3.5 pl-5 font-medium max-w-[180px]">
                      <Link to="/dashboard/resources/$id" params={{ id: r.id }} className="hover:text-accent transition-colors truncate block">{r.name}</Link>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground font-mono text-[11px] whitespace-nowrap">{r.type}</td>
                    <td className="px-4 py-3.5 font-mono text-accent/80 whitespace-nowrap">{r.amount} {r.asset}</td>
                    <td className="px-4 py-3.5 font-mono">{r.requests.toLocaleString()}</td>
                    <td className="px-4 py-3.5 font-mono text-emerald-400">{r.revenue}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full border ${STATUS_COLORS[r.status]}`}>
                        <span className={`h-1 w-1 rounded-full ${STATUS_DOT[r.status]}`}/>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground text-[11px] font-mono whitespace-nowrap">{r.lastActivity}</td>
                    <td className="px-4 py-3.5 pr-5">
                      <Link to="/dashboard/resources/$id" params={{ id: r.id }}
                        className="text-[11px] font-mono text-muted-foreground/40 hover:text-accent transition-colors opacity-0 group-hover:opacity-100">
                        View →
                      </Link>
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

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      <div className="h-14 w-14 rounded-2xl border border-border bg-surface/60 flex items-center justify-center text-muted-foreground mb-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <ellipse cx="12" cy="7" rx="9" ry="3.5"/>
          <path d="M3 7v5c0 1.93 4.03 3.5 9 3.5s9-1.57 9-3.5V7"/>
          <path d="M3 12v5c0 1.93 4.03 3.5 9 3.5s9-1.57 9-3.5v-5"/>
        </svg>
      </div>
      <h3 className="text-[15px] font-semibold mb-2">No resources yet</h3>
      <p className="text-[13px] text-muted-foreground max-w-xs mb-6">
        Create your first monetized resource — a paid endpoint, capability, or digital asset with Solana-native settlement.
      </p>
      <Link
        to="/dashboard/resources/new"
        className="flex items-center gap-2 h-9 px-5 rounded-lg bg-accent text-background text-[13px] font-medium hover:bg-accent/90 transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.5 1v11M1 6.5h11"/></svg>
        Create your first resource
      </Link>
    </div>
  );
}
