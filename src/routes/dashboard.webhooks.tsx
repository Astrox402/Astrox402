import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { api, type ApiWebhook, type ApiWebhookDelivery, timeAgo } from "@/lib/api";

export const Route = createFileRoute("/dashboard/webhooks")({
  component: WebhooksPage,
});

const ALL_EVENTS = [
  { id: "payment.settled",   label: "payment.settled",   desc: "Triggered when a payment is confirmed on-chain" },
  { id: "payment.failed",    label: "payment.failed",    desc: "Triggered when a payment fails or times out" },
  { id: "payment.pending",   label: "payment.pending",   desc: "Triggered when a payment intent is submitted" },
  { id: "resource.accessed", label: "resource.accessed", desc: "Triggered on each successful authenticated request" },
];

function SecretReveal({ secret }: { secret: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(secret).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[11px] text-muted-foreground/70">
        {revealed ? secret : `${secret.slice(0, 12)}${"•".repeat(24)}`}
      </span>
      <button onClick={() => setRevealed((v) => !v)} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5">
          {revealed ? <><path d="M1 5.5s1.5-3 4.5-3 4.5 3 4.5 3-1.5 3-4.5 3-4.5-3-4.5-3z"/><circle cx="5.5" cy="5.5" r="1.5"/></> : <><path d="M1 1l9 9M4.3 2.3A4.8 4.8 0 0 1 5.5 2c3 0 4.5 3 4.5 3a9 9 0 0 1-1.5 2"/><path d="M6.7 8.7A4.8 4.8 0 0 1 5.5 9C2.5 9 1 6 1 6a9 9 0 0 1 1.5-2"/></>}
        </svg>
      </button>
      <button onClick={copy} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
        {copied ? <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1.5 5.5L4 8L9.5 2.5"/></svg> : <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="3.5" width="6.5" height="7" rx="1"/><path d="M3.5 3.5V2a1 1 0 0 1 1-1H9.5A1 1 0 0 1 10.5 2v6a1 1 0 0 1-1 1H8"/></svg>}
      </button>
    </div>
  );
}

function DeliveryHistory({ webhookId }: { webhookId: string }) {
  const [deliveries, setDeliveries] = useState<ApiWebhookDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getWebhookDeliveries(webhookId).then((d) => { setDeliveries(d); setLoading(false); });
  }, [webhookId]);

  if (loading) {
    return (
      <div className="space-y-1.5 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-7 rounded bg-border/20" />
        ))}
      </div>
    );
  }

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-4 text-[11.5px] text-muted-foreground/50">
        No deliveries yet — send a test ping or trigger a payment
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {deliveries.map((d) => (
        <div key={d.id} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-white/3 transition-colors">
          <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${d.status === "success" ? "bg-accent" : "bg-red-400"}`} />
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className={`text-[11px] font-mono font-semibold ${d.status === "success" ? "text-accent" : "text-red-400"}`}>
              {d.status === "success" ? "200" : String(Number(d.status_code) || "ERR")}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground/60 px-1.5 py-0.5 rounded border border-border/40 bg-surface/30">
              {d.event_type}
            </span>
            {d.error && (
              <span className="text-[10.5px] text-red-400/80 truncate max-w-[200px]">{d.error}</span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 text-[10.5px] font-mono text-muted-foreground/40">
            <span>{Number(d.duration_ms)}ms</span>
            <span>{timeAgo(d.attempted_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<ApiWebhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>(["payment.settled"]);
  const [adding, setAdding] = useState(false);
  const [pingStates, setPingStates] = useState<Record<string, "idle" | "pinging" | "ok" | "error">>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  const load = () => {
    api.getWebhooks().then((ws) => { setWebhooks(ws); setLoading(false); });
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (showAdd) urlRef.current?.focus(); }, [showAdd]);

  const addWebhook = async () => {
    if (!newUrl.trim() || adding) return;
    setAdding(true);
    try {
      await api.createWebhook({ url: newUrl.trim(), events: newEvents });
      setNewUrl(""); setNewEvents(["payment.settled"]); setShowAdd(false);
      load();
    } finally { setAdding(false); }
  };

  const toggle = async (wh: ApiWebhook) => {
    await api.updateWebhook(wh.id, { is_active: !wh.is_active });
    setWebhooks((ws) => ws.map((w) => w.id === wh.id ? { ...w, is_active: !w.is_active } : w));
  };

  const del = async (id: string) => {
    await api.deleteWebhook(id);
    setWebhooks((ws) => ws.filter((w) => w.id !== id));
    if (expanded === id) setExpanded(null);
  };

  const ping = async (id: string) => {
    setPingStates((s) => ({ ...s, [id]: "pinging" }));
    try {
      const r = await api.pingWebhook(id);
      setPingStates((s) => ({ ...s, [id]: r.ok ? "ok" : "error" }));
      load();
      if (expanded === id) setExpanded(null);
      setTimeout(() => setExpanded(id), 50);
    } catch {
      setPingStates((s) => ({ ...s, [id]: "error" }));
    }
    setTimeout(() => setPingStates((s) => ({ ...s, [id]: "idle" })), 3000);
  };

  const toggleEvent = (ev: string) => {
    setNewEvents((evs) => evs.includes(ev) ? evs.filter((e) => e !== ev) : [...evs, ev]);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1100px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Webhook Delivery</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real HTTP POST events delivered to your infrastructure — signed with HMAC-SHA256
          </p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-accent text-background text-[13px] font-medium hover:bg-accent/90 transition-colors flex-shrink-0"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 1v10M1 6h10"/></svg>
          Add endpoint
        </button>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-accent/20 bg-accent/3 p-5 space-y-4">
          <div className="text-[13px] font-medium">New webhook endpoint</div>
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground/60 mb-1.5">Endpoint URL</label>
            <input
              ref={urlRef}
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addWebhook()}
              placeholder="https://your-server.com/webhooks/astro"
              className="w-full h-9 px-3 rounded-lg border border-border bg-background/60 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground/60 mb-2.5">Events to subscribe</div>
            <div className="grid md:grid-cols-2 gap-2">
              {ALL_EVENTS.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => toggleEvent(ev.id)}
                  className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-colors ${
                    newEvents.includes(ev.id)
                      ? "border-accent/30 bg-accent/8 text-accent"
                      : "border-border bg-surface/20 text-muted-foreground hover:text-foreground hover:border-border/80"
                  }`}
                >
                  <div className={`mt-0.5 h-3.5 w-3.5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${newEvents.includes(ev.id) ? "border-accent bg-accent" : "border-muted-foreground/30"}`}>
                    {newEvents.includes(ev.id) && <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="white" strokeWidth="1.5"><path d="M1 4l2.5 2.5L7 1.5"/></svg>}
                  </div>
                  <div>
                    <div className="text-[12px] font-mono">{ev.label}</div>
                    <div className="text-[11px] text-muted-foreground/60 mt-0.5">{ev.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={addWebhook}
              disabled={!newUrl.trim() || newEvents.length === 0 || adding}
              className="h-8 px-5 rounded-lg bg-accent text-background text-[13px] font-medium hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {adding ? "Creating…" : "Create endpoint"}
            </button>
            <button onClick={() => { setShowAdd(false); setNewUrl(""); }} className="h-8 px-4 rounded-lg border border-border text-[13px] text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-border bg-surface/50 p-8 space-y-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="h-4 w-4 rounded-full bg-border/40 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-48 rounded bg-border/40" />
                <div className="h-2.5 w-64 rounded bg-border/30" />
              </div>
              <div className="h-6 w-14 rounded-lg bg-border/30" />
            </div>
          ))}
        </div>
      ) : webhooks.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface/50 p-16 text-center">
          <div className="h-12 w-12 rounded-2xl border border-border bg-surface/60 flex items-center justify-center mx-auto mb-5">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-muted-foreground/50">
              <path d="M9 4.5a4.5 4.5 0 0 1 9 0c0 2.5-1.5 3-3 5.5H9"/>
              <path d="M7.5 17a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z"/>
              <path d="M13 13c.8 1.5 2 3.5 2 3.5"/>
            </svg>
          </div>
          <p className="text-[14px] font-medium text-muted-foreground/70 mb-1.5">No webhook endpoints configured</p>
          <p className="text-[12px] text-muted-foreground/40 max-w-xs mx-auto mb-5">
            Add an HTTPS endpoint and Astro will POST real settlement events with HMAC-SHA256 signatures.
          </p>
          <button onClick={() => setShowAdd(true)} className="h-8 px-5 rounded-lg border border-accent/30 bg-accent/8 text-accent text-[12.5px] font-medium hover:bg-accent/15 transition-colors">
            Add your first endpoint
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {webhooks.map((wh) => {
            const events: string[] = (() => { try { return JSON.parse(wh.events); } catch { return []; } })();
            const ping_state = pingStates[wh.id] ?? "idle";
            const isExpanded = expanded === wh.id;
            const failRate = Number(wh.delivery_count) + Number(wh.failure_count) > 0
              ? Math.round(Number(wh.failure_count) / (Number(wh.delivery_count) + Number(wh.failure_count)) * 100)
              : 0;
            return (
              <div key={wh.id} className={`rounded-xl border bg-surface/50 transition-colors ${wh.is_active ? "border-border" : "border-border/40 opacity-60"}`}>
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${wh.is_active ? "bg-accent animate-pulse" : "bg-muted-foreground/30"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="font-mono text-[13px] text-foreground truncate">{wh.url}</div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {events.map((ev) => (
                              <span key={ev} className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border/60 bg-surface/40 text-muted-foreground">{ev}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => ping(wh.id)}
                            disabled={ping_state === "pinging" || !wh.is_active}
                            title="Send real test ping to endpoint"
                            className={`h-7 px-3 rounded-md border text-[11.5px] font-mono transition-all ${
                              ping_state === "ok"      ? "border-accent/30 bg-accent/10 text-accent" :
                              ping_state === "error"   ? "border-red-500/30 bg-red-500/10 text-red-400" :
                              ping_state === "pinging" ? "border-border text-muted-foreground/50 cursor-not-allowed" :
                              "border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                            } disabled:opacity-40`}
                          >
                            {ping_state === "pinging" ? "Pinging…" : ping_state === "ok" ? "Sent ✓" : ping_state === "error" ? "Failed" : "Ping"}
                          </button>
                          <button
                            onClick={() => toggle(wh)}
                            className={`h-7 px-3 rounded-md border text-[11.5px] font-mono transition-colors ${
                              wh.is_active
                                ? "border-border text-muted-foreground hover:text-foreground"
                                : "border-accent/20 text-accent/70 hover:text-accent hover:border-accent/30"
                            }`}
                          >
                            {wh.is_active ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() => del(wh.id)}
                            className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground/40 hover:text-red-400 hover:border-red-500/30 transition-colors"
                          >
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1.5 3h8M4.5 3V2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1M2.5 3l.5 6.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5L8.5 3"/></svg>
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-2 md:grid-cols-5 gap-4 text-[11px] font-mono">
                        <div>
                          <div className="text-muted-foreground/50 mb-1">Secret</div>
                          <SecretReveal secret={wh.secret} />
                        </div>
                        <div>
                          <div className="text-muted-foreground/50 mb-1">Delivered</div>
                          <div className="text-foreground">{Number(wh.delivery_count) || 0}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground/50 mb-1">Failed</div>
                          <div className={Number(wh.failure_count) > 0 ? "text-red-400" : "text-foreground"}>{Number(wh.failure_count) || 0}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground/50 mb-1">Fail rate</div>
                          <div className={failRate > 20 ? "text-red-400" : "text-foreground"}>{failRate}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground/50 mb-1">Last delivery</div>
                          <div className="text-muted-foreground/70">{wh.last_ping_at ? timeAgo(wh.last_ping_at) : "Never"}</div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-border/30">
                        <button
                          onClick={() => setExpanded(isExpanded ? null : wh.id)}
                          className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        >
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}><path d="M3 2l4 3-4 3"/></svg>
                          {isExpanded ? "Hide" : "View"} delivery history
                        </button>
                        {isExpanded && (
                          <div className="mt-3">
                            <DeliveryHistory webhookId={wh.id} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border border-border/40 bg-surface/20 p-5">
        <div className="text-[12px] font-medium mb-3">Payload format</div>
        <pre className="text-[11px] font-mono text-muted-foreground/70 leading-relaxed">{`POST https://your-server.com/webhook
Content-Type: application/json
X-Astro-Signature: sha256=<hmac-sha256>
X-Astro-Timestamp: <unix-ms>
X-Astro-Event: payment.settled
X-Astro-Delivery: <delivery-id>

{
  "event": "payment.settled",
  "created_at": "2026-04-25T10:00:00Z",
  "delivery_id": "wd_abc123",
  "data": {
    "payment_id": "pay_abc123",
    "resource_id": "r_xyz456",
    "amount_lamports": 1000000,
    "token": "USDC",
    "payer_wallet": "8xMH…V2Qw",
    "tx_signature": "4K9P…nMwR",
    "status": "settled"
  }
}`}</pre>
        <div className="mt-3 pt-3 border-t border-border/30">
          <div className="text-[11px] font-mono text-muted-foreground/50">Verify signature:</div>
          <pre className="text-[11px] font-mono text-muted-foreground/60 mt-1">{`const expectedSig = crypto
  .createHmac('sha256', webhookSecret)
  .update(\`\${timestamp}.\${rawBody}\`)
  .digest('hex');
assert(sig === \`sha256=\${expectedSig}\`);`}</pre>
        </div>
      </div>
    </div>
  );
}
