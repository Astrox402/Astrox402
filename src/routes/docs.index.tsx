import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { Link } from "@tanstack/react-router";
import { PageHeader, DocSection, Code, Callout, PageFooterNav, Mono } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/")({
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
  { id: "what", label: "What Meridian is" },
  { id: "what-not", label: "What Meridian isn't" },
  { id: "who", label: "Who it's for" },
  { id: "design", label: "Design principles" },
  { id: "install", label: "Install the SDK" },
  { id: "quickstart", label: "Five-minute quickstart" },
  { id: "structure", label: "How these docs are organized" },
  { id: "next", label: "Where to next" },
];

function DocsIndex() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Documentation"
        title="Build on the payment-native internet."
        intro="Meridian turns any endpoint, capability, or digital resource into a programmable, monetizable primitive — settled on Ethereum. These docs walk through the protocol, the SDKs, the production patterns, and the operational posture in depth."
      />

      <DocSection id="introduction" title="Introduction">
        <p>
          The internet was built without a payment layer. Every monetizable interaction — every API call, every paywall, every metered service, every agent action — gets bolted on later through a custom stack of API keys, billing systems, entitlement services, and reconciliation pipelines. The result is a tax that every team pays: weeks of engineering for a flow that should be one HTTP request, opaque revenue that customers can't verify, and brittle integration paths that fail silently when something drifts.
        </p>
        <p>
          Meridian replaces that stack with a single protocol-level idea: <strong>access and payment are the same request</strong>. A caller hits a resource, the server returns a price, the caller signs an intent, the server runs the handler. Settlement is onchain. Receipts are public. There is no separate billing system because there is no separate billing.
        </p>
        <Callout>
          You can ship a paid endpoint in <Mono>~9 lines</Mono> of code. No billing stack, no metering pipeline, no entitlement service. The chain is the source of truth.
        </Callout>
      </DocSection>

      <DocSection id="what" title="What Meridian is">
        <p>
          Meridian is an open protocol — built on the long-reserved HTTP <Mono>402 Payment Required</Mono> status code — for declaring, settling, and proving payment for any digital resource. It's also a set of SDKs (TypeScript, Python, Go, Rust) that implement the protocol, and a small set of audited smart contracts on Ethereum, Base, Optimism, and Arbitrum that handle non-custodial settlement.
        </p>
        <p>
          A Meridian endpoint is a normal fetch handler with one extra wrapper. A Meridian client is a normal HTTP client with one extra retry rule. The interesting work — pricing logic, settlement chain selection, scope enforcement, receipt generation — happens in the protocol layer, not in your application code.
        </p>
      </DocSection>

      <DocSection id="what-not" title="What Meridian isn't">
        <p>
          Meridian is <strong>not</strong> a payment processor in the Stripe sense. There is no merchant account, no acquirer, no chargeback system. It is also not a wallet, not a custodian, and not a token. It does not require your customers to "buy crypto" — modern wallets and embedded MPC services handle that transparently.
        </p>
        <p>
          Most importantly, Meridian is not a closed network. The protocol is open, the contracts are public, the SDKs are source-available, and the wire format is documented. If Meridian's hosted services disappeared tomorrow, every endpoint built on Meridian would still work and every receipt would still verify.
        </p>
      </DocSection>

      <DocSection id="who" title="Who it's for">
        <p>Meridian is shaped by — and aimed at — three groups of builders:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>API providers</strong> who want per-call monetization without building a billing stack.</li>
          <li><strong>Agent and AI teams</strong> who need autonomous identities with provable spend boundaries.</li>
          <li><strong>Marketplace and data operators</strong> who need verifiable, auditable settlement across many counterparties.</li>
        </ul>
        <p>
          If you ever wanted to charge two cents for an inference, half a cent for a database lookup, or a tenth of a cent for a webhook delivery — and didn't because the billing infrastructure cost more than the revenue — Meridian was built for you.
        </p>
      </DocSection>

      <DocSection id="design" title="Design principles">
        <p>Five principles shape every protocol decision:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>One request.</strong> Access and payment are inseparable. There is no flow where you authenticate first and pay later.</li>
          <li><strong>Stateless servers.</strong> Quotes are cryptographic offers, not reservations. The server never holds session state.</li>
          <li><strong>Public proofs.</strong> Every paid call produces a receipt anyone can verify. Trust is replaced by math.</li>
          <li><strong>Open by default.</strong> Open spec, open contracts, source-available SDKs. No part of the protocol is gated by Meridian.</li>
          <li><strong>Boring cryptography.</strong> Standard EIP-712, standard ECDSA, standard EVM. No exotic primitives.</li>
        </ul>
      </DocSection>

      <DocSection id="install" title="Install the SDK">
        <Code lang="bash" code={`# npm
npm install @meridian/sdk

# pnpm
pnpm add @meridian/sdk

# bun
bun add @meridian/sdk`} />
        <p>The SDK ships as ESM with full TypeScript types. Server runtimes: Node 20+, Bun, Deno, Cloudflare Workers. First-party SDKs are also available for Python, Go, and Rust — see <Mono>/docs/clients</Mono>.</p>
      </DocSection>

      <DocSection id="quickstart" title="Five-minute quickstart">
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
        <p>For the full walkthrough — installing, defining an endpoint, making a paid call, verifying the receipt — read the <Link to="/docs/quickstart" className="text-accent hover:underline">Quickstart</Link>.</p>
      </DocSection>

      <DocSection id="structure" title="How these docs are organized">
        <p>The documentation is split into four tracks; you can read them in order or jump to whichever matches your current question:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Getting started</strong> — Quickstart, Core concepts, Architecture. Read these first to build the mental model.</li>
          <li><strong>Protocol</strong> — The 402 handshake, <Mono>serve()</Mono>, pricing, receipts, security, errors. The deep technical reference.</li>
          <li><strong>Clients</strong> — SDK clients and agent commerce. How to call Meridian endpoints from apps, services, and autonomous agents.</li>
          <li><strong>Resources</strong> — FAQ and links. Short answers and pointers when you need them.</li>
        </ul>
        <Callout tone="muted">
          Every page is self-contained — you don't need to read the docs front-to-back. Cross-links between pages take you to the deeper context whenever a concept is introduced.
        </Callout>
      </DocSection>

      <DocSection id="next" title="Where to next">
        <p>Pick the entry point that matches what you want to do:</p>
        <ul className="grid sm:grid-cols-2 gap-3 mt-4 not-prose">
          {[
            ["/docs/quickstart", "Quickstart", "Ship your first paid endpoint in five minutes."],
            ["/docs/concepts", "Core concepts", "Resources, scopes, intents, receipts, and policies."],
            ["/docs/architecture", "Architecture", "How the SDK, verifier, contracts, and indexer fit together."],
            ["/docs/handshake", "The 402 handshake", "How access and payment merge into one request."],
            ["/docs/serve", "serve()", "The single primitive that wraps any handler."],
            ["/docs/pricing", "Pricing functions", "Programmable price functions, tiers, and outcomes."],
            ["/docs/receipts", "Receipts & settlement", "Onchain proofs, chains, and reconciliation."],
            ["/docs/security", "Security model", "Threat model, replay protection, key management."],
            ["/docs/errors", "Errors & status codes", "HTTP codes, typed classes, retry semantics."],
            ["/docs/clients", "SDK clients", "Calling Meridian endpoints from apps and agents."],
            ["/docs/agents", "Agent commerce", "Autonomous identities, budgets, and policies."],
            ["/docs/faq", "FAQ", "Short answers to the most common questions."],
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

      <PageFooterNav next={{ to: "/docs/quickstart", label: "Quickstart" }} />
    </DocsLayout>
  );
}
