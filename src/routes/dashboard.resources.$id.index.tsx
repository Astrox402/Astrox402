import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { resourceStore, useResource, type ResourceStatus } from "@/lib/resourceStore";

export const Route = createFileRoute("/dashboard/resources/$id/")({
  component: ResourceDetailPage,
});

const STATUS_STYLES: Record<string, string> = {
  active:   "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  paused:   "bg-yellow-500/10  border-yellow-500/20  text-yellow-400",
  draft:    "bg-border/30      border-border          text-muted-foreground",
  archived: "bg-red-500/10     border-red-500/20      text-red-400",
};
const STATUS_DOT: Record<string, string> = {
  active:   "bg-emerald-400",
  paused:   "bg-yellow-400",
  draft:    "bg-muted-foreground",
  archived: "bg-red-400",
};

const LIFECYCLE_ACTIONS: Record<ResourceStatus, { label: string; next: ResourceStatus; style: string }[]> = {
  draft:    [{ label: "Activate",  next: "active",   style: "text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" }],
  active:   [
    { label: "Pause",    next: "paused",   style: "text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"  },
    { label: "Archive",  next: "archived", style: "text-red-400    border-red-500/30    hover:bg-red-500/10"     },
  ],
  paused:   [
    { label: "Resume",   next: "active",   style: "text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" },
    { label: "Archive",  next: "archived", style: "text-red-400    border-red-500/30    hover:bg-red-500/10"     },
  ],
  archived: [{ label: "Restore",   next: "draft",    style: "text-muted-foreground border-border hover:bg-white/5" }],
};

function ResourceDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const r = useResource(id);
  const [confirming, setConfirming] = useState<ResourceStatus | null>(null);

  if (!r) {
    return (
      <div className="p-6 max-w-[900px]">
        <Link to="/dashboard/resources" className="text-[12px] font-mono text-muted-foreground hover:text-foreground transition-colors">← Resources</Link>
        <div className="mt-12 text-center">
          <div className="text-[13px] text-muted-foreground">Resource not found.</div>
          <Link to="/dashboard/resources" className="mt-4 inline-block text-[13px] text-accent hover:underline">Back to resources</Link>
        </div>
      </div>
    );
  }

  const successRate = r.requests > 0
    ? `${(((r.requests - r.logs.filter(l => l.status === 402).length) / r.requests) * 100).toFixed(1)}%`
    : "—";

  function applyLifecycle(next: ResourceStatus) {
    resourceStore.update(id, { status: next, lastActivity: "just now" });
    setConfirming(null);
  }

  return (
    <div className="p-6 space-y-6 max-w-[1100px]">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] font-mono text-muted-foreground">
        <Link to="/dashboard/resources" className="hover:text-foreground transition-colors">← Resources</Link>
        <span className="text-muted-foreground/30">/</span>
        <span className="text-foreground">{r.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold">{r.name}</h1>
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full border flex-shrink-0 ${STATUS_STYLES[r.status]}`}>
              <span className={`h-1 w-1 rounded-full ${STATUS_DOT[r.status]}`}/>
              {r.status}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-border text-muted-foreground flex-shrink-0">
              {r.type}
            </span>
          </div>
          {r.description && <p className="text-[13px] text-muted-foreground mt-1.5 max-w-xl">{r.description}</p>}
          <p className="text-[12px] font-mono text-muted-foreground/60 mt-1">{r.url}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Lifecycle buttons */}
          {LIFECYCLE_ACTIONS[r.status]?.map((action) => (
            confirming === action.next ? (
              <div key={action.next} className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-muted-foreground">Confirm?</span>
                <button
                  onClick={() => applyLifecycle(action.next)}
                  className={`h-8 px-3 rounded-lg border text-[11px] font-mono transition-colors ${action.style}`}
                >Yes</button>
                <button
                  onClick={() => setConfirming(null)}
                  className="h-8 px-3 rounded-lg border border-border text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                >No</button>
              </div>
            ) : (
              <button
                key={action.next}
                onClick={() => setConfirming(action.next)}
                className={`h-9 px-3.5 rounded-lg border text-[12px] font-mono transition-colors ${action.style}`}
              >{action.label}</button>
            )
          ))}
          <button
            onClick={() => navigate({ to: "/dashboard/resources/$id/edit", params: { id } })}
            className="h-9 px-4 rounded-lg border border-border text-[13px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { k: "Requests",     v: r.requests.toLocaleString() },
          { k: "Revenue",      v: r.revenue,  color: "text-emerald-400" },
          { k: "Success rate", v: r.requests > 0 ? successRate : "—", color: "text-accent" },
          { k: "Environment",  v: r.environment },
        ].map((s) => (
          <div key={s.k} className="rounded-xl border border-border bg-surface/50 p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{s.k}</div>
            <div className={`text-xl font-semibold font-mono mt-1 ${s.color ?? "text-foreground"}`}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Config panels */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-surface/50 p-5">
          <div className="text-[13px] font-medium mb-4">Payment configuration</div>
          <div className="space-y-0 font-mono text-[12px]">
            {[
              { k: "Pricing model",   v: r.pricingModel },
              { k: "Amount",          v: `${r.amount} ${r.asset}` },
              { k: "Asset",           v: `${r.asset} (SPL token)` },
              { k: "Payment rail",    v: "Solana" },
              { k: "Scope",           v: r.scope },
              { k: "TTL",             v: r.ttl },
              { k: "Visibility",      v: r.visibility },
              { k: "Method",          v: r.method },
            ].map(({ k, v }) => (
              <div key={k} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                <span className="text-muted-foreground">{k}</span>
                <span className="text-foreground">{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface/50 p-5">
          <div className="text-[13px] font-medium mb-4">Generated 402 header</div>
          <pre className="text-[11px] font-mono text-muted-foreground leading-relaxed overflow-x-auto">{`HTTP/1.1 402 Payment Required
X-Payment-Price: ${r.amount} ${r.asset}
X-Payment-Scope: ${r.scope}
X-Payment-TTL: ${r.ttl}
X-Payment-Asset: ${r.asset}
X-Payment-Network: solana
X-Payment-Dest: 8xMHk…rV2Qw`}</pre>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-muted-foreground/60">
            <span className="h-1.5 w-1.5 rounded-full bg-accent"/>
            Settlement: Solana · ~400ms finality
          </div>
        </div>
      </div>

      {/* Request logs */}
      <div className="rounded-xl border border-border bg-surface/50">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="text-[13px] font-medium">Request logs</div>
          <span className="text-[11px] font-mono text-muted-foreground">
            {r.logs.length > 0 ? `Last ${r.logs.length} requests` : "No requests yet"}
          </span>
        </div>
        {r.logs.length === 0 ? (
          <div className="py-10 text-center text-[12px] text-muted-foreground">
            No requests yet. Once callers start hitting this endpoint, logs will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border/60">
                  {["Time", "Method", "Path", "Status", "Amount", "TX"].map((h) => (
                    <th key={h} className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {r.logs.map((l, i) => (
                  <tr key={i} className="hover:bg-white/2">
                    <td className="px-5 py-3 font-mono text-muted-foreground whitespace-nowrap">{l.time}</td>
                    <td className="px-5 py-3 font-mono text-accent/80">{l.method}</td>
                    <td className="px-5 py-3 font-mono">{l.path}</td>
                    <td className="px-5 py-3">
                      <span className={`font-mono text-[11px] ${l.status === 200 ? "text-emerald-400" : l.status === 402 ? "text-yellow-400" : "text-red-400"}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-emerald-400/80">{l.amount}</td>
                    <td className="px-5 py-3 font-mono text-muted-foreground/60">{l.tx}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settlement events */}
      <div className="rounded-xl border border-border bg-surface/50">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="text-[13px] font-medium">Settlement events</div>
          <span className="text-[11px] font-mono text-muted-foreground">
            {r.payments.length > 0 ? "On-chain · Solana" : "No settlements yet"}
          </span>
        </div>
        {r.payments.length === 0 ? (
          <div className="py-10 text-center text-[12px] text-muted-foreground">
            Settlement events will appear here as payments are received and confirmed on Solana.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border/60">
                  {["Time", "TX hash", "Slot", "Amount", "Status"].map((h) => (
                    <th key={h} className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {r.payments.map((p, i) => (
                  <tr key={i} className="hover:bg-white/2">
                    <td className="px-5 py-3 font-mono text-muted-foreground whitespace-nowrap">{p.time}</td>
                    <td className="px-5 py-3 font-mono text-accent/70">{p.tx}</td>
                    <td className="px-5 py-3 font-mono text-muted-foreground">{p.slot}</td>
                    <td className="px-5 py-3 font-mono text-emerald-400">{p.amount}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        p.status === "settled" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                        p.status === "pending" ? "bg-yellow-500/10  border-yellow-500/20  text-yellow-400" :
                        "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        <span className={`h-1 w-1 rounded-full ${
                          p.status === "settled" ? "bg-emerald-400" : p.status === "pending" ? "bg-yellow-400" : "bg-red-400"
                        }`}/>
                        {p.status}
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
