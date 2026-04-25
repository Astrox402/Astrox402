import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api, type ApiPayment, lamportsToDisplay, timeAgo } from "@/lib/api";

export const Route = createFileRoute("/dashboard/receipts")({
  component: ReceiptsPage,
});

const TABS = ["all", "settled", "pending", "failed"] as const;
type Tab = typeof TABS[number];

function shortAddr(addr: string, n = 6) {
  if (!addr || addr.length < n * 2) return addr || "—";
  return `${addr.slice(0, n)}…${addr.slice(-4)}`;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button onClick={copy} title="Copy" className="ml-1.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
      {copied ? (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1.5 5.5L4 8L9.5 2.5"/></svg>
      ) : (
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3.5" width="6.5" height="7" rx="1"/><path d="M3.5 3.5V2a1 1 0 0 1 1-1H9.5A1 1 0 0 1 10.5 2v6a1 1 0 0 1-1 1H8"/></svg>
      )}
    </button>
  );
}

function ReceiptsPage() {
  const [tab, setTab] = useState<Tab>("all");
  const [payments, setPayments] = useState<ApiPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getPayments().then((p) => {
      setPayments(p);
      setLoading(false);
    });
  }, []);

  const filtered = payments
    .filter((p) => tab === "all" || p.status === tab)
    .filter((p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.payer_wallet.toLowerCase().includes(q) ||
        p.resource_name.toLowerCase().includes(q) ||
        p.tx_signature.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)
      );
    });

  const settled = payments.filter((p) => p.status === "settled");
  const receiptCount = settled.length;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Receipt Explorer</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Verifiable on-chain payment receipts with full audit trail</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-accent/20 bg-accent/5 text-[12px] font-mono text-accent flex-shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-accent"/>
          {receiptCount} verified receipt{receiptCount !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-surface/30">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-[11.5px] font-mono capitalize transition-colors ${
                tab === t ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-sm">
          <div className="flex items-center gap-2 h-8 px-3 rounded-lg border border-border bg-surface/30 focus-within:border-accent/40 transition-colors">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/50 flex-shrink-0"><circle cx="5" cy="5" r="3.5"/><path d="M8 8l2 2"/></svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search wallet, tx, receipt…"
              className="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground/40 outline-none"
            />
          </div>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground/50 ml-auto">{filtered.length} receipt{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="rounded-xl border border-border bg-surface/50 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-3 w-24 rounded bg-border/40" />
                <div className="h-3 w-32 rounded bg-border/40" />
                <div className="h-3 w-20 rounded bg-border/40 ml-auto" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="h-10 w-10 rounded-xl border border-border bg-surface/60 flex items-center justify-center mx-auto mb-4">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-muted-foreground/50">
                <path d="M3 1h12a1 1 0 0 1 1 1v13l-2-1.5-2 1.5-1.5-1.5L9 15.5l-1.5-1.5-2 1.5-2-1.5L2 15V2a1 1 0 0 1 1-1z"/>
                <path d="M6 6h6M6 9.5h4"/>
              </svg>
            </div>
            <p className="text-[13px] text-muted-foreground/60">
              {search ? `No receipts matching "${search}"` : tab !== "all" ? `No ${tab} receipts` : "No receipts yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-surface/40 border-b border-border">
                  {["Receipt ID", "Resource", "Payer wallet", "Amount", "TX signature", "Status", "Time"].map((h) => (
                    <th key={h} className="text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-muted-foreground/60">{p.id}</span>
                        <CopyButton value={p.id} />
                      </div>
                    </td>
                    <td className="px-5 py-4 max-w-[140px]">
                      <span className="truncate block font-medium text-[12px]">{p.resource_name || "—"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[11.5px] text-muted-foreground">{shortAddr(p.payer_wallet, 5)}</span>
                        {p.payer_wallet && <CopyButton value={p.payer_wallet} />}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-mono font-medium ${p.status === "settled" ? "text-accent" : "text-muted-foreground"}`}>
                        {p.status === "settled" ? "+" : ""}{lamportsToDisplay(p.amount_lamports, p.token)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {p.tx_signature ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] text-muted-foreground/70">{shortAddr(p.tx_signature, 5)}</span>
                          <CopyButton value={p.tx_signature} />
                          <a
                            href={`https://explorer.solana.com/tx/${p.tx_signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View on Solana Explorer"
                            className="text-muted-foreground/30 hover:text-accent transition-colors ml-0.5"
                          >
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4.5 2H2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.5"/><path d="M7 1h3v3M10 1L5.5 5.5"/></svg>
                          </a>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/30 font-mono text-[11px]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        p.status === "settled" ? "bg-accent/10 border-accent/20 text-accent" :
                        p.status === "pending"  ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
                        "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        <span className={`h-1 w-1 rounded-full ${
                          p.status === "settled" ? "bg-accent" : p.status === "pending" ? "bg-yellow-400" : "bg-red-400"
                        }`}/>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-[11px] text-muted-foreground/60 whitespace-nowrap">{timeAgo(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-[11px] text-muted-foreground/40 font-mono text-center">
          TX signatures link to Solana Explorer mainnet · Playground simulations use fabricated signatures
        </p>
      )}
    </div>
  );
}
