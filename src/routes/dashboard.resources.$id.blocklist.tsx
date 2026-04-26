import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { api, type ApiBlocklistEntry, timeAgo } from "@/lib/api";

export const Route = createFileRoute("/dashboard/resources/$id/blocklist")({
  component: BlocklistPage,
});

function BlocklistPage() {
  const { id } = Route.useParams();
  const [entries, setEntries] = useState<ApiBlocklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newWallet, setNewWallet] = useState("");
  const [newNote, setNewNote] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const walletRef = useRef<HTMLInputElement>(null);

  const load = () => api.getBlocklist(id).then((e) => { setEntries(e); setLoading(false); });
  useEffect(() => { load(); }, [id]);

  const add = async () => {
    const wallet = newWallet.trim();
    if (!wallet) { setError("Wallet address required"); return; }
    if (wallet.length < 32 || wallet.length > 44) { setError("Enter a valid Solana wallet address (32–44 chars)"); return; }
    setError(""); setAdding(true);
    try {
      await api.addToBlocklist({ resource_id: id, wallet, note: newNote.trim() });
      setNewWallet(""); setNewNote("");
      load();
      walletRef.current?.focus();
    } catch { setError("Failed to add — wallet may already be blocked"); }
    finally { setAdding(false); }
  };

  const remove = async (entryId: string) => {
    await api.removeFromBlocklist(entryId);
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
  };

  return (
    <div className="p-6 space-y-6 max-w-[900px]">
      <div className="flex items-center gap-2 text-[12px] font-mono text-muted-foreground">
        <Link to="/dashboard/resources" className="hover:text-foreground transition-colors">← Resources</Link>
        <span className="text-muted-foreground/30">/</span>
        <Link to="/dashboard/resources/$id" params={{ id }} className="hover:text-foreground transition-colors">Resource</Link>
        <span className="text-muted-foreground/30">/</span>
        <span className="text-foreground">Blocklist</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Payer Blocklist</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Blocked wallets receive a 403 Forbidden on quote requests — no payment intent issued
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-3">
        <div className="text-[12.5px] font-medium">Block a wallet</div>
        <div className="flex gap-3 flex-wrap">
          <input
            ref={walletRef}
            value={newWallet}
            onChange={(e) => setNewWallet(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Solana wallet address (base58)"
            className="flex-1 min-w-[260px] h-9 px-3 rounded-lg border border-border bg-background/60 text-[12.5px] font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 transition-colors"
          />
          <input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Note (optional)"
            className="w-48 h-9 px-3 rounded-lg border border-border bg-background/60 text-[12.5px] placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 transition-colors"
          />
          <button
            onClick={add}
            disabled={adding || !newWallet.trim()}
            className="h-9 px-4 rounded-lg bg-red-500/90 text-white text-[12.5px] font-medium hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {adding ? "Blocking…" : "Block wallet"}
          </button>
        </div>
        {error && <div className="text-[12px] text-red-400">{error}</div>}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl border border-border bg-surface/50 animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface/50 p-14 text-center">
          <div className="text-3xl mb-4">🚫</div>
          <p className="text-[13.5px] font-medium text-muted-foreground/70 mb-1">No blocked wallets</p>
          <p className="text-[12px] text-muted-foreground/40 max-w-xs mx-auto">
            Add wallet addresses above. Blocked payers will receive 403 Forbidden when they try to get a payment quote.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface/50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
            <span className="text-[12px] font-medium">{entries.length} blocked wallet{entries.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="divide-y divide-border/50">
            {entries.map((e) => (
              <div key={e.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors">
                <div className="h-7 w-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400"><path d="M5.5 1a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM2.5 2.5l6 6"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[12px] text-foreground truncate">{e.wallet}</div>
                  {e.note && <div className="text-[11px] text-muted-foreground/60 mt-0.5">{e.note}</div>}
                </div>
                <div className="text-[11px] font-mono text-muted-foreground/40 flex-shrink-0">{timeAgo(e.created_at)}</div>
                <button
                  onClick={() => remove(e.id)}
                  className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground/40 hover:text-red-400 hover:border-red-500/30 transition-colors flex-shrink-0"
                  title="Unblock"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l8 8M9 1L1 9"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border/40 bg-surface/20 p-4 text-[11.5px] font-mono text-muted-foreground/60 space-y-1">
        <div>→ Blocked wallets cannot obtain a payment quote from this resource</div>
        <div>→ They receive <span className="text-red-400">403 Forbidden</span> with <code className="text-foreground">X-Astro-Block: wallet-blocked</code></div>
        <div>→ Blocklist is per-resource — not global across all your resources</div>
      </div>
    </div>
  );
}
