import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { api, type ApiEvent, timeAgo } from "@/lib/api";

export const Route = createFileRoute("/dashboard/audit")({
  component: AuditPage,
});

const EVENT_META: Record<string, { label: string; color: string; icon: JSX.Element }> = {
  "resource.created":  { label: "Resource created",  color: "text-accent border-accent/20 bg-accent/8",          icon: <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="9" height="9" rx="1"/><path d="M5.5 3.5v4M3.5 5.5h4"/></svg> },
  "resource.deleted":  { label: "Resource deleted",  color: "text-red-400 border-red-500/20 bg-red-500/8",       icon: <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="9" height="9" rx="1"/><path d="M3.5 5.5h4"/></svg> },
  "api_key.created":   { label: "API key created",   color: "text-purple-400 border-purple-500/20 bg-purple-500/8", icon: <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="4" cy="6" r="2.5"/><path d="M6 5.5l4-4M8.5 3l1 1"/></svg> },
  "api_key.deleted":   { label: "API key revoked",   color: "text-orange-400 border-orange-500/20 bg-orange-500/8", icon: <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="4" cy="6" r="2.5"/><path d="M1.5 1.5l8 8"/></svg> },
  "webhook.created":   { label: "Webhook added",     color: "text-blue-400 border-blue-500/20 bg-blue-500/8",    icon: <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5.5 1.5a2 2 0 0 1 4 0c0 1.5-1 2.5-2 3.5H5.5"/><circle cx="4.5" cy="8.5" r="2"/><path d="M6.5 6.5c.5.5 1 1.5 1 1.5"/></svg> },
  "webhook.deleted":   { label: "Webhook removed",   color: "text-orange-400 border-orange-500/20 bg-orange-500/8", icon: <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1.5 1.5l8 8"/></svg> },
  "payment.settled":   { label: "Payment settled",   color: "text-accent border-accent/20 bg-accent/8",          icon: <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="0.5" y="2.5" width="10" height="7" rx="1"/><path d="M0.5 5h10"/><path d="M3 7.5h2"/></svg> },
};

const FILTERS = ["all", "resource", "api_key", "webhook", "payment"] as const;
type Filter = typeof FILTERS[number];

function AuditPage() {
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    api.getEvents().then((evs) => { setEvents(evs); setLoading(false); });
  }, []);

  const filtered = events.filter((e) => filter === "all" || e.entity_type === filter);

  const grouped = filtered.reduce<Record<string, ApiEvent[]>>((acc, ev) => {
    const day = new Date(ev.created_at).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    (acc[day] = acc[day] ?? []).push(ev);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6 max-w-[860px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Audit Log</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Chronological record of all workspace events
          </p>
        </div>
        <div className="text-[11px] font-mono text-muted-foreground/50 flex-shrink-0 mt-1">
          {events.length} event{events.length !== 1 ? "s" : ""} total
        </div>
      </div>

      <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-surface/30 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-[11.5px] font-mono capitalize transition-colors ${
              filter === f ? "bg-accent/10 text-accent" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "api_key" ? "API keys" : f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-3 w-36 rounded bg-border/40 animate-pulse" />
              {[...Array(3)].map((_, j) => (
                <div key={j} className="flex gap-3 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-border/30 flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-48 rounded bg-border/40" />
                    <div className="h-2.5 w-64 rounded bg-border/30" />
                  </div>
                  <div className="h-2.5 w-16 rounded bg-border/30" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface/50 py-20 text-center">
          <div className="h-10 w-10 rounded-xl border border-border bg-surface/60 flex items-center justify-center mx-auto mb-4">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-muted-foreground/50">
              <path d="M3 4h12M3 9h8M3 14h5"/><circle cx="15" cy="13" r="2.5"/><path d="M16.7 15l1.8 1.8"/>
            </svg>
          </div>
          <p className="text-[13px] text-muted-foreground/60">
            {filter !== "all" ? `No ${filter} events recorded yet` : "No events recorded yet"}
          </p>
          <p className="text-[11px] text-muted-foreground/40 mt-1 font-mono">Events appear here as you create resources, API keys, and webhooks</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([day, dayEvents]) => (
            <div key={day}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-border/40" />
                <span className="text-[10.5px] font-mono text-muted-foreground/60 flex-shrink-0">{day}</span>
                <div className="h-px flex-1 bg-border/40" />
              </div>
              <div className="space-y-1">
                {dayEvents.map((ev) => {
                  const meta = EVENT_META[ev.event_type] ?? {
                    label: ev.event_type,
                    color: "text-muted-foreground border-border bg-surface/40",
                    icon: <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="5.5" cy="5.5" r="4"/></svg>,
                  };
                  const evMeta = ev.metadata as Record<string, unknown>;
                  return (
                    <div key={ev.id} className="flex items-start gap-3 px-4 py-3 rounded-lg hover:bg-white/2 transition-colors group">
                      <div className={`h-7 w-7 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${meta.color}`}>
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded border ${meta.color}`}>{meta.label}</span>
                          <span className="text-[12.5px] font-medium text-foreground truncate max-w-[240px]">{ev.entity_name}</span>
                        </div>
                        {Object.keys(evMeta).length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                            {Object.entries(evMeta).filter(([, v]) => v !== null && v !== undefined && v !== "").slice(0, 4).map(([k, v]) => (
                              <span key={k} className="text-[10.5px] font-mono text-muted-foreground/50">
                                {k}: <span className="text-muted-foreground/70">{String(v).length > 20 ? String(v).slice(0, 20) + "…" : String(v)}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground/50 flex-shrink-0 mt-0.5 group-hover:text-muted-foreground/70 transition-colors whitespace-nowrap">
                        {timeAgo(ev.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
