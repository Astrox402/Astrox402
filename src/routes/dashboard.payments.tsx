import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api, type ApiPayment, timeAgo, lamportsToDisplay } from "@/lib/api";

export const Route = createFileRoute("/dashboard/payments")({
  component: PaymentsPage,
});

const TABS = ["all", "settled", "pending", "failed"] as const;
type Tab = typeof TABS[number];

const STATUS_STYLES: Record<string, string> = {
  settled: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  pending: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  failed:  "bg-red-500/10 border-red-500/20 text-red-400",
};
const STATUS_DOT: Record<string, string> = {
  settled: "bg-emerald-400",
  pending: "bg-yellow-400",
  failed:  "bg-red-400",
};

function shortAddr(addr: string) {
  if (!addr || addr.length < 8) return addr || "—";
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

function shortTx(tx: string) {
  if (!tx || tx.length < 8) return tx || "—";
  return `${tx.slice(0, 5)}…${tx.slice(-4)}`;
}

function PaymentsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPayments().then((p) => {
      setPayments(p);
      setLoading(false);
    });
  }, []);

  const filtered = tab === "all" ? payments : payments.filter((p) => p.status === tab);

  const settled = payments.filter((p) => p.status === "settled");
  const totalLamports = settled.reduce((a, p) => a + Number(p.amount_lamports), 0);
  const totalDisplay = settled.length > 0
    ? lamportsToDisplay(totalLamports, settled[0]?.token ?? "USDC")
    : "0.00 USDC";

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-semibold">Payments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Incoming payments and settlement events</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total settled",  value: totalDisplay, color: "text-emerald-400" },
          { label: "Transactions",   value: settled.length.toString(), color: "text-foreground" },
          { label: "Pending",        value: payments.filter((p) => p.status === "pending").length.toString(), color: "text-yellow-400" },
          { label: "Failed",         value: payments.filter((p) => p.status === "failed").length.toString(), color: "text-red-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface/50 p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className={`text-xl font-semibold font-mono mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface/50">
        <div className="flex items-center gap-2 p-4 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-mono capitalize transition-colors ${
                tab === t ? "bg-accent/10 text-accent border border-accent/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {t === "all"
                ? `All (${payments.length})`
                : `${t} (${payments.filter((p) => p.status === t).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center text-[13px] text-muted-foreground font-mono animate-pulse">
            Loading payments…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <div className="text-[13px] text-muted-foreground">No payments yet</div>
            <div className="text-[11px] text-muted-foreground/60">
              Payments will appear here when callers pay to access your resources
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border/60">
                  {["Time", "Resource", "Amount", "TX hash", "From", "Status"].map((h) => (
                    <th key={h} className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 py-3 first:pl-5 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-white/2">
                    <td className="px-5 py-3.5 font-mono text-muted-foreground whitespace-nowrap">{timeAgo(p.created_at)}</td>
                    <td className="px-5 py-3.5 font-medium max-w-[160px] truncate">{p.resource_name || "Unknown"}</td>
                    <td className="px-5 py-3.5 font-mono text-accent/80 whitespace-nowrap">{lamportsToDisplay(Number(p.amount_lamports), p.token)}</td>
                    <td className="px-5 py-3.5 font-mono text-muted-foreground/60 whitespace-nowrap">{shortTx(p.tx_signature)}</td>
                    <td className="px-5 py-3.5 font-mono text-muted-foreground/60 whitespace-nowrap">{shortAddr(p.payer_wallet)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full border ${STATUS_STYLES[p.status]}`}>
                        <span className={`h-1 w-1 rounded-full ${STATUS_DOT[p.status]}`}/>
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
