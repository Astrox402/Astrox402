import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, Code, Params, PageFooterNav, Mono, Callout } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/serve")({
  head: () => ({
    meta: [
      { title: "serve() — Astro Docs" },
      { name: "description", content: "The serve() primitive wraps any handler in a payment-aware envelope. Reference for resource, scope, price, settle, ttl, ctx.payment, batching, and refunds." },
      { property: "og:title", content: "serve() — Astro Docs" },
      { property: "og:description", content: "The single primitive that turns any handler into a paid, programmable Astro endpoint." },
    ],
  }),
  component: ServePage,
});

const TOC = [
  { id: "signature", label: "Signature" },
  { id: "options", label: "Options" },
  { id: "context", label: "Handler context" },
  { id: "respond", label: "ctx.respond" },
  { id: "refunds", label: "Refunds" },
  { id: "batching", label: "Batched settlement" },
  { id: "frameworks", label: "Frameworks" },
  { id: "lifecycle", label: "Internal lifecycle" },
  { id: "errors", label: "Errors" },
];

function ServePage() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Protocol"
        title="serve()"
        intro="serve() is the single primitive that wraps any handler in Astro's payment-aware envelope. It declares the resource, the price, and the settlement target — and only runs your handler after payment is verified onchain. This page is the complete API reference."
      />

      <DocSection id="signature" title="Signature">
        <Code lang="ts" code={`import { astro } from "@astro/sdk";

export const POST = astro.serve({
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
        <p>The return value is a standard Web Fetch <Mono>(Request) =&gt; Response</Mono> handler. It is not framework-specific; you can mount it in anything that speaks fetch.</p>
      </DocSection>

      <DocSection id="options" title="Options">
        <Params rows={[
          ["resource", "string", "Stable identifier for this endpoint. Treat like a primary key."],
          ["scope", "string", "Capability namespace (e.g. inference.gpt)."],
          ["price", "Money | (req) => Money | { quote, commit }", "Static, derived, or two-phase price. See pricing."],
          ["settle", "{ chain, asset }", "Target chain and asset. Defaults to ethereum + USDC."],
          ["ttl", "number", "Validity window for the quote, in seconds. Defaults to 60."],
          ["handler", "(req, ctx) => Response", "Runs only after payment is verified."],
          ["batch", "BatchConfig", "Optional batched settlement config. See batching below."],
          ["refundOn", "(error) => boolean", "Predicate that decides whether a thrown error triggers a refund. Default: any error."],
          ["allowFree", "boolean", "If true, a price of 0 short-circuits the handshake. Default: true."],
        ]} />
        <Callout tone="muted">
          <Mono>resource</Mono> and <Mono>scope</Mono> are durable identifiers. Treat them like database primary keys — renaming a live resource invalidates outstanding quotes and breaks caller integrations.
        </Callout>
      </DocSection>

      <DocSection id="context" title="Handler context">
        <p>The <Mono>ctx</Mono> argument exposes the verified payment, the resolved scope, helpers for shaping the response, and an optional refund hook. Everything in <Mono>ctx</Mono> is derived from verified onchain state — there is no untrusted caller-supplied data on this surface.</p>
        <Code lang="ts" code={`type Ctx = {
  payment: {
    amount:  string;       // "0.0021 USDC"
    txHash:  \`0x\${string}\`;
    chain:   "ethereum" | "base" | "optimism" | "arbitrum";
    payer:   \`0x\${string}\`;
    payee:   \`0x\${string}\`;
    settledAt: number;     // unix seconds
  };
  scope:    string;
  resource: string;
  traceId:  string;
  respond:  (body: unknown, init?: RespondInit) => Response;
  refund:   (reason: string) => Promise<RefundReceipt>;
};`} />
        <p>The <Mono>traceId</Mono> is propagated to your logging context so you can join handler logs with caller-visible errors and onchain settlement events.</p>
      </DocSection>

      <DocSection id="respond" title="ctx.respond">
        <p>Use <Mono>ctx.respond()</Mono> to attach a receipt header to your response. It's a thin wrapper over <Mono>Response</Mono> that handles content negotiation and ensures the receipt is always present.</p>
        <Code lang="ts" code={`return ctx.respond(
  { result },
  {
    receipt: ctx.payment.txHash,
    headers: { "cache-control": "no-store" },
    status:  200,
  }
);`} />
        <p>For streaming responses, <Mono>ctx.respond()</Mono> accepts a <Mono>ReadableStream</Mono> body and emits the receipt header at stream start. Trailers are not used because not all intermediaries forward them.</p>
      </DocSection>

      <DocSection id="refunds" title="Refunds">
        <p>If your handler throws after payment was verified, Astro automatically issues an onchain refund and surfaces the original error to the caller as a <Mono>AstroHandlerError</Mono>. You can also issue refunds explicitly for partial-failure or quality-of-service reasons:</p>
        <Code lang="ts" code={`async handler(req, ctx) {
  const result = await model.infer(await req.json());
  if (result.confidence < 0.5) {
    await ctx.refund("low_confidence");
    return ctx.respond({ result, refunded: true });
  }
  return ctx.respond({ result }, { receipt: ctx.payment.txHash });
}`} />
        <p>Refunds settle in the same atomic chain transaction as the original payment was paid against — there is no waiting period and no manual reconciliation.</p>
      </DocSection>

      <DocSection id="batching" title="Batched settlement">
        <p>For high-volume endpoints (thousands of calls per second), per-call settlement on Ethereum mainnet is wasteful. Astro supports batched settlement that aggregates many intents into a single onchain transaction:</p>
        <Code lang="ts" code={`batch: {
  windowMs:   2000,        // flush at most every 2s
  maxIntents: 500,         // or when 500 intents accumulate
  fallback:   "per-call",  // if batching fails, fall back atomically
}`} />
        <p>Batched settlement preserves the protocol's guarantees — each intent is still individually verified, each receipt is still individually queryable — but it amortizes the chain transaction cost across the batch. Typical savings are 80-95% on mainnet for high-frequency resources.</p>
      </DocSection>

      <DocSection id="frameworks" title="Frameworks">
        <p><Mono>serve()</Mono> returns a standard fetch handler. Drop it into anything that speaks the Web Fetch API.</p>
        <Code lang="ts" code={`// Hono
app.post("/v1/infer", astro.serve({ /* ... */ }));

// Next.js Route Handlers
export const POST = astro.serve({ /* ... */ });

// TanStack Start server route
export const Route = createFileRoute("/api/infer")({
  server: { handlers: { POST: astro.serve({ /* ... */ }) } },
});

// Cloudflare Workers
export default { fetch: astro.serve({ /* ... */ }) };

// Deno
Deno.serve(astro.serve({ /* ... */ }));`} />
        <p>For Express and other Node-only frameworks that don't speak fetch natively, the SDK provides an adapter (<Mono>astro.express()</Mono>) that converts between the two interfaces.</p>
      </DocSection>

      <DocSection id="lifecycle" title="Internal lifecycle">
        <p>For each request, <Mono>serve()</Mono> executes the following steps in order:</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li><strong>Parse intent header.</strong> If absent, run the price function and return 402 with the quote.</li>
          <li><strong>Verify signature.</strong> Recover the signer; reject on mismatch with <Mono>422</Mono>.</li>
          <li><strong>Verify quote binding.</strong> Recompute the price; check resource, scope, amount, nonce, expiry.</li>
          <li><strong>Verify settlement.</strong> Wait for the chain transaction to confirm (or accept a signed pre-confirmation in optimistic mode).</li>
          <li><strong>Build context.</strong> Construct <Mono>ctx</Mono> from the verified payment.</li>
          <li><strong>Run handler.</strong> Catch any error; trigger refund if <Mono>refundOn</Mono> matches.</li>
          <li><strong>Attach receipt.</strong> Inject <Mono>X-Astro-Receipt</Mono> into the response.</li>
        </ol>
      </DocSection>

      <DocSection id="errors" title="Errors">
        <Params rows={[
          ["AstroQuoteError", "Price function threw or returned invalid Money."],
          ["AstroHandlerError", "User handler threw after payment was verified. Refund triggered automatically."],
          ["AstroSettleError", "Settlement check failed onchain (revert, timeout, RPC failure)."],
          ["AstroIntentError", "Intent signature invalid or doesn't match the quote."],
        ]} />
        <p>All errors are typed and serialized into a structured response. The caller can act programmatically without parsing strings. See <Mono>/docs/errors</Mono> for the full reference.</p>
      </DocSection>

      <PageFooterNav prev={{ to: "/docs/handshake", label: "The 402 handshake" }} next={{ to: "/docs/pricing", label: "Pricing functions" }} />
    </DocsLayout>
  );
}
