import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/payments")({
  component: PaymentsPage,
});

const PAYMENTS = [
  { id: "p1",  time: "2s ago",   resource: "GPT Inference API",   amount: "0.0021 USDC", tx: "5JhkL…q9Rv", slot: "281,492,120", status: "settled",  from: "8xMH…Vq3R" },
  { id: "p2",  time: "14s ago",  resource: "Image Generation",    amount: "0.015 USDC",  tx: "2QrST…n7Wv", slot: "281,492,100", status: "settled",  from: "3pNL…K8Xv" },
  { id: "p3",  time: "34s ago",  resource: "Embeddings v2",       amount: "0.0004 USDC", tx: "9LpFK…m2Yx", slot: "281,492,080", status: "settled",  from: "7mQR…T5Jw" },
  { id: "p4",  time: "1m ago",   resource: "GPT Inference API",   amount: "0.0021 USDC", tx: "4KvNT…b6Pz", slot: "281,492,060", status: "settled",  from: "5zWS…F2Lk" },
  { id: "p5",  time: "2m ago",   resource: "Dataset Access",      amount: "0.50 USDC",   tx: "—",           slot: "—",           status: "failed",   from: "1aXH…G9Mn" },
  { id: "p6",  time: "3m ago",   resource: "Embeddings v2",       amount: "0.0004 USDC", tx: "7TmKL…p8Qq", slot: "281,491,990", status: "settled",  from: "6rPQ…V4Nj" },
  { id: "p7",  time: "5m ago",   resource: "Audio Transcription", amount: "0.008 USDC",  tx: "3BnJF…x1Vt", slot: "281,491,940", status: "settled",  from: "9kTR…S7Wy" },
  { id: "p8",  time: "8m ago",   resource: "Code Review API",     amount: "0.003 USDC",  tx: "6RqPM…z4Uw", slot: "281,491,880", status: "settled",  from: "2hYL…M6Rp" },
  { id: "p9",  time: "12m ago",  resource: "GPT Inference API",   amount: "0.0021 USDC", tx: "—",           slot: "—",           status: "pending",  from: "4vKS…H3Qz" },
  { id: "p10", time: "15m ago",  resource: "Image Generation",    amount: "0.015 USDC",  tx: "1MpXN…c7Tv", slot: "281,491,780", status: "settled",  from: "8nWQ…L1Fx" },
];

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

function PaymentsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const filtered = tab === "all" ? PAYMENTS : PAYMENTS.filter((p) => p.status === tab);

  const settled = PAYMENTS.filter(p => p.status === "settled");
  const totalRevenue = settled.reduce((a, p) => a + parseFloat(p.amount), 0);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-semibold">Payments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Incoming payments and settlement events</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total settled",  value: `${totalRevenue.toFixed(4)} USDC`, color: "text-emerald-400" },
          { label: "Transactions",   value: settled.length.toString(), color: "text-foreground" },
          { label: "Pending",        value: PAYMENTS.filter(p => p.status === "pending").length.toString(), color: "text-yellow-400" },
          { label: "Failed",         value: PAYMENTS.filter(p => p.status === "failed").length.toString(), color: "text-red-400" },
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
              {t === "all" ? `All (${PAYMENTS.length})` : `${t} (${PAYMENTS.filter(p => p.status === t).length})`}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-border/60">
                {["Time", "Resource", "Amount", "TX hash", "Slot", "From", "Status"].map((h) => (
                  <th key={h} className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 py-3 first:pl-5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-white/2">
                  <td className="px-5 py-3.5 font-mono text-muted-foreground whitespace-nowrap">{p.time}</td>
                  <td className="px-5 py-3.5 font-medium max-w-[160px] truncate">{p.resource}</td>
                  <td className="px-5 py-3.5 font-mono text-accent/80 whitespace-nowrap">{p.amount}</td>
                  <td className="px-5 py-3.5 font-mono text-muted-foreground/60 whitespace-nowrap">{p.tx}</td>
                  <td className="px-5 py-3.5 font-mono text-muted-foreground/60 whitespace-nowrap">{p.slot}</td>
                  <td className="px-5 py-3.5 font-mono text-muted-foreground/60 whitespace-nowrap">{p.from}</td>
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
      </div>
    </div>
  );
}
