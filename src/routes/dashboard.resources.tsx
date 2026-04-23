import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/resources")({
  component: ResourcesPage,
});

const RESOURCES = [
  { id: "r1", name: "GPT Inference API",   type: "Endpoint", price: "0.0021 USDC", network: "Solana", status: "active",  lastActivity: "2s ago",    requests: 12840, revenue: "$26.96" },
  { id: "r2", name: "Image Generation",    type: "Endpoint", price: "0.015 USDC",  network: "Solana", status: "active",  lastActivity: "14s ago",   requests: 4291,  revenue: "$64.37" },
  { id: "r3", name: "Embeddings v2",       type: "Endpoint", price: "0.0004 USDC", network: "Solana", status: "active",  lastActivity: "1m ago",    requests: 22100, revenue: "$8.84"  },
  { id: "r4", name: "Dataset Access",      type: "Asset",    price: "0.50 USDC",   network: "Solana", status: "paused",  lastActivity: "2h ago",    requests: 88,    revenue: "$44.00" },
  { id: "r5", name: "Audio Transcription", type: "Endpoint", price: "0.008 USDC",  network: "Solana", status: "active",  lastActivity: "4m ago",    requests: 2014,  revenue: "$16.11" },
  { id: "r6", name: "Research Archive",    type: "Asset",    price: "1.00 USDC",   network: "Solana", status: "draft",   lastActivity: "3d ago",    requests: 0,     revenue: "$0.00"  },
  { id: "r7", name: "Code Review API",     type: "Endpoint", price: "0.003 USDC",  network: "Solana", status: "active",  lastActivity: "8m ago",    requests: 5521,  revenue: "$16.56" },
];

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
  const [filter, setFilter] = useState<"all"|"active"|"paused"|"draft">("all");
  const filtered = filter === "all" ? RESOURCES : RESOURCES.filter((r) => r.status === filter);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Resources</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monetized endpoints and digital assets</p>
        </div>
        <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-accent text-background text-[13px] font-medium hover:bg-accent/90 transition-colors flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 1v12M1 7h12"/></svg>
          Create resource
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active", count: RESOURCES.filter(r => r.status === "active").length, color: "text-emerald-400" },
          { label: "Total requests", count: RESOURCES.reduce((a, r) => a + r.requests, 0).toLocaleString(), color: "text-foreground" },
          { label: "Total revenue", count: "$176.84", color: "text-accent" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface/50 p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className={`text-2xl font-semibold font-mono mt-1 ${s.color}`}>{s.count}</div>
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
                filter === f ? "bg-accent/10 text-accent border border-accent/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {f === "all" ? `All (${RESOURCES.length})` : `${f} (${RESOURCES.filter(r => r.status === f).length})`}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border">
                {["Name", "Type", "Price / request", "Network", "Requests", "Revenue", "Status", "Last activity", ""].map((h) => (
                  <th key={h} className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-4 py-3 first:pl-5 last:pr-5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-4 py-3.5 pl-5 font-medium">
                    <Link to="/dashboard/resources/$id" params={{ id: r.id }} className="hover:text-accent transition-colors">{r.name}</Link>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground font-mono text-[11px]">{r.type}</td>
                  <td className="px-4 py-3.5 font-mono text-accent/80">{r.price}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{r.network}</td>
                  <td className="px-4 py-3.5 font-mono">{r.requests.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-mono text-emerald-400">{r.revenue}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full border ${STATUS_COLORS[r.status]}`}>
                      <span className={`h-1 w-1 rounded-full ${STATUS_DOT[r.status]}`}/>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground text-[11px] font-mono">{r.lastActivity}</td>
                  <td className="px-4 py-3.5 pr-5">
                    <Link to="/dashboard/resources/$id" params={{ id: r.id }} className="text-[11px] font-mono text-muted-foreground/40 hover:text-accent transition-colors opacity-0 group-hover:opacity-100">
                      View →
                    </Link>
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
