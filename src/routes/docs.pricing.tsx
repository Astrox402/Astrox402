import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, Code, Params, PageFooterNav, Callout, Mono } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing functions — Meridian Docs" },
      { name: "description", content: "Programmable, per-request pricing for Meridian endpoints. Static prices, request-derived prices, tiered pricing, and outcome-based pricing." },
      { property: "og:title", content: "Pricing functions — Meridian Docs" },
      { property: "og:description", content: "Programmable, per-request pricing — by tokens, payload, model, or outcome." },
    ],
  }),
  component: PricingPage,
});

const TOC = [
  { id: "model", label: "Pricing model" },
  { id: "static", label: "Static price" },
  { id: "derived", label: "Request-derived" },
  { id: "tiered", label: "Tiered pricing" },
  { id: "outcome", label: "Outcome-based" },
  { id: "money", label: "Money type" },
  { id: "rules", label: "Rules & guarantees" },
];

function PricingPage() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Protocol"
        title="Pricing functions"
        intro="Meridian prices every request individually. A price can be a constant, a pure function of the request, or a function of upstream signals — evaluated at quote time and locked for the TTL."
      />

      <DocSection id="model" title="Pricing model">
        <p>
          When a caller hits a protected resource, Meridian invokes the price function with a normalized view of the request. The result becomes the quote — bound to a nonce, returned in the 402 response, and verified at settlement.
        </p>
        <Callout>
          Price functions must be <strong>pure and deterministic</strong> for a given input. Side effects belong inside the handler, after payment is verified.
        </Callout>
      </DocSection>

      <DocSection id="static" title="Static price">
        <Code lang="ts" code={`price: "0.001 USDC"`} />
        <p>Use static pricing for flat-rate endpoints — small webhooks, status checks, lookups.</p>
      </DocSection>

      <DocSection id="derived" title="Request-derived">
        <p>The price function receives a typed snapshot of the request — body shape, headers, and declared estimates (tokens, bytes, duration).</p>
        <Code lang="ts" code={`price: ({ tokens, model }) => {
  const base = model === "gpt-large" ? 0.002 : 0.0005;
  return base + tokens * 0.000004;
}`} />
      </DocSection>

      <DocSection id="tiered" title="Tiered pricing">
        <Code lang="ts" code={`price: ({ bytes }) => {
  if (bytes < 1024)        return 0.0001;
  if (bytes < 1024 * 100)  return 0.001;
  return 0.01;
}`} />
      </DocSection>

      <DocSection id="outcome" title="Outcome-based">
        <p>For two-phase calls (estimate → confirm), use <Mono>price.commit</Mono> to settle the final amount after the handler runs.</p>
        <Code lang="ts" code={`price: {
  quote:  ({ tokens }) => tokens * 0.000004,    // upper bound
  commit: (ctx, { tokensActual }) =>
    tokensActual * 0.000004,                    // exact
}`} />
        <p>The caller is charged at most the quoted amount; the difference is refunded as part of settlement.</p>
      </DocSection>

      <DocSection id="money" title="Money type">
        <p>Prices accept three shapes:</p>
        <Params rows={[
          ["string", "\"0.0021 USDC\"", "Amount and asset, space-separated."],
          ["number", "0.0021", "Defaults to the asset declared in settle."],
          ["bigint", "2100n", "Integer units of the asset's smallest denomination."],
        ]} />
      </DocSection>

      <DocSection id="rules" title="Rules & guarantees">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Determinism:</strong> two evaluations with the same input must produce the same quote.</li>
          <li><strong>Bounded latency:</strong> price functions should resolve in under 50ms; longer evaluations are timed out.</li>
          <li><strong>No external state:</strong> avoid network or DB calls inside <Mono>price</Mono> — use signed estimates from the request body instead.</li>
        </ul>
      </DocSection>

      <PageFooterNav prev={{ to: "/docs/serve", label: "serve()" }} next={{ to: "/docs/receipts", label: "Receipts & settlement" }} />
    </DocsLayout>
  );
}
