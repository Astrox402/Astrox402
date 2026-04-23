import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/meridian/Nav";
import { Footer } from "@/components/meridian/Footer";

export const Route = createFileRoute("/changelog")({
  component: ChangelogPage,
});

const ENTRIES = [
  {
    version: "v0.402.3",
    date: "Apr 18, 2026",
    tag: "SDK",
    title: "Pricing function composition",
    items: [
      "Added `compose()` utility for chaining pricing functions — combine base price, tier multipliers, and scope modifiers without nesting.",
      "TypeScript types for `PriceFn<Ctx>` are now fully generic; custom context shapes work without casting.",
      "Fixed an edge case where `price: 0` caused the verifier to reject a valid free-tier call.",
      "Improved error messages when a pricing function throws — now includes the resource path and call context in the log.",
    ],
  },
  {
    version: "v0.402.2",
    date: "Apr 9, 2026",
    tag: "Protocol",
    title: "Arbitrum settlement support",
    items: [
      "Arbitrum One added as a supported settlement chain. Configure with `{ chain: 'arbitrum' }` in `serve()`.",
      "Settlement contracts deployed and verified on Arbitrum One mainnet. Contract addresses published in docs.",
      "Quote responses now include `chains` field — an array of all chains the endpoint accepts, so callers can select the cheapest route.",
      "Gas estimation improved for L2 chains — quotes now include an accurate `gasEstimate` field in USD.",
    ],
  },
  {
    version: "v0.402.1",
    date: "Mar 28, 2026",
    tag: "Console",
    title: "Receipt explorer & CSV export",
    items: [
      "Console receipt log now supports full-text search across resource paths, caller addresses, and transaction hashes.",
      "Export filtered receipts to CSV. Date range, chain, resource, and caller filters all apply to the export.",
      "Added batch verification — select multiple receipts and verify all onchain in one click.",
      "Receipt detail drawer now shows the full EIP-712 payload, decoded and formatted.",
    ],
  },
  {
    version: "v0.402.0",
    date: "Mar 14, 2026",
    tag: "Protocol",
    title: "Public beta — Base + Optimism live",
    items: [
      "Meridian protocol enters public beta. Breaking changes will be communicated with ≥ 14 days notice from this release forward.",
      "Base and Optimism settlement contracts deployed and audited. Ethereum mainnet remains live.",
      "TypeScript SDK `@meridian/sdk` published to npm under a source-available license.",
      "Python SDK `meridian-sdk` published to PyPI — supports FastAPI, Flask, and Django middleware patterns.",
      "Scope system formalized: scopes are now dot-namespaced strings (`inference.gpt`, `data.read.public`). Wildcards supported.",
      "Receipt indexer live — all settled calls are indexed and queryable via the Console API within 2 seconds of finality.",
    ],
  },
  {
    version: "v0.3.1",
    date: "Feb 21, 2026",
    tag: "SDK",
    title: "Go SDK alpha + intent serialization fixes",
    items: [
      "Go SDK `github.com/meridian-protocol/go-sdk` tagged at v0.3.1-alpha. HTTP middleware pattern compatible with `net/http` and `chi`.",
      "Fixed intent serialization bug affecting callers on Windows due to line-ending normalization in the EIP-712 encoder.",
      "Added `ctx.payment.scope` to handler context — lets handlers branch on the caller's authorized scope without re-parsing the intent.",
    ],
  },
  {
    version: "v0.3.0",
    date: "Feb 7, 2026",
    tag: "Protocol",
    title: "Agent identity + budget policies",
    items: [
      "Agent-scoped keys: autonomous callers can now hold a Meridian identity with a per-period spend ceiling enforced at the protocol level.",
      "Budget policies specified as onchain EIP-712 typed-data. Policies are verifiable without trusting Meridian infrastructure.",
      "Added `ctx.caller.isAgent` and `ctx.caller.budget` to the server handler context.",
      "New docs section: Agent commerce — covers identity provisioning, budget setting, and policy verification.",
    ],
  },
];

const TAG_COLORS: Record<string, string> = {
  Protocol: "bg-accent/15 text-accent border-accent/30",
  SDK: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Console: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function ChangelogPage() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <Nav />

      <div className="pt-32 pb-24">
        <div className="mx-auto max-w-7xl px-6">

          <div className="max-w-2xl mb-20">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent mb-5">Changelog</div>
            <h1 className="text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.03em] font-medium text-gradient">
              What's new in Meridian.
            </h1>
            <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">
              Protocol updates, SDK releases, and Console improvements — logged here as they ship.
            </p>
          </div>

          <div className="flex gap-16">
            <div className="flex-1 min-w-0 space-y-16">
              {ENTRIES.map((e) => (
                <div key={e.version} className="relative">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="text-[11px] font-mono tracking-[0.16em] text-muted-foreground">{e.date}</span>
                    <span className={`text-[10.5px] font-mono uppercase tracking-[0.16em] border rounded px-2 py-0.5 ${TAG_COLORS[e.tag] ?? "bg-surface text-muted-foreground border-border"}`}>
                      {e.tag}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground/50">{e.version}</span>
                  </div>
                  <h2 className="text-[22px] font-medium mb-5">{e.title}</h2>
                  <ul className="space-y-3">
                    {e.items.map((item, i) => (
                      <li key={i} className="flex gap-3 text-[14px] text-muted-foreground leading-relaxed">
                        <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-accent/60 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 border-b border-border" />
                </div>
              ))}

              <div className="text-[13.5px] text-muted-foreground">
                Looking for older releases?{" "}
                <a href="#" className="text-accent hover:underline">View archive on GitHub →</a>
              </div>
            </div>

            <aside className="hidden lg:block w-52 flex-shrink-0">
              <div className="sticky top-28">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-4">Jump to</div>
                <ul className="space-y-2">
                  {ENTRIES.map((e) => (
                    <li key={e.version}>
                      <a href={`#${e.version}`} className="text-[12.5px] text-muted-foreground hover:text-foreground transition-colors block">
                        {e.version}
                        <span className="block text-[11px] opacity-60">{e.date}</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 pt-8 border-t border-border">
                  <Link to="/docs" className="text-[12.5px] text-muted-foreground hover:text-foreground transition-colors">
                    ← Back to docs
                  </Link>
                </div>
              </div>
            </aside>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
