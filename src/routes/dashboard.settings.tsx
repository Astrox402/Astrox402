import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getUser, setUser, signOut } from "@/lib/auth";
import { useWallets } from "@privy-io/react-auth";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

const SECTIONS = ["Profile", "Wallet", "Network", "Team"] as const;

async function fetchSolBalance(address: string): Promise<number | null> {
  try {
    const res = await fetch("https://api.mainnet-beta.solana.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address],
      }),
    });
    const data = await res.json() as { result?: { value?: number } };
    if (data.result?.value !== undefined) {
      return data.result.value / 1e9;
    }
    return null;
  } catch {
    return null;
  }
}

function SettingsPage() {
  const navigate = useNavigate();
  const user = getUser()!;
  const [section, setSection] = useState<(typeof SECTIONS)[number]>("Profile");
  const [name, setName] = useState(user.name);
  const [email] = useState(user.email);
  const [workspace, setWorkspace] = useState(user.workspace);
  const [saved, setSaved] = useState(false);

  const { wallets } = useWallets();
  const solanaWallet = wallets.find((w) =>
    w.walletClientType?.toLowerCase().includes("solana") ||
    w.type === "solana" ||
    w.walletClientType === "phantom" ||
    w.walletClientType === "solflare"
  ) ?? wallets[0];
  const walletAddress = solanaWallet?.address ?? null;

  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);

  useEffect(() => {
    if (!walletAddress) return;
    setBalanceLoading(true);
    fetchSolBalance(walletAddress).then((b) => {
      setSolBalance(b);
      setBalanceLoading(false);
    });
  }, [walletAddress]);

  function save() {
    setUser({ ...user, name, workspace });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleSignOut() {
    signOut();
    navigate({ to: "/" });
  }

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-6)}`
    : null;

  return (
    <div className="p-6 max-w-[900px]">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and workspace</p>
      </div>

      <div className="flex gap-6">
        <nav className="w-40 flex-shrink-0 space-y-0.5">
          {SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-colors ${
                section === s
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {s}
            </button>
          ))}
        </nav>

        <div className="flex-1 space-y-5">
          {section === "Profile" && (
            <>
              <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-4">
                <div className="text-[13px] font-medium">Account info</div>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-accent/20 border-2 border-accent/30 flex items-center justify-center text-[18px] font-mono font-bold text-accent">
                    {user.avatar}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium">{user.name}</div>
                    <div className="text-[12px] text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <div className="grid gap-4">
                  {[
                    { label: "Display name", value: name, onChange: setName },
                    { label: "Workspace slug", value: workspace, onChange: setWorkspace },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">{f.label}</label>
                      <input
                        value={f.value}
                        onChange={(e) => f.onChange(e.target.value)}
                        className="w-full h-9 rounded-lg border border-border bg-background/60 px-3 text-[13px] text-foreground focus:outline-none focus:border-accent/40 transition-colors"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Email</label>
                    <input
                      value={email}
                      disabled
                      className="w-full h-9 rounded-lg border border-border bg-background/40 px-3 text-[13px] text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button onClick={save} className="h-9 px-4 rounded-lg bg-accent text-background text-[13px] font-medium hover:bg-accent/90 transition-colors">
                    {saved ? "Saved ✓" : "Save changes"}
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 space-y-3">
                <div className="text-[13px] font-medium text-red-400">Danger zone</div>
                <p className="text-[12px] text-muted-foreground">Sign out of your current session. Your resources and data are preserved.</p>
                <button
                  onClick={handleSignOut}
                  className="h-9 px-4 rounded-lg border border-red-500/30 text-red-400 text-[13px] hover:bg-red-500/10 transition-colors"
                >
                  Sign out
                </button>
              </div>
            </>
          )}

          {section === "Wallet" && (
            <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-5">
              <div className="text-[13px] font-medium">Solana wallet</div>
              {walletAddress ? (
                <>
                  <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-background/60">
                    <div className="h-9 w-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-[11px] font-mono text-accent">SOL</div>
                    <div>
                      <div className="text-[12px] font-mono text-foreground">{shortAddr}</div>
                      <div className="text-[11px] text-muted-foreground">{solanaWallet?.walletClientType ?? "Wallet"} · Solana Mainnet</div>
                    </div>
                    <div className="ml-auto flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"/>
                      <span className="text-[11px] font-mono text-emerald-400">Connected</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[12px] font-mono">
                    <div className="p-3 rounded-lg border border-border bg-background/40">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Balance</div>
                      <div className="mt-1 text-foreground">
                        {balanceLoading ? (
                          <span className="animate-pulse text-muted-foreground">…</span>
                        ) : solBalance !== null ? (
                          `${solBalance.toFixed(4)} SOL`
                        ) : (
                          "Unavailable"
                        )}
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-background/40">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Full address</div>
                      <div className="mt-1 text-[10px] text-foreground break-all leading-relaxed">{walletAddress}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <div className="text-[13px] text-muted-foreground">No wallet connected</div>
                  <div className="text-[11px] text-muted-foreground/60">Connect a Solana wallet to see your balance</div>
                </div>
              )}
              <button className="h-9 px-4 rounded-lg border border-border text-[13px] text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors opacity-60 cursor-not-allowed">
                Change wallet — coming soon
              </button>
            </div>
          )}

          {section === "Network" && (
            <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-4">
              <div className="text-[13px] font-medium">Network preference</div>
              {[
                { net: "Solana Mainnet", desc: "Production · ~400ms settlement", active: true },
                { net: "Solana Devnet",  desc: "Testing · free SOL airdrop",     active: false },
              ].map((n) => (
                <div key={n.net} className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                  n.active ? "border-accent/40 bg-accent/5" : "border-border hover:border-border/80"
                }`}>
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${n.active ? "border-accent" : "border-border"}`}>
                    {n.active && <span className="h-2 w-2 rounded-full bg-accent"/>}
                  </div>
                  <div>
                    <div className="text-[13px] font-medium">{n.net}</div>
                    <div className="text-[11px] text-muted-foreground">{n.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {section === "Team" && (
            <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-[13px] font-medium">Team workspace</div>
                <span className="text-[10px] font-mono text-muted-foreground border border-border rounded px-2 py-0.5">Coming soon</span>
              </div>
              <div className="py-8 flex flex-col items-center gap-3 text-center">
                <div className="h-12 w-12 rounded-full bg-border/30 flex items-center justify-center text-muted-foreground">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="7" r="3.5"/><circle cx="16" cy="9" r="2.5"/><path d="M1 19c0-3.31 3.13-6 7-6s7 2.69 7 6"/><path d="M16 13c2.21 0 4 1.79 4 4"/></svg>
                </div>
                <div className="text-[13px] text-muted-foreground">Team workspaces and role management are coming in a future release.</div>
                <button className="h-9 px-4 rounded-lg border border-border text-[13px] text-muted-foreground opacity-50 cursor-not-allowed">Invite teammate</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
