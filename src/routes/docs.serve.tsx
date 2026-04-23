import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, Code, Params, PageFooterNav, Mono, Callout } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/serve")({
  head: () => ({
    meta: [
      { title: "serve() — Meridian Docs" },
      { name: "description", content: "The serve() primitive wraps any handler in a payment-aware envelope. Reference for resource, scope, price, settle, ttl, and ctx.payment." },
      { property: "og:title", content: "serve() — Meridian Docs" },
      { property: "og:description", content: "The single primitive that turns any handler into a paid, programmable Meridian endpoint." },
    ],
  }),
  component: ServePage,
});

const TOC = [
  { id: "signature", label: "Signature" },
  { id: "options", label: "Options" },
  { id: "context", label: "Handler context" },
  { id: "respond", label: "ctx.respond" },
  { id: "frameworks", label: "Frameworks" },
  { id: "errors", label: "Errors" },
];

function ServePage() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Protocol"
        title="serve()"
        intro="serve() is the single primitive that wraps any handler in Meridian's payment-aware envelope. It declares the resource, the price, and the settlement target — and only runs your handler after payment is verified."
      />

      <DocSection id="signature" title="Signature">
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

      <DocSection id="options" title="Options">
        <Params rows={[
          ["resource", "string", "Stable identifier for this endpoint."],
          ["scope", "string", "Capability namespace (e.g. inference.gpt)."],
          ["price", "Money | (req) => Money", "Static value or pure function. See pricing."],
          ["settle", "{ chain, asset }", "Target chain and asset. Defaults to ethereum + USDC."],
          ["ttl", "number", "Validity window for the quote, in seconds."],
          ["handler", "(req, ctx) => Response", "Runs only after payment is verified."],
        ]} />
        <Callout tone="muted">
          <Mono>resource</Mono> and <Mono>scope</Mono> are durable identifiers. Treat them like database primary keys — renaming a live resource invalidates outstanding quotes.
        </Callout>
      </DocSection>

      <DocSection id="context" title="Handler context">
        <p>The <Mono>ctx</Mono> argument exposes the verified payment and helpers for shaping the response.</p>
        <Code lang="ts" code={`type Ctx = {
  payment: {
    amount:  string;       // "0.0021 USDC"
    txHash:  \`0x\${string}\`;
    chain:   "ethereum" | "base" | "optimism";
    payer:   \`0x\${string}\`;
  };
  scope:    string;
  respond:  (body: unknown, init?: RespondInit) => Response;
};`} />
      </DocSection>

      <DocSection id="respond" title="ctx.respond">
        <p>Use <Mono>ctx.respond()</Mono> to attach a receipt header to your response. It's a thin wrapper over <Mono>Response</Mono>.</p>
        <Code lang="ts" code={`return ctx.respond(
  { result },
  {
    receipt: ctx.payment.txHash,
    headers: { "cache-control": "no-store" },
    status:  200,
  }
);`} />
      </DocSection>

      <DocSection id="frameworks" title="Frameworks">
        <p><Mono>serve()</Mono> returns a standard fetch handler. Drop it into anything that speaks the Web Fetch API.</p>
        <Code lang="ts" code={`// Hono
app.post("/v1/infer", meridian.serve({ /* ... */ }));

// Next.js Route Handlers
export const POST = meridian.serve({ /* ... */ });

// TanStack Start server route
export const Route = createFileRoute("/api/infer")({
  server: { handlers: { POST: meridian.serve({ /* ... */ }) } },
});`} />
      </DocSection>

      <DocSection id="errors" title="Errors">
        <Params rows={[
          ["MeridianQuoteError", "Price function threw or returned invalid Money."],
          ["MeridianHandlerError", "User handler threw after payment was verified."],
          ["MeridianSettleError", "Settlement check failed onchain."],
        ]} />
        <p>All errors are typed and serialized into a structured response. The caller can act programmatically without parsing strings.</p>
      </DocSection>

      <PageFooterNav prev={{ to: "/docs/handshake", label: "The 402 handshake" }} next={{ to: "/docs/pricing", label: "Pricing functions" }} />
    </DocsLayout>
  );
}
