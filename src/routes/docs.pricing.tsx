import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, Code, Params, PageFooterNav, Callout, Mono } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing functions — Astro Docs" },
      { name: "description", content: "Programmable, per-request pricing for Astro endpoints. Static prices, request-derived prices, tiered pricing, outcome-based pricing, and the Money type." },
      { property: "og:title", content: "Pricing functions — Astro Docs" },
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
  { id: "subscriptions", label: "Subscriptions & credits" },
  { id: "discounts", label: "Discounts & promotions" },
  { id: "money", label: "Money type" },
  { id: "rules", label: "Rules & guarantees" },
  { id: "patterns", label: "Patterns" },
];

function PricingPage() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Protocol"
        title="Pricing functions"
        intro="Astro prices every request individually. A price can be a constant, a pure function of the request, or a function of upstream signals — evaluated at quote time and locked for the TTL. This page covers every pricing pattern, the Money type, and the rules that keep pricing deterministic and safe."
      />

      <DocSection id="model" title="Pricing model">
        <p>
          When a caller hits a protected resource, Astro invokes the price function with a normalized view of the request. The result becomes the quote — bound to a nonce, returned in the 402 response, and verified at settlement. The function runs in your server's process, has access to your code's lexical scope, and is free to use any pure logic you want.
        </p>
        <p>
          The mental model: <strong>pricing is part of your application</strong>, not a configuration in a billing dashboard. You can version it with your code, test it with your test suite, and reason about it with the same tools you use for any other request handler.
        </p>
        <Callout>
          Price functions must be <strong>pure and deterministic</strong> for a given input. Side effects belong inside the handler, after payment is verified.
        </Callout>
      </DocSection>

      <DocSection id="static" title="Static price">
        <Code lang="ts" code={`price: "0.001 USDC"`} />
        <p>Use static pricing for flat-rate endpoints — small webhooks, status checks, lookups, fixed-cost actions. The string form is parsed once at startup; subsequent calls have effectively zero pricing overhead.</p>
        <p>Static prices are also useful as a fallback during a price-function refactor: ship the constant, verify the receipts look right, then swap in the dynamic version.</p>
      </DocSection>

      <DocSection id="derived" title="Request-derived">
        <p>The price function receives a typed snapshot of the request — body shape, headers, and declared estimates (tokens, bytes, duration). The snapshot is constructed by Astro; the original request body is not yet consumed when the price function runs, so subsequent <Mono>req.json()</Mono> in the handler still works.</p>
        <Code lang="ts" code={`price: ({ tokens, model, headers }) => {
  const base = model === "gpt-large" ? 0.002 : 0.0005;
  const region = headers["x-region"] === "eu" ? 1.1 : 1.0;
  return (base + tokens * 0.000004) * region;
}`} />
        <p>Any field you add to the price function's destructuring is type-checked against your endpoint's declared input schema. Schema integration is automatic when you use Zod, Valibot, or ArkType for request validation.</p>
      </DocSection>

      <DocSection id="tiered" title="Tiered pricing">
        <Code lang="ts" code={`price: ({ bytes }) => {
  if (bytes < 1024)        return 0.0001;   // < 1 KB
  if (bytes < 1024 * 100)  return 0.001;    // < 100 KB
  if (bytes < 1024 * 1024) return 0.01;     // < 1 MB
  return 0.1;                                // ≥ 1 MB
}`} />
        <p>Tiered pricing is the natural pattern for resources where cost is dominated by a single resource dimension (payload size, response time, result count). Because the function is regular code, you can express any tier shape: linear-then-flat, log-scale, capped, with floors, with ceilings.</p>
      </DocSection>

      <DocSection id="outcome" title="Outcome-based">
        <p>For two-phase calls (estimate → confirm), use the <Mono>quote</Mono> + <Mono>commit</Mono> pattern to settle the final amount after the handler runs. The quote acts as a hard ceiling; the commit can settle any amount equal to or less than the quote, with the remainder atomically refunded.</p>
        <Code lang="ts" code={`price: {
  quote:  ({ tokens }) => tokens * 0.000004,    // upper bound from declared estimate
  commit: (ctx, { tokensActual }) =>
    tokensActual * 0.000004,                    // exact, from handler result
}`} />
        <p>This is the right pattern for streaming inference, search with variable result counts, and any workload where the meaningful cost driver is only known after execution. The caller never pays more than they signed for; you never undercharge for actual work.</p>
        <Callout tone="muted">
          The commit function runs after your handler and has access to <Mono>ctx.handlerResult</Mono>. If commit throws, Astro falls back to the quoted amount — your endpoint never silently fails to settle.
        </Callout>
      </DocSection>

      <DocSection id="subscriptions" title="Subscriptions & credits">
        <p>
          Astro is a per-call protocol, but subscription-style pricing is straightforward to layer on top. The recommended pattern: deploy a "credit" endpoint that accepts a one-time payment and issues a signed credit token; check the token in your price function and return 0 when it's valid.
        </p>
        <Code lang="ts" code={`price: (req) => {
  const credit = parseCredit(req.headers["x-credit"]);
  if (credit && credit.remaining > 0) {
    decrementCredit(credit);
    return 0;             // free under credit
  }
  return defaultPrice(req);
}`} />
        <p>Because credits are just signed data, they can be issued by you, by a partner, by a marketplace, or by an offline batch process. The protocol doesn't care where they came from — only that the price function returns 0.</p>
      </DocSection>

      <DocSection id="discounts" title="Discounts & promotions">
        <p>Promotional pricing is just a branch in the price function. Time-bounded discounts, scope-bounded discounts, payer-bounded discounts, and A/B tests all fit naturally:</p>
        <Code lang="ts" code={`price: (req) => {
  const base = baseFn(req);
  const isLaunchWeek = Date.now() < LAUNCH_END_MS;
  const isReturning  = wasPayer(req.payerHint);
  if (isLaunchWeek)  return base * 0.5;
  if (isReturning)   return base * 0.9;
  return base;
}`} />
        <p>Because every quote is publicly verifiable, callers can audit your discount claims after the fact — a property that's hard to achieve with classic billing systems.</p>
      </DocSection>

      <DocSection id="money" title="Money type">
        <p>Prices accept three shapes:</p>
        <Params rows={[
          ["string", "\"0.0021 USDC\"", "Amount and asset, space-separated."],
          ["number", "0.0021", "Defaults to the asset declared in settle."],
          ["bigint", "2100n", "Integer units of the asset's smallest denomination (e.g. 2100 = 0.0021 USDC at 6 decimals)."],
        ]} />
        <p>Internally, Astro normalizes all three to bigints in the asset's base units before signing. Floating-point arithmetic is never used for the on-the-wire amount, so there is no rounding ambiguity between client and server.</p>
      </DocSection>

      <DocSection id="rules" title="Rules & guarantees">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Determinism:</strong> two evaluations with the same input must produce the same quote. Non-determinism (timestamps, random numbers, network calls) is forbidden inside the price function.</li>
          <li><strong>Bounded latency:</strong> price functions should resolve in under 50ms; longer evaluations are timed out and the request fails with <Mono>503</Mono>.</li>
          <li><strong>No external state:</strong> avoid network or DB calls inside <Mono>price</Mono> — use signed estimates from the request body, in-memory data, or the credit-token pattern instead.</li>
          <li><strong>No mutation:</strong> the price function must not mutate any state visible to other requests. The same input twice must produce the same output, even if called back-to-back.</li>
          <li><strong>Error handling:</strong> a thrown price function returns <Mono>503</Mono> with <Mono>AstroQuoteError</Mono>; the handler is not called.</li>
        </ul>
      </DocSection>

      <DocSection id="patterns" title="Patterns">
        <p>A few patterns worth knowing:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Cost-plus:</strong> price = (provider cost) × markup. Useful when reselling an upstream API.</li>
          <li><strong>Floor + variable:</strong> a fixed minimum plus a per-unit charge. Covers cold-start cost while still scaling with usage.</li>
          <li><strong>Outcome floor:</strong> two-phase pricing where the commit can be 0 if the handler returned no useful result. Aligns provider incentives with caller value.</li>
          <li><strong>Auction:</strong> price as the maximum of a server floor and the caller's declared bid. Useful for marketplace flows.</li>
          <li><strong>Demand surge:</strong> read a recently-cached load metric and apply a multiplier. The cache is read-only inside the price function — refresh it in a background task.</li>
        </ul>
      </DocSection>

      <PageFooterNav prev={{ to: "/docs/serve", label: "serve()" }} next={{ to: "/docs/receipts", label: "Receipts & settlement" }} />
    </DocsLayout>
  );
}
