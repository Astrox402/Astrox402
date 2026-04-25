import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api, type ApiAnalytics, lamportsToDisplay, timeAgo } from "@/lib/api";

export const Route = createFileRoute("/dashboard/analytics")({
  component: AnalyticsPage,
});

function shortWallet(w: string) {
  if (!w || w.length < 8) return w || "—";
  return `${w.slice(0, 6)}…${w.slice(-4)}`;
}

function AnalyticsPage() {
  const [data, setData] = useState<ApiAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [range] = useState<"7d" | "30d">("7d");

  useEffect(() => {
    api.getAnalytics().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  const uniquePayers = data ? Number(data.unique_payers.count) : 0;
  const totalTx = data ? data.payers.reduce((s, p) => s + Number(p.payment_count), 0) : 0;

  const totalSol = data ? data.payers.reduce((s, p) => s + Number(p.sol_total), 0) : 0;
  const totalUsdc = data ? data.payers.reduce((s, p) => s + Number(p.usdc_total), 0) : 0;

  const solToken = data?.tokens.find((t) => t.token === "SOL");
  const usdcToken = data?.tokens.find((t) => t.token === "USDC");
  const totalTokenCount = (solToken ? Number(solToken.count) : 0) + (usdcToken ? Number(usdcToken.count) : 0);
  const solPct = totalTokenCount > 0 ? Math.round(((solToken ? Number(solToken.count) : 0) / totalTokenCount) * 100) : 0;
  const usdcPct = 100 - solPct;

  const dailyMax = data ? Math.max(...data.daily.map((d) => Number(d.tx_count)), 1) : 1;

  const isEmpty = !loading && uniquePayers === 0;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-semibold">Payer Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Who is consuming your resources and how</p>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Unique payers", value: loading ? "…" : uniquePayers.toString(), color: "text-accent" },
          { label: "Total transactions", value: loading ? "…" : totalTx.toLocaleString(), color: "text-foreground" },
          { label: "SOL volume", value: loading ? "…" : (totalSol > 0 ? lamportsToDisplay(totalSol, "SOL") : "—"), color: "text-foreground" },
          { label: "USDC volume", value: loading ? "…" : (totalUsdc > 0 ? lamportsToDisplay(totalUsdc, "USDC") : "—"), color: "text-foreground" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface/50 p-5 relative overflow-hidden">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">{s.label}</div>
            <div className={`text-2xl font-semibold font-mono tracking-tight ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {isEmpty ? (
        <div className="rounded-xl border border-border bg-surface/50 p-16 text-center">
          <div className="h-12 w-12 rounded-2xl border border-border bg-surface/60 flex items-center justify-center mx-auto mb-5">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-muted-foreground/50">
              <path d="M2 20h18M4 20V12m4 8V7m4 13V4m4 16v-7"/>
            </svg>
          </div>
          <p className="text-[14px] font-medium text-muted-foreground/70 mb-1">No payer data yet</p>
          <p className="text-[12px] text-muted-foreground/40 max-w-xs mx-auto">
            Run simulations in the Playground or receive real payments to see payer analytics here.
          </p>
        </div>
      ) : (
        <>
          <div className="grid xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 rounded-xl border border-border bg-surface/50 p-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-[13px] font-medium">Daily volume</div>
                  <div className="text-[11px] font-mono text-muted-foreground mt-0.5">Last {range === "7d" ? "7" : "30"} days · settled payments</div>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-mono">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-accent/80"/>SOL</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-accent/30"/>USDC</span>
                </div>
              </div>
              {data && data.daily.length > 0 ? (
                <div className="flex items-end gap-1.5 h-32">
                  {data.daily.map((d, i) => {
                    const h = Math.max(8, Math.round((Number(d.tx_count) / dailyMax) * 100));
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-mono text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-background/90 px-1.5 py-0.5 rounded border border-border">
                          {d.tx_count} tx · {new Date(d.day).toLocaleDateString("en", { month: "short", day: "numeric" })}
                        </div>
                        <div className="w-full rounded-t-sm bg-accent/25 hover:bg-accent/40 transition-colors" style={{ height: `${h}%` }} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-[12px] text-muted-foreground/40 font-mono">
                  No data in last 7 days
                </div>
              )}
              {data && data.daily.length > 0 && (
                <div className="flex justify-between mt-2 text-[10px] font-mono text-muted-foreground/40">
                  <span>{new Date(data.daily[0]?.day ?? "").toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                  <span>today</span>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-surface/50 p-5">
              <div className="text-[13px] font-medium mb-1">Settlement token split</div>
              <div className="text-[11px] font-mono text-muted-foreground mb-6">By transaction count</div>
              {totalTokenCount > 0 ? (
                <div className="space-y-4">
                  {[
                    { token: "SOL", pct: solPct, count: solToken ? Number(solToken.count) : 0 },
                    { token: "USDC", pct: usdcPct, count: usdcToken ? Number(usdcToken.count) : 0 },
                  ].filter((t) => t.count > 0).map((t) => (
                    <div key={t.token}>
                      <div className="flex items-center justify-between mb-1.5 text-[12px]">
                        <span className="font-mono text-foreground">{t.token}</span>
                        <span className="font-mono text-muted-foreground">{t.count} tx · {t.pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border/40 overflow-hidden">
                        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${t.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[12px] text-muted-foreground/40 font-mono text-center py-8">No data</div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface/50">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <div className="text-[13px] font-medium">Top payers</div>
                <div className="text-[11px] font-mono text-muted-foreground mt-0.5">Wallets by settled payment count</div>
              </div>
              <div className="text-[11px] font-mono text-muted-foreground/50">{uniquePayers} unique wallet{uniquePayers !== 1 ? "s" : ""}</div>
            </div>
            {loading ? (
              <div className="p-5 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="h-4 w-4 rounded bg-border/40" />
                    <div className="h-3 w-36 rounded bg-border/40" />
                    <div className="h-3 w-16 rounded bg-border/30 ml-auto" />
                    <div className="h-3 w-20 rounded bg-border/30" />
                  </div>
                ))}
              </div>
            ) : data && data.payers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-border/60">
                      {["#", "Wallet", "Payments", "SOL paid", "USDC paid", "Last seen"].map((h) => (
                        <th key={h} className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {data.payers.map((p, i) => (
                      <tr key={p.payer_wallet} className="hover:bg-white/2 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-muted-foreground/40 text-[11px]">{i + 1}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full border border-border bg-accent/5 flex items-center justify-center text-[9px] font-mono text-accent flex-shrink-0">
                              {p.payer_wallet.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-mono text-[11.5px]">{shortWallet(p.payer_wallet)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-mono">
                          <span className="text-accent">{p.payment_count}</span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-muted-foreground">
                          {Number(p.sol_total) > 0 ? lamportsToDisplay(Number(p.sol_total), "SOL") : "—"}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-muted-foreground">
                          {Number(p.usdc_total) > 0 ? lamportsToDisplay(Number(p.usdc_total), "USDC") : "—"}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-muted-foreground/60 text-[11px]">{timeAgo(p.last_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-[12px] text-muted-foreground/40 font-mono">No payer data</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
