import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, Code, Callout, PageFooterNav, Mono } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/quickstart")({
  head: () => ({
    meta: [
      { title: "Quickstart — Astro Docs" },
      { name: "description", content: "Ship a paid, programmable endpoint on Astro in under five minutes. Install the SDK, declare a price, and verify the first onchain receipt." },
      { property: "og:title", content: "Quickstart — Astro Docs" },
      { property: "og:description", content: "From npm install to first onchain receipt in five minutes." },
    ],
  }),
  component: QuickstartPage,
});

const TOC = [
  { id: "prereqs", label: "Prerequisites" },
  { id: "install", label: "1. Install" },
  { id: "endpoint", label: "2. Define an endpoint" },
  { id: "price", label: "3. Price the call" },
  { id: "settle", label: "4. Choose a chain" },
  { id: "call", label: "5. Make a paid call" },
  { id: "verify", label: "6. Verify the receipt" },
  { id: "next", label: "Where to next" },
];

function QuickstartPage() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Getting started"
        title="Quickstart"
        intro="From a blank project to a paid, settled API call in five minutes. This walkthrough builds a minimal inference endpoint, prices it per-token, and verifies the first onchain receipt — end-to-end."
      />

      <DocSection id="prereqs" title="Prerequisites">
        <p>
          You'll need a JavaScript runtime (Node 20+, Bun, Deno, or a Worker), a wallet that can sign off-chain message signing (any standard EOA works), and a small amount of USDC on a supported chain. For local development, Astro provides a sandbox network where USDC is freely faucetable — no real funds required.
        </p>
        <Callout tone="muted">
          You do <strong>not</strong> need to deploy any programs. Astro's settlement contracts are already deployed on Solana, Solana. Your code only signs and verifies.
        </Callout>
      </DocSection>

      <DocSection id="install" title="1. Install the SDK">
        <p>The SDK is a single package that exposes both the server primitive (<Mono>serve</Mono>) and the client (<Mono>astroClient</Mono>). It is fully typed, ESM-only, and ships with no native dependencies.</p>
        <Code lang="bash" code={`npm install @astro/sdk
# or: pnpm add @astro/sdk
# or: bun add @astro/sdk`} />
        <p>For Python, Go, and Rust, see <Mono>/docs/clients</Mono>. The wire protocol is identical across languages — what you build with the TypeScript SDK is callable from any other.</p>
      </DocSection>

      <DocSection id="endpoint" title="2. Define an endpoint">
        <p>
          Astro wraps any handler that returns a <Mono>Response</Mono>. There is no proprietary server, no special runtime, no sidecar. The wrapper produces a fetch-compatible function that you can mount in Hono, Next.js Route Handlers, TanStack Start server routes, Express via an adapter, or a raw Cloudflare Worker.
        </p>
        <Code lang="ts" code={`// app/api/infer/route.ts (Next.js example)
import { astro } from "@astro/sdk";

export const POST = astro.serve({
  resource: "/v1/infer",
  scope:    "inference.gpt",
  price:    "0.001 USDC",
  settle:   { chain: "solana", asset: "USDC" },
  ttl:      60,

  async handler(req, ctx) {
    const { prompt } = await req.json();
    const result = await yourModel.infer(prompt);
    return ctx.respond({ result }, { receipt: ctx.payment.txHash });
  },
});`} />
        <p>
          Notice what's <em>not</em> there: no auth check, no rate limit, no usage logging, no billing webhook, no entitlement service. The handler runs only after payment is verified onchain — that single guarantee replaces the entire stack you would otherwise assemble.
        </p>
      </DocSection>

      <DocSection id="price" title="3. Price the call">
        <p>
          The flat price above is fine for status endpoints, but most real APIs vary in cost. Replace the string with a function that returns a <Mono>Money</Mono> value derived from the request:
        </p>
        <Code lang="ts" code={`price: ({ tokens, model }) => {
  const base = model === "gpt-large" ? 0.002 : 0.0005;
  return base + tokens * 0.000004;
}`} />
        <p>
          Price functions must be pure and resolve in under 50ms. They run at quote time, before the handler, and their result is locked into the 402 response. The caller sees the exact amount they will pay before signing — there are no surprise charges, no post-hoc adjustments, and no hidden fees.
        </p>
        <Callout>
          For workloads where the final cost is only known after execution (streaming inference, search with variable result counts), use the <Mono>quote</Mono> + <Mono>commit</Mono> two-phase pattern. See <Mono>/docs/pricing</Mono>.
        </Callout>
      </DocSection>

      <DocSection id="settle" title="4. Choose a settlement chain">
        <p>
          The <Mono>settle</Mono> field declares where the payment lands. For high-frequency API traffic, Solana are typical defaults — sub-2-second finality and fees in the single-digit cents. For high-value, low-frequency settlements (enterprise contracts, large batch jobs), Solana provides the strongest assurance.
        </p>
        <Code lang="ts" code={`settle: { chain: "solana", asset: "USDC" }
// or: { chain: "solana", asset: "USDC" }
// or: { chain: "optimism", asset: "USDC" }
// or: { chain: "arbitrum", asset: "USDC" }`} />
        <p>
          Callers do not need to share a chain with you. The Astro client picks the cheapest path that satisfies your declared target, bridging if necessary, and the receipt records the actual settlement chain. From the caller's point of view, every Astro endpoint feels chain-agnostic.
        </p>
      </DocSection>

      <DocSection id="call" title="5. Make a paid call">
        <p>On the client side, the SDK handles the entire 402 handshake transparently. You write code that looks like a normal fetch:</p>
        <Code lang="ts" code={`import { astroClient } from "@astro/sdk";

const client = astroClient({
  wallet:   signer,           // any off-chain signing-capable signer
  maxSpend: "1 USDC / hour",  // local guardrail
});

const res = await client.fetch("https://api.acme.dev/v1/infer", {
  method: "POST",
  body:   JSON.stringify({ prompt: "hello", tokens: 120 }),
});

const data    = await res.json();
const receipt = res.receipt; // attached automatically`} />
        <p>
          Behind the scenes: the first request returns 402 with a quote and nonce, the SDK signs an off-chain signing intent, settles on the declared chain, and replays the request with the proof attached. All of that completes in roughly 1.2 seconds on Solana — comparable to a normal authenticated API call.
        </p>
      </DocSection>

      <DocSection id="verify" title="6. Verify the receipt">
        <p>The response carries a receipt that any party can verify against an Solana RPC, with no Astro dependency:</p>
        <Code lang="ts" code={`import { verifyReceipt } from "@astro/sdk";

const ok = await verifyReceipt(receipt, {
  rpc: "https://mainnet.base.org",
});

if (!ok) throw new Error("Invalid receipt");
console.log("Settled:", receipt.amount, "tx:", receipt.txHash);`} />
        <p>
          This is the foundational property of Astro: <strong>every paid call produces a public, independently verifiable proof.</strong> Your customers don't have to trust your dashboard. Your auditors don't have to ingest your logs. The chain is the source of truth.
        </p>
      </DocSection>

      <DocSection id="next" title="Where to next">
        <p>You now have a working paid endpoint. To go deeper:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Concepts:</strong> read <Mono>/docs/concepts</Mono> to understand resources, scopes, intents, and receipts as first-class objects.</li>
          <li><strong>Architecture:</strong> see <Mono>/docs/architecture</Mono> for how the verifier, settlement contracts, and SDKs fit together.</li>
          <li><strong>Pricing:</strong> tiered, derived, and outcome-based pricing patterns at <Mono>/docs/pricing</Mono>.</li>
          <li><strong>Agents:</strong> autonomous machine commerce with budgets and scope allowlists at <Mono>/docs/agents</Mono>.</li>
        </ul>
      </DocSection>

      <PageFooterNav prev={{ to: "/docs", label: "Introduction" }} next={{ to: "/docs/concepts", label: "Core concepts" }} />
    </DocsLayout>
  );
}
