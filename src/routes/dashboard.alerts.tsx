import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { api, type ApiAlert, timeAgo } from "@/lib/api";

export const Route = createFileRoute("/dashboard/alerts")({
  component: AlertsPage,
});

const ALERT_TYPES = [
  { value: "revenue_threshold", label: "Revenue threshold", desc: "Fire when daily revenue crosses a set amount", icon: "💰" },
  { value: "new_payer",         label: "New payer",         desc: "Fire when a wallet makes its first payment",  icon: "👤" },
  { value: "payment_count",    label: "Payment count",     desc: "Fire when daily settled payments hit a number", icon: "📊" },
];

function AlertsPage() {
  const [alerts, setAlerts] = useState<ApiAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ alert_type: "revenue_threshold", threshold: "", token: "USDC", email: "" });
  const [formError, setFormError] = useState("");
  const emailRef = useRef<HTMLInputElement>(null);

  const load = () => api.getAlerts().then((a) => { setAlerts(a); setLoading(false); });
  useEffect(() => { load(); }, []);
  useEffect(() => { if (showAdd) emailRef.current?.focus(); }, [showAdd]);

  const add = async () => {
    if (!form.email.trim()) { setFormError("Email is required"); return; }
    if (!form.threshold || isNaN(Number(form.threshold)) || Number(form.threshold) <= 0) {
      setFormError("Enter a valid threshold > 0"); return;
    }
    setFormError(""); setAdding(true);
    try {
      await api.createAlert({
        alert_type: form.alert_type,
        threshold: Number(form.threshold),
        token: form.token,
        email: form.email.trim(),
      });
      setForm({ alert_type: "revenue_threshold", threshold: "", token: "USDC", email: "" });
      setShowAdd(false);
      load();
    } finally { setAdding(false); }
  };

  const toggle = async (al: ApiAlert) => {
    await api.updateAlert(al.id, { is_active: !al.is_active });
    setAlerts((prev) => prev.map((a) => a.id === al.id ? { ...a, is_active: !a.is_active } : a));
  };

  const del = async (id: string) => {
    await api.deleteAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const thresholdLabel = (al: ApiAlert) => {
    if (al.alert_type === "revenue_threshold") return `${al.threshold} ${al.token} / day`;
    if (al.alert_type === "payment_count") return `${al.threshold} payments / day`;
    return "first payment from wallet";
  };

  return (
    <div className="p-6 space-y-6 max-w-[1000px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Threshold Alerts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Get notified by email when payments hit your thresholds — delivered via Resend
          </p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-accent text-background text-[13px] font-medium hover:bg-accent/90 transition-colors flex-shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 1v10M1 6h10"/></svg>
          New alert
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-accent/20 bg-accent/3 p-5 space-y-4">
          <div className="text-[13px] font-medium">Configure alert</div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground/60 mb-2">Alert type</div>
            <div className="grid md:grid-cols-3 gap-2">
              {ALERT_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setForm((f) => ({ ...f, alert_type: t.value }))}
                  className={`flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-colors ${
                    form.alert_type === t.value
                      ? "border-accent/30 bg-accent/8 text-accent"
                      : "border-border bg-surface/20 text-muted-foreground hover:text-foreground hover:border-border/80"
                  }`}
                >
                  <span className="text-base">{t.icon}</span>
                  <span className="text-[12px] font-medium">{t.label}</span>
                  <span className="text-[10.5px] text-muted-foreground/60">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="block text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground/60 mb-1.5">
                {form.alert_type === "payment_count" ? "Payment count" : "Amount threshold"}
              </label>
              <input
                type="number"
                min="0"
                value={form.threshold}
                onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))}
                placeholder={form.alert_type === "payment_count" ? "e.g. 100" : "e.g. 500"}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background/60 text-[13px] font-mono focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>
            {form.alert_type === "revenue_threshold" && (
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground/60 mb-1.5">Token</label>
                <div className="relative">
                  <select
                    value={form.token}
                    onChange={(e) => setForm((f) => ({ ...f, token: e.target.value }))}
                    className="w-full h-9 pl-3 pr-8 rounded-lg border border-border bg-background/60 text-[13px] appearance-none focus:outline-none focus:border-accent/40 transition-colors"
                  >
                    <option value="USDC">USDC</option>
                    <option value="SOL">SOL</option>
                  </select>
                  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3.5L5 6.5L8 3.5"/></svg>
                </div>
              </div>
            )}
            <div className={form.alert_type === "revenue_threshold" ? "" : "md:col-span-2"}>
              <label className="block text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground/60 mb-1.5">Notify email</label>
              <input
                ref={emailRef}
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && add()}
                placeholder="you@example.com"
                className="w-full h-9 px-3 rounded-lg border border-border bg-background/60 text-[13px] focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>
          </div>

          {formError && <div className="text-[12px] text-red-400">{formError}</div>}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={add}
              disabled={adding}
              className="h-8 px-5 rounded-lg bg-accent text-background text-[13px] font-medium hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {adding ? "Creating…" : "Create alert"}
            </button>
            <button onClick={() => { setShowAdd(false); setFormError(""); }} className="h-8 px-4 rounded-lg border border-border text-[13px] text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl border border-border bg-surface/50 animate-pulse" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface/50 p-16 text-center">
          <div className="h-12 w-12 rounded-2xl border border-border bg-surface/60 flex items-center justify-center mx-auto mb-5 text-xl">🔔</div>
          <p className="text-[14px] font-medium text-muted-foreground/70 mb-1.5">No alerts configured</p>
          <p className="text-[12px] text-muted-foreground/40 max-w-xs mx-auto mb-5">
            Set revenue or payment thresholds and get notified by email the moment they're crossed.
          </p>
          <button onClick={() => setShowAdd(true)} className="h-8 px-5 rounded-lg border border-accent/30 bg-accent/8 text-accent text-[12.5px] font-medium hover:bg-accent/15 transition-colors">
            Create your first alert
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((al) => {
            const typeInfo = ALERT_TYPES.find((t) => t.value === al.alert_type);
            return (
              <div key={al.id} className={`rounded-xl border bg-surface/50 p-5 transition-opacity ${al.is_active ? "border-border" : "border-border/40 opacity-60"}`}>
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 h-8 w-8 rounded-lg border flex items-center justify-center text-base flex-shrink-0 ${al.is_active ? "border-accent/20 bg-accent/8" : "border-border bg-surface/30"}`}>
                    {typeInfo?.icon ?? "🔔"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-medium">{typeInfo?.label ?? al.alert_type}</span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${al.is_active ? "border-accent/20 bg-accent/10 text-accent" : "border-border text-muted-foreground"}`}>
                        {al.is_active ? "active" : "paused"}
                      </span>
                      {al.fire_count > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border text-muted-foreground">
                          fired {al.fire_count}×
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11.5px] font-mono text-muted-foreground">
                      <span>Threshold: <span className="text-foreground">{thresholdLabel(al)}</span></span>
                      <span className="text-muted-foreground/30">·</span>
                      <span>Notify: <span className="text-foreground">{al.email || "—"}</span></span>
                      {al.last_fired_at && (
                        <>
                          <span className="text-muted-foreground/30">·</span>
                          <span>Last fired: <span className="text-foreground">{timeAgo(al.last_fired_at)}</span></span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => toggle(al)}
                      className="h-7 px-3 rounded-md border border-border text-[11.5px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {al.is_active ? "Pause" : "Resume"}
                    </button>
                    <button
                      onClick={() => del(al.id)}
                      className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground/40 hover:text-red-400 hover:border-red-500/30 transition-colors"
                    >
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1.5 3h8M4.5 3V2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1M2.5 3l.5 6.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5L8.5 3"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border border-border/40 bg-surface/20 p-5 text-[12px] font-mono text-muted-foreground/60 space-y-1.5">
        <div className="text-[11px] font-mono uppercase tracking-[0.12em] text-muted-foreground/40 mb-2">How it works</div>
        <div>→ Every settled payment triggers a check against all your active alerts</div>
        <div>→ Revenue threshold fires when 24h cumulative hits your amount</div>
        <div>→ New payer fires when a wallet makes its first-ever payment on your API</div>
        <div>→ Payment count fires when settled count in 24h crosses your number</div>
        <div className="pt-1 text-muted-foreground/40">Emails delivered via Resend · per-fire cooldown may apply in future</div>
      </div>
    </div>
  );
}
