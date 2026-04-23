import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/meridian/PageLayout";

export const Route = createFileRoute("/status")({
  component: StatusPage,
});

const SYSTEMS = [
  { name: "Settlement verifier", status: "operational", latency: "42 ms", uptime: "99.99%" },
  { name: "Receipt indexer", status: "operational", latency: "1.2 s", uptime: "99.98%" },
  { name: "Quote API", status: "operational", latency: "18 ms", uptime: "100%" },
  { name: "Console", status: "operational", latency: "—", uptime: "99.97%" },
  { name: "Solana settlement (mainnet)", status: "operational", latency: "~400 ms", uptime: "100%" },
  { name: "Solana settlement (devnet)", status: "operational", latency: "~500 ms", uptime: "99.97%" },
];

const INCIDENTS = [
  {
    date: "Apr 9, 2026",
    title: "Receipt indexer — 4-minute delay",
    status: "Resolved",
    description: "A dependency upgrade to the indexer worker caused a 4-minute gap in receipt ingestion between 14:22–14:26 UTC. All receipts from the window were backfilled within 8 minutes. No data was lost.",
  },
  {
    date: "Mar 21, 2026",
    title: "Quote API — elevated latency",
    status: "Resolved",
    description: "A misconfigured autoscaling rule caused quote API p99 latency to spike to 420ms for ~11 minutes between 08:44–08:55 UTC. The scaling rule was corrected and latency returned to baseline. No quotes were dropped.",
  },
];

const STATUS_STYLE: Record<string, { dot: string; label: string; badge: string }> = {
  operational: { dot: "bg-emerald-500", label: "Operational", badge: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  degraded: { dot: "bg-amber-500", label: "Degraded", badge: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  outage: { dot: "bg-red-500", label: "Outage", badge: "text-red-400 bg-red-500/10 border-red-500/20" },
};

function StatusPage() {
  const allOperational = SYSTEMS.every((s) => s.status === "operational");

  return (
    <PageLayout
      eyebrow="Status"
      title="System status."
      intro="Real-time status and uptime for Astro's protocol infrastructure, settlement chains, and hosted services."
    >
      <div className={`-mt-12 mb-16 inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-[13px] ${allOperational ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-amber-500/20 bg-amber-500/10 text-amber-400"}`}>
        <span className={`h-2 w-2 rounded-full ${allOperational ? "bg-emerald-500" : "bg-amber-500"}`} />
        {allOperational ? "All systems operational" : "Some systems degraded"}
        <span className="text-[11px] font-mono opacity-60">Updated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} UTC</span>
      </div>

      <div className="border-t border-border pt-20 mb-20">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-8">Services</div>
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="grid grid-cols-[1fr_120px_120px_120px] bg-surface/40 border-b border-border px-5 py-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <div>Service</div>
            <div className="text-center">Status</div>
            <div className="text-center">Latency</div>
            <div className="text-center">30d uptime</div>
          </div>
          {SYSTEMS.map((s) => {
            const style = STATUS_STYLE[s.status];
            return (
              <div key={s.name} className="grid grid-cols-[1fr_120px_120px_120px] px-5 py-4 text-[13.5px] border-b border-border last:border-0 hover:bg-surface/20 transition-colors items-center">
                <div className="font-medium">{s.name}</div>
                <div className="flex justify-center">
                  <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono border rounded-full px-2.5 py-1 ${style.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {style.label}
                  </span>
                </div>
                <div className="text-center font-mono text-[13px] text-muted-foreground">{s.latency}</div>
                <div className="text-center font-mono text-[13px] text-muted-foreground">{s.uptime}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-20 mb-20">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-8">Recent incidents</div>
        {INCIDENTS.length === 0 ? (
          <p className="text-[14px] text-muted-foreground">No incidents in the last 90 days.</p>
        ) : (
          <div className="space-y-4">
            {INCIDENTS.map((inc) => (
              <div key={inc.title} className="rounded-2xl border border-border bg-surface/20 p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[12px] font-mono text-muted-foreground">{inc.date}</span>
                  <span className="text-[10.5px] font-mono uppercase tracking-[0.14em] border rounded px-2 py-0.5 text-emerald-400 bg-emerald-500/10 border-emerald-500/20">
                    {inc.status}
                  </span>
                </div>
                <h3 className="text-[16px] font-medium mb-2">{inc.title}</h3>
                <p className="text-[13.5px] text-muted-foreground leading-relaxed">{inc.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border pt-20">
        <div className="max-w-xl">
          <h2 className="text-[20px] font-medium mb-2">Subscribe to status updates.</h2>
          <p className="text-[14px] text-muted-foreground mb-5">Get notified by email when an incident is opened or resolved.</p>
          <div className="flex items-center gap-2">
            <input type="email" placeholder="your@email.com" className="h-10 rounded-md border border-border bg-surface/40 px-4 text-[13.5px] text-foreground placeholder:text-muted-foreground flex-1 focus:outline-none focus:border-accent/60 transition-colors" />
            <button className="h-10 px-5 rounded-md bg-foreground text-background text-[13.5px] font-medium hover:bg-foreground/90 transition-colors flex-shrink-0">Subscribe</button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
