import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/meridian/PageLayout";

export const Route = createFileRoute("/sdks")({
  component: SDKsPage,
});

const SDKS = [
  {
    lang: "TypeScript",
    pkg: "@astro/sdk",
    install: "npm install @astro/sdk",
    status: "stable",
    runtimes: ["Node 20+", "Bun", "Deno", "Cloudflare Workers"],
    desc: "The reference SDK. Full protocol support, typed context, pricing utilities, and receipt verification built in.",
    docsTo: "/docs/clients",
  },
  {
    lang: "Python",
    pkg: "astro-sdk",
    install: "pip install astro-sdk",
    status: "stable",
    runtimes: ["Python 3.11+", "FastAPI", "Flask", "Django"],
    desc: "Native async support for ASGI and WSGI frameworks. Drop-in middleware for FastAPI and Flask.",
    docsTo: "/docs/clients",
  },
  {
    lang: "Go",
    pkg: "github.com/meridian-protocol/go-sdk",
    install: "go get github.com/meridian-protocol/go-sdk",
    status: "alpha",
    runtimes: ["Go 1.22+", "net/http", "chi", "gin"],
    desc: "Idiomatic Go middleware. Typed quote and intent structs. Compatible with the standard library and popular routers.",
    docsTo: "/docs/clients",
  },
  {
    lang: "Rust",
    pkg: "astro-sdk",
    install: "cargo add astro-sdk",
    status: "alpha",
    runtimes: ["Rust stable", "Axum", "Actix-web", "Tower"],
    desc: "Zero-allocation intent verification. Async-first with full Tokio support.",
    docsTo: "/docs/clients",
  },
];

const STATUS: Record<string, string> = {
  stable: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  alpha: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  beta: "bg-accent/10 text-accent border-accent/20",
};

function SDKsPage() {
  return (
    <PageLayout
      eyebrow="SDKs"
      title="First-party SDKs for every stack."
      intro="Astro ships production-ready SDKs in TypeScript, Python, Go, and Rust. Each SDK implements the full 402 protocol — serve(), pricing, settlement, and receipt verification."
    >
      <div className="grid sm:grid-cols-2 gap-5 mb-20">
        {SDKS.map((sdk) => (
          <div key={sdk.lang} className="rounded-2xl border border-border bg-surface/20 p-7 flex flex-col hover:border-accent/30 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[18px] font-medium">{sdk.lang}</div>
                <div className="text-[12px] font-mono text-muted-foreground mt-0.5">{sdk.pkg}</div>
              </div>
              <span className={`text-[10.5px] font-mono uppercase tracking-[0.14em] border rounded px-2 py-0.5 ${STATUS[sdk.status]}`}>
                {sdk.status}
              </span>
            </div>
            <p className="text-[13.5px] text-muted-foreground leading-relaxed mb-5 flex-1">{sdk.desc}</p>
            <div className="bg-background/60 border border-border rounded-lg px-4 py-3 font-mono text-[12.5px] text-foreground/80 mb-5">
              $ {sdk.install}
            </div>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {sdk.runtimes.map((r) => (
                <span key={r} className="text-[11px] font-mono text-muted-foreground border border-border rounded px-2 py-0.5">{r}</span>
              ))}
            </div>
            <Link to={sdk.docsTo} className="text-[13px] text-accent hover:underline mt-auto">
              SDK reference →
            </Link>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-20 mb-20">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-8">Community SDKs</div>
        <div className="rounded-2xl border border-border bg-surface/20 p-8">
          <p className="text-[15px] text-muted-foreground leading-relaxed mb-6 max-w-2xl">
            The protocol spec is public and the wire format is fully documented. Community implementations exist for Ruby, Java, and .NET — maintained by contributors outside the Astro team.
          </p>
          <p className="text-[14px] text-muted-foreground">
            Building an SDK for another language?{" "}
            <a href="/contact" className="text-accent hover:underline">Let us know</a> — we'll link it here and support you with testing against the reference implementation.
          </p>
        </div>
      </div>

      <div className="border-t border-border pt-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-[22px] font-medium mb-1">Ready to build?</h2>
            <p className="text-[14px] text-muted-foreground">The Quickstart walks you through your first paid endpoint in five minutes.</p>
          </div>
          <Link to="/docs/quickstart" className="inline-flex h-10 items-center px-5 rounded-md bg-foreground text-background text-[13.5px] font-medium hover:bg-foreground/90 transition-colors">
            Quickstart →
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
