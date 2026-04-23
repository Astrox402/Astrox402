import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Nav } from "@/components/meridian/Nav";
import { Footer } from "@/components/meridian/Footer";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — Meridian Protocol" },
      { name: "description", content: "Build paid endpoints, agents, and machine-commerce flows on Meridian. Reference, guides, and the x402-inspired specification." },
      { property: "og:title", content: "Docs — Meridian Protocol" },
      { property: "og:description", content: "Reference, guides, and the x402-inspired specification for the payment-native protocol layer." },
    ],
  }),
  component: DocsPage,
});

const NAV = [
  {
    group: "Getting started",
    items: [
      { id: "introduction", label: "Introduction" },
      { id: "install", label: "Install the SDK" },
      { id: "quickstart", label: "Quickstart" },
    ],
  },
  {
    group: "Protocol",
    items: [
      { id: "x402", label: "The 402 handshake" },
      { id: "serve", label: "serve()" },
      { id: "pricing", label: "Programmable pricing" },
      { id: "settlement", label: "Settlement & receipts" },
    ],
  },
  {
    group: "Clients",
    items: [
      { id: "client-sdk", label: "Client SDK" },
      { id: "agents", label: "Agents & machine commerce" },
      { id: "errors", label: "Errors & retries" },
    ],
  },
];

function DocsPage() {
  const [active, setActive] = useState("introduction");

  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <Nav />

      <div className="pt-16">
        {/* Sub-header */}
        <div className="border-b border-border bg-surface/30 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[13px]">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <span className="text-muted-foreground/40">/</span>
              <span>Docs</span>
              <span className="ml-3 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] border border-border rounded text-muted-foreground">v0.402</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button className="h-8 px-3 text-[12px] text-muted-foreground border border-border rounded-md hover:text-foreground transition-colors flex items-center gap-2">
                <span>Search docs</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-background border border-border rounded">⌘K</kbd>
              </button>
              <a href="#" className="h-8 px-3 text-[12px] text-muted-foreground border border-border rounded-md hover:text-foreground transition-colors inline-flex items-center">GitHub ↗</a>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-14 grid lg:grid-cols-[220px_1fr_200px] gap-12">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">
              {NAV.map((g) => (
                <div key={g.group}>
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-3">{g.group}</div>
                  <ul className="space-y-1">
                    {g.items.map((i) => (
                      <li key={i.id}>
                        <a
                          href={`#${i.id}`}
                          onClick={() => setActive(i.id)}
                          className={`block px-3 py-1.5 rounded-md text-[13.5px] transition-colors ${
                            active === i.id
                              ? "bg-surface text-foreground border-l border-accent"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {i.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          {/* Content */}
          <article className="min-w-0 max-w-2xl">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent mb-4">Documentation</div>
            <h1 className="text-[clamp(2rem,4vw,2.75rem)] leading-[1.05] tracking-[-0.025em] font-medium text-gradient">
              Build on the payment-native internet.
            </h1>
            <p className="mt-5 text-[16px] leading-relaxed text-muted-foreground">
              Meridian turns any endpoint, capability, or digital resource into a programmable, monetizable primitive — settled on Ethereum. These docs walk through the protocol, the SDKs, and the production patterns.
            </p>

            <Section id="introduction" title="Introduction">
              <p>
                Meridian is built around a simple idea: <span className="text-foreground">access and payment should be one request</span>. The protocol uses an x402-inspired handshake where a server can declare a price, the client signs a payment intent, and the resource is returned with an onchain receipt — all in a single round-trip.
              </p>
              <Callout>
                You can ship a paid endpoint in <code className="font-mono text-accent">~9 lines</code> of code. No billing stack, no metering pipeline, no entitlement service.
              </Callout>
            </Section>

            <Section id="install" title="Install the SDK">
              <Code lang="bash" code={`# npm
npm install @meridian/sdk

# pnpm
pnpm add @meridian/sdk

# bun
bun add @meridian/sdk`} />
              <p>The SDK ships as ESM with full TypeScript types. Server runtimes: Node 20+, Bun, Deno, Cloudflare Workers.</p>
            </Section>

            <Section id="quickstart" title="Quickstart">
              <p>Wrap any handler with <Mono>serve()</Mono>. Define a price. Done.</p>
              <Code lang="ts" code={`import { meridian } from "@meridian/sdk";

export const POST = meridian.serve({
  resource: "/v1/infer",
  scope:    "inference.gpt",
  price:    ({ tokens }) => tokens * 0.000004 + 0.001,
  settle:   { chain: "ethereum", asset: "USDC" },
  ttl:      60,

  async handler(req, ctx) {
    const { prompt } = await req.json();
    const result = await model.infer(prompt);
    return ctx.respond(result, { receipt: ctx.payment.txHash });
  },
});`} />
            </Section>

            <Section id="x402" title="The 402 handshake">
              <p>
                When a caller requests a Meridian resource without a valid payment, the server returns <Mono>HTTP 402 Payment Required</Mono> with the price, scope, settlement chain, and TTL declared in headers. The client signs a payment intent and retries; the server verifies it onchain and returns the resource with a receipt.
              </p>
              <Code lang="http" code={`HTTP/1.1 402 Payment Required
x-meridian-price:  0.0021 USDC
x-meridian-scope:  inference.gpt
x-meridian-settle: ethereum
x-meridian-ttl:    60
x-meridian-nonce:  9f4a…2e1c`} />
            </Section>

            <Section id="serve" title="serve()">
              <p>The single primitive that wraps any handler in the payment-aware envelope.</p>
              <Params rows={[
                ["resource", "string", "Stable identifier for this endpoint."],
                ["scope", "string", "Capability namespace, e.g. inference.gpt."],
                ["price", "Money | (req) => Money", "Static value or pure function."],
                ["settle", "{ chain, asset }", "Settlement target. Defaults to ethereum + USDC."],
                ["ttl", "number", "Validity window for the payment intent, in seconds."],
                ["handler", "(req, ctx) => Response", "Runs only after payment is verified."],
              ]} />
            </Section>

            <Section id="pricing" title="Programmable pricing">
              <p>
                Price as a constant, a function of the request, or a function of upstream signals. Meridian evaluates the function on the 402 response and locks the quote for the TTL.
              </p>
              <Code lang="ts" code={`// per-token
price: ({ tokens }) => tokens * 0.000004

// tiered by payload size
price: ({ bytes }) =>
  bytes < 1024 ? 0.0001 : 0.001

// outcome-based
price: async ({ confidence }) =>
  confidence > 0.9 ? 0.005 : 0.001`} />
            </Section>

            <Section id="settlement" title="Settlement & receipts">
              <p>
                Every successful call produces an onchain receipt — a verifiable proof that the resource was delivered and the payment was settled. Receipts are queryable from the console, the SDK, or directly from Ethereum.
              </p>
              <Code lang="ts" code={`const receipt = await meridian.receipts.get(txHash);

receipt.resource     // "/v1/infer"
receipt.amount       // "0.0021 USDC"
receipt.settled_at   // 1727384921
receipt.proof        // 0x9f4a…2e1c`} />
            </Section>

            <Section id="client-sdk" title="Client SDK">
              <p>The client SDK transparently handles the 402 handshake — signing, retrying, and surfacing receipts to your application.</p>
              <Code lang="ts" code={`import { meridianClient } from "@meridian/sdk";

const client = meridianClient({
  wallet: signer,
  maxSpend: "1 USDC / hour",
});

const res = await client.fetch("/v1/infer", {
  method: "POST",
  body: JSON.stringify({ prompt: "hello" }),
});`} />
            </Section>

            <Section id="agents" title="Agents & machine commerce">
              <p>
                Autonomous agents can transact for capabilities they need — paying per call, per tool, per outcome. Set spend limits, scope allowlists, and approval policies at the agent level.
              </p>
              <Code lang="ts" code={`const agent = meridian.agent({
  budget: "5 USDC / day",
  allow:  ["inference.*", "search.web", "data.market"],
});

await agent.invoke("search.web", { q: "x402 spec" });`} />
            </Section>

            <Section id="errors" title="Errors & retries">
              <p>The SDK retries with exponential backoff on transient settlement errors. Permanent failures surface as typed exceptions.</p>
              <Params rows={[
                ["402", "Payment required. SDK handles automatically."],
                ["409", "Quote expired — retry to receive a new quote."],
                ["422", "Settlement rejected. Inspect receipt.error."],
                ["429", "Rate limited at the resource level."],
              ]} />
            </Section>

            {/* Footer nav */}
            <div className="mt-20 pt-8 border-t border-border flex items-center justify-between text-[13px]">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">← Back to home</Link>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Edit on GitHub →</a>
            </div>
          </article>

          {/* On-this-page */}
          <aside className="hidden xl:block">
            <div className="sticky top-28">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-3">On this page</div>
              <ul className="space-y-2 text-[12.5px]">
                {NAV.flatMap((g) => g.items).map((i) => (
                  <li key={i.id}>
                    <a href={`#${i.id}`} className="text-muted-foreground hover:text-foreground transition-colors">{i.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-16 scroll-mt-32">
      <h2 className="text-[24px] font-medium tracking-tight mb-5 flex items-center gap-3 group">
        {title}
        <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 text-accent text-[14px] transition-opacity">#</a>
      </h2>
      <div className="space-y-5 text-[15px] leading-relaxed text-muted-foreground [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}

function Mono({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-[13px] text-accent bg-surface/60 border border-border rounded px-1.5 py-0.5">{children}</code>;
}

function Code({ lang, code }: { lang: string; code: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/50 overflow-hidden my-2">
      <div className="flex items-center justify-between px-4 h-9 border-b border-border bg-background/60">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">{lang}</span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors"
        >
          Copy
        </button>
      </div>
      <pre className="p-5 font-mono text-[12.5px] leading-[1.7] text-foreground/85 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-2 rounded-lg border border-accent/30 bg-accent/5 p-4 text-[14px] text-foreground/90 leading-relaxed">
      {children}
    </div>
  );
}

function Params({ rows }: { rows: string[][] }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden my-2">
      {rows.map((r, i) => (
        <div key={i} className={`grid ${r.length === 3 ? "grid-cols-[140px_140px_1fr]" : "grid-cols-[100px_1fr]"} gap-4 px-4 py-3 text-[13px] border-b border-border last:border-0`}>
          {r.map((cell, j) => (
            <div key={j} className={j === 0 ? "font-mono text-accent" : j === 1 && r.length === 3 ? "font-mono text-muted-foreground" : "text-muted-foreground"}>
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
