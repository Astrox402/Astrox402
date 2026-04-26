import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api, type ApiRevenue, lamportsToDisplay, timeAgo } from "@/lib/api";

export const Route = createFileRoute("/dashboard/revenue")({
  component: RevenuePage,
});

function exportCSV(data: ApiRevenue) {
  const rows = [
    ["Resource", "Transactions", "SOL Earned", "USDC Earned", "Last Payment"],
    ...data.by_resource.map((r) => [
      r.resource_name,
      r.tx_count,
      lamportsToDisplay(Number(r.sol_total), "SOL"),
      lamportsToDisplay(Number(r.usdc_total), "USDC"),
      new Date(r.last_at).toISOString(),
    ]),
  ];
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `revenue-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function RevenuePage() {
  const [data, setData] = useState<ApiRevenue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRevenue().then((d) => { setData(d); setLoading(false); });
  }, []);

  const t = data?.totals;
  const solTotal = t ? Number(t.sol_total) : 0;
  const usdcTotal = t ? Number(t.usdc_total) : 0;
  const txCount = t ? Number(t.tx_count) : 0;
  const uniquePayers = t ? Number(t.unique_payers) : 0;

  const dayMax = data ? Math.max(...data.by_day.map((d) => Number(d.sol_total) + Number(d.usdc_total)), 1) : 1;

  const isEmpty = !loading && txCount === 0;

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Revenue & Payouts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Settled earnings breakdown by resource and time period</p>
        </div>
        {data && !isEmpty && (
          <button
            onClick={() => exportCSV(data)}
            className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border text-[13px] text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors flex-shrink-0"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 1v7M3.5 5.5L6 8l2.5-2.5M1 9.5v1a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-1"/></svg>
            Export CSV
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total SOL earned",   value: loading ? "…" : (solTotal > 0 ? lamportsToDisplay(solTotal, "SOL") : "—"),   color: solTotal > 0 ? "text-accent" : "text-muted-foreground" },
          { label: "Total USDC earned",  value: loading ? "…" : (usdcTotal > 0 ? lamportsToDisplay(usdcTotal, "USDC") : "—"), color: usdcTotal > 0 ? "text-accent" : "text-muted-foreground" },
          { label: "Settled payments",   value: loading ? "…" : txCount.toLocaleString(),   color: "text-foreground" },
          { label: "Unique payers",      value: loading ? "…" : uniquePayers.toLocaleString(), color: "text-foreground" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface/50 p-5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">{s.label}</div>
            <div className={`text-2xl font-semibold font-mono tracking-tight ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {isEmpty ? (
        <div className="rounded-xl border border-border bg-surface/50 p-16 text-center">
          <div className="h-12 w-12 rounded-2xl border border-border bg-surface/60 flex items-center justify-center mx-auto mb-5">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-muted-foreground/50">
              <circle cx="11" cy="11" r="8"/><path d="M11 7v1M11 14v1M8.5 12.5s0 2 2.5 2 2.5-1.5 2.5-1.5-.5-2-2.5-2-2.5-1.5-2.5-1.5S9 8 11 8s2.5 1.5 2.5 1.5"/>
            </svg>
          </div>
          <p className="text-[14px] font-medium text-muted-foreground/70 mb-1.5">No settled revenue yet</p>
          <p className="text-[12px] text-muted-foreground/40 max-w-xs mx-auto">
            Simulate payments in the Playground or receive real payments to see revenue here.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border bg-surface/50 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[13px] font-medium">Daily revenue (30 days)</div>
                <div className="text-[11px] font-mono text-muted-foreground mt-0.5">Settled payments · SOL + USDC combined</div>
              </div>
            </div>
            {data && data.by_day.length > 0 ? (
              <>
                <div className="flex items-end gap-1 h-28">
                  {data.by_day.map((d, i) => {
                    const total = Number(d.sol_total) + Number(d.usdc_total);
                    const h = Math.max(4, Math.round((total / dayMax) * 100));
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-background/90 px-1.5 py-0.5 rounded border border-border z-10">
                          {new Date(d.day).toLocaleDateString("en", { month: "short", day: "numeric" })} · {d.tx_count} tx
                        </div>
                        <div className="w-full rounded-t-sm bg-accent/30 hover:bg-accent/50 transition-colors" style={{ height: `${h}%` }} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground/40">
                  <span>{new Date(data.by_day[0]?.day ?? "").toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                  <span>today</span>
                </div>
              </>
            ) : (
              <div className="h-28 flex items-center justify-center text-[12px] text-muted-foreground/40 font-mono">No data in last 30 days</div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-surface/50">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <div className="text-[13px] font-medium">Revenue by resource</div>
                <div className="text-[11px] font-mono text-muted-foreground mt-0.5">All-time settled earnings per resource</div>
              </div>
              <div className="text-[11px] font-mono text-muted-foreground/50">
                {data?.by_resource.length ?? 0} resource{(data?.by_resource.length ?? 0) !== 1 ? "s" : ""}
              </div>
            </div>
            {loading ? (
              <div className="p-5 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="h-3 w-32 rounded bg-border/40" />
                    <div className="h-3 w-16 rounded bg-border/30 ml-auto" />
                    <div className="h-3 w-20 rounded bg-border/30" />
                  </div>
                ))}
              </div>
            ) : data && data.by_resource.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-border/60">
                      {["Resource", "Payments", "SOL earned", "USDC earned", "Last payment"].map((h) => (
                        <th key={h} className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {data.by_resource.map((r) => {
                      const maxRev = Math.max(...data.by_resource.map((x) => Number(x.sol_total) + Number(x.usdc_total)));
                      const revShare = maxRev > 0 ? ((Number(r.sol_total) + Number(r.usdc_total)) / maxRev) * 100 : 0;
                      return (
                        <tr key={r.resource_id ?? r.resource_name} className="hover:bg-white/2 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 max-w-[180px]">
                                <div className="font-medium text-[12.5px] truncate">{r.resource_name}</div>
                                <div className="mt-1.5 h-0.5 rounded-full bg-border/30 overflow-hidden">
                                  <div className="h-full bg-accent/60 rounded-full transition-all" style={{ width: `${revShare}%` }} />
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-mono text-accent">{r.tx_count}</td>
                          <td className="px-5 py-4 font-mono text-muted-foreground">
                            {Number(r.sol_total) > 0 ? lamportsToDisplay(Number(r.sol_total), "SOL") : "—"}
                          </td>
                          <td className="px-5 py-4 font-mono text-muted-foreground">
                            {Number(r.usdc_total) > 0 ? lamportsToDisplay(Number(r.usdc_total), "USDC") : "—"}
                          </td>
                          <td className="px-5 py-4 font-mono text-[11px] text-muted-foreground/60">{timeAgo(r.last_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-10 text-center text-[12px] text-muted-foreground/40 font-mono">No resource revenue data</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
