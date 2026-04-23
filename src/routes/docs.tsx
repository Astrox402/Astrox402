import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, Code, Callout, PageFooterNav } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Docs — Meridian Protocol" },
      { name: "description", content: "Build paid endpoints, agents, and machine-commerce flows on Meridian. Reference, guides, and the x402-inspired specification." },
      { property: "og:title", content: "Docs — Meridian Protocol" },
      { property: "og:description", content: "Reference, guides, and the x402-inspired specification for the payment-native protocol layer." },
    ],
  }),
  component: DocsIndex,
});

const TOC = [
  { id: "introduction", label: "Introduction" },
  { id: "install", label: "Install the SDK" },
  { id: "quickstart", label: "Quickstart" },
  { id: "next", label: "Where to next" },
];

function DocsIndex() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Documentation"
        title="Build on the payment-native internet."
        intro="Meridian turns any endpoint, capability, or digital resource into a programmable, monetizable primitive — settled on Ethereum. These docs walk through the protocol, the SDKs, and the production patterns."
      />

      <DocSection id="introduction" title="Introduction">
        <p>
          Meridian is built around a simple idea: <strong>access and payment should be one request</strong>. The protocol uses an x402-inspired handshake where a server can declare a price, the client signs a payment intent, and the resource is returned with an onchain receipt — all in a single round-trip.
        </p>
        <Callout>
          You can ship a paid endpoint in <code className="font-mono text-accent">~9 lines</code> of code. No billing stack, no metering pipeline, no entitlement service.
        </Callout>
      </DocSection>

      <DocSection id="install" title="Install the SDK">
        <Code lang="bash" code={`# npm
npm install @meridian/sdk

# pnpm
pnpm add @meridian/sdk

# bun
bun add @meridian/sdk`} />
        <p>The SDK ships as ESM with full TypeScript types. Server runtimes: Node 20+, Bun, Deno, Cloudflare Workers.</p>
      </DocSection>

      <DocSection id="quickstart" title="Quickstart">
        <p>Wrap any handler with <code className="font-mono text-accent">serve()</code>. Define a price. Done.</p>
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
      </DocSection>

      <DocSection id="next" title="Where to next">
        <p>Each section of the protocol has its own deep dive:</p>
        <ul className="grid sm:grid-cols-2 gap-3 mt-4 not-prose">
          {[
            ["/docs/handshake", "The 402 handshake", "How access and payment merge into one request."],
            ["/docs/serve", "serve()", "The single primitive that wraps any handler."],
            ["/docs/pricing", "Pricing functions", "Programmable price functions, tiers, and outcomes."],
            ["/docs/receipts", "Receipts & settlement", "Onchain proofs, chains, and reconciliation."],
            ["/docs/clients", "SDK clients", "Calling Meridian endpoints from apps and agents."],
          ].map(([to, t, d]) => (
            <li key={to}>
              <a href={to} className="block rounded-lg border border-border bg-surface/30 p-4 hover:border-accent/40 hover:bg-surface/60 transition-colors">
                <div className="text-[14px] font-medium text-foreground">{t}</div>
                <div className="text-[12.5px] text-muted-foreground mt-1">{d}</div>
              </a>
            </li>
          ))}
        </ul>
      </DocSection>

      <PageFooterNav next={{ to: "/docs/handshake", label: "The 402 handshake" }} />
    </DocsLayout>
  );
}
