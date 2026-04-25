import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api, type ApiResource } from "@/lib/api";

export const Route = createFileRoute("/dashboard/resources/$id/policy")({
  component: PolicyPage,
});

interface Policy {
  free_tier: {
    enabled: boolean;
    requests_per_wallet: number;
    reset: "never" | "daily" | "weekly";
  };
  peak_pricing: {
    enabled: boolean;
    multiplier: number;
    hours_start: number;
    hours_end: number;
    timezone: string;
  };
  volume_discount: {
    enabled: boolean;
    after_payments: number;
    discount_pct: number;
  };
  wallet_access: {
    allowlist: string[];
    blocklist: string[];
  };
}

const DEFAULT_POLICY: Policy = {
  free_tier: { enabled: false, requests_per_wallet: 5, reset: "never" },
  peak_pricing: { enabled: false, multiplier: 2, hours_start: 9, hours_end: 17, timezone: "UTC" },
  volume_discount: { enabled: false, after_payments: 10, discount_pct: 20 },
  wallet_access: { allowlist: [], blocklist: [] },
};

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 rounded-full transition-colors flex-shrink-0 ${on ? "bg-accent" : "bg-border"}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

function NumberInput({ value, onChange, min = 0, max = 9999, step = 1 }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
      className="h-8 w-24 px-2.5 rounded-md border border-border bg-background/60 text-[12.5px] font-mono text-foreground text-center focus:outline-none focus:border-accent/40 transition-colors"
    />
  );
}

function WalletListEditor({ label, desc, wallets, onChange }: {
  label: string; desc: string; wallets: string[]; onChange: (ws: string[]) => void;
}) {
  const [raw, setRaw] = useState("");

  const add = () => {
    const trimmed = raw.trim();
    if (!trimmed || wallets.includes(trimmed)) { setRaw(""); return; }
    onChange([...wallets, trimmed]);
    setRaw("");
  };

  return (
    <div>
      <div className="text-[12.5px] font-medium mb-0.5">{label}</div>
      <div className="text-[11.5px] text-muted-foreground mb-3">{desc}</div>
      <div className="flex gap-2 mb-2.5">
        <input
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Paste Solana wallet address…"
          className="flex-1 h-8 px-3 rounded-md border border-border bg-background/60 text-[12px] font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 transition-colors"
        />
        <button onClick={add} className="h-8 px-3 rounded-md border border-border text-[12px] text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors">
          Add
        </button>
      </div>
      {wallets.length === 0 ? (
        <div className="text-[11px] text-muted-foreground/40 font-mono py-2">No wallets added</div>
      ) : (
        <div className="space-y-1.5">
          {wallets.map((w) => (
            <div key={w} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 bg-surface/20">
              <span className="flex-1 font-mono text-[11.5px] text-muted-foreground truncate">{w}</span>
              <button onClick={() => onChange(wallets.filter((x) => x !== w))} className="text-muted-foreground/30 hover:text-red-400 transition-colors flex-shrink-0">
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1.5 1.5l8 8M9.5 1.5l-8 8"/></svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PolicyPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState<ApiResource | null>(null);
  const [policy, setPolicy] = useState<Policy>(DEFAULT_POLICY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getResources().then((rs) => {
      const r = rs.find((x) => x.id === id) ?? null;
      setResource(r);
      if (r) {
        const meta = (r as any).metadata as Record<string, unknown> | undefined;
        const existingPolicy = meta?.policy as Partial<Policy> | undefined;
        if (existingPolicy) {
          setPolicy({ ...DEFAULT_POLICY, ...existingPolicy });
        }
      }
      setLoading(false);
    });
  }, [id]);

  const save = async () => {
    if (!resource || saving) return;
    setSaving(true);
    try {
      const meta = ((resource as any).metadata as Record<string, unknown>) ?? {};
      await api.updateResource(id, { metadata: { ...meta, policy } } as any);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally { setSaving(false); }
  };

  const set = <K extends keyof Policy>(key: K, val: Policy[K]) =>
    setPolicy((p) => ({ ...p, [key]: val }));

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-[760px]">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl border border-border bg-surface/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="p-6">
        <div className="text-[14px] text-muted-foreground">Resource not found.</div>
        <Link to="/dashboard/resources" className="text-accent text-[13px] hover:underline mt-2 block">← Back to resources</Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 max-w-[760px]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground mb-1">
            <Link to="/dashboard/resources/$id" params={{ id }} className="hover:text-foreground transition-colors">{resource.name}</Link>
            <span>/</span>
            <span className="text-foreground">Quote Policy</span>
          </div>
          <h1 className="text-xl font-semibold">Quote Policy Editor</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Programmable pricing rules applied before every 402 challenge</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className={`h-9 px-5 rounded-lg text-[13px] font-medium transition-all flex-shrink-0 ${
            saved ? "bg-accent/10 border border-accent/30 text-accent" :
            "bg-accent text-background hover:bg-accent/90 disabled:opacity-40"
          }`}
        >
          {saving ? "Saving…" : saved ? "Saved ✓" : "Save policy"}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-[13.5px] font-semibold">Free tier</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">Grant N free requests per wallet before payment kicks in</div>
          </div>
          <Toggle on={policy.free_tier.enabled} onChange={(v) => set("free_tier", { ...policy.free_tier, enabled: v })} />
        </div>
        {policy.free_tier.enabled && (
          <div className="pt-4 border-t border-border/60 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[12.5px] text-muted-foreground">Free requests per wallet</label>
              <NumberInput value={policy.free_tier.requests_per_wallet} onChange={(v) => set("free_tier", { ...policy.free_tier, requests_per_wallet: v })} min={1} max={1000} />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-[12.5px] text-muted-foreground">Quota reset</label>
              <div className="flex items-center gap-1.5">
                {(["never", "daily", "weekly"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => set("free_tier", { ...policy.free_tier, reset: r })}
                    className={`h-7 px-3 rounded-md border text-[11.5px] font-mono capitalize transition-colors ${
                      policy.free_tier.reset === r
                        ? "border-accent/30 bg-accent/10 text-accent"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-[13.5px] font-semibold">Peak-hour pricing</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">Multiply the base price during high-demand hours</div>
          </div>
          <Toggle on={policy.peak_pricing.enabled} onChange={(v) => set("peak_pricing", { ...policy.peak_pricing, enabled: v })} />
        </div>
        {policy.peak_pricing.enabled && (
          <div className="pt-4 border-t border-border/60 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[12.5px] text-muted-foreground">Multiplier</label>
              <div className="flex items-center gap-2">
                <NumberInput value={policy.peak_pricing.multiplier} onChange={(v) => set("peak_pricing", { ...policy.peak_pricing, multiplier: v })} min={1.1} max={10} step={0.5} />
                <span className="text-[12px] text-muted-foreground font-mono">×</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-[12.5px] text-muted-foreground">Active window (UTC)</label>
              <div className="flex items-center gap-2 font-mono text-[12.5px]">
                <NumberInput value={policy.peak_pricing.hours_start} onChange={(v) => set("peak_pricing", { ...policy.peak_pricing, hours_start: v })} min={0} max={23} />
                <span className="text-muted-foreground">:00 –</span>
                <NumberInput value={policy.peak_pricing.hours_end} onChange={(v) => set("peak_pricing", { ...policy.peak_pricing, hours_end: v })} min={0} max={23} />
                <span className="text-muted-foreground">:00</span>
              </div>
            </div>
            <div className="px-3 py-2.5 rounded-lg border border-border/40 bg-background/30 text-[11.5px] font-mono text-muted-foreground/70">
              {"→"} During {policy.peak_pricing.hours_start}:00–{policy.peak_pricing.hours_end}:00 UTC, callers pay {policy.peak_pricing.multiplier}× the base price
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-[13.5px] font-semibold">Volume discount</div>
            <div className="text-[12px] text-muted-foreground mt-0.5">Reward high-volume payers with a reduced price</div>
          </div>
          <Toggle on={policy.volume_discount.enabled} onChange={(v) => set("volume_discount", { ...policy.volume_discount, enabled: v })} />
        </div>
        {policy.volume_discount.enabled && (
          <div className="pt-4 border-t border-border/60 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[12.5px] text-muted-foreground">After N payments from same wallet</label>
              <NumberInput value={policy.volume_discount.after_payments} onChange={(v) => set("volume_discount", { ...policy.volume_discount, after_payments: v })} min={1} max={10000} />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-[12.5px] text-muted-foreground">Discount percentage</label>
              <div className="flex items-center gap-2">
                <NumberInput value={policy.volume_discount.discount_pct} onChange={(v) => set("volume_discount", { ...policy.volume_discount, discount_pct: v })} min={1} max={90} />
                <span className="text-[12px] text-muted-foreground font-mono">%</span>
              </div>
            </div>
            <div className="px-3 py-2.5 rounded-lg border border-border/40 bg-background/30 text-[11.5px] font-mono text-muted-foreground/70">
              {"→"} After payment #{policy.volume_discount.after_payments}, wallets pay {100 - policy.volume_discount.discount_pct}% of base price
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5">
        <div className="text-[13.5px] font-semibold mb-1">Wallet access control</div>
        <div className="text-[12px] text-muted-foreground mb-5">Allowlisted wallets bypass payment entirely. Blocklisted wallets receive 403.</div>
        <div className="space-y-6">
          <WalletListEditor
            label="Allowlist"
            desc="These wallets access this resource for free, no 402 issued."
            wallets={policy.wallet_access.allowlist}
            onChange={(ws) => set("wallet_access", { ...policy.wallet_access, allowlist: ws })}
          />
          <div className="border-t border-border/40 pt-5">
            <WalletListEditor
              label="Blocklist"
              desc="These wallets are denied access with a 403 response."
              wallets={policy.wallet_access.blocklist}
              onChange={(ws) => set("wallet_access", { ...policy.wallet_access, blocklist: ws })}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-surface/20 p-4 text-[11.5px] font-mono text-muted-foreground/60 leading-relaxed space-y-1">
        <div>{"→"} Free tier is evaluated first, then allowlist/blocklist, then volume discount, then peak multiplier.</div>
        <div>{"→"} Policies are stored in resource metadata and evaluated per quote request at runtime.</div>
        <div>{"→"} Changes apply immediately to new quote requests — no redeployment needed.</div>
      </div>
    </div>
  );
}
