import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, Code, Callout, PageFooterNav, Mono, Params } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/concepts")({
  head: () => ({
    meta: [
      { title: "Core concepts — Astro Docs" },
      { name: "description", content: "Resources, scopes, quotes, intents, receipts, and policies — the durable objects that make up the Astro protocol." },
      { property: "og:title", content: "Core concepts — Astro Docs" },
      { property: "og:description", content: "The mental model behind Astro: resources, scopes, intents, and receipts as first-class objects." },
    ],
  }),
  component: ConceptsPage,
});

const TOC = [
  { id: "mental-model", label: "Mental model" },
  { id: "resource", label: "Resource" },
  { id: "scope", label: "Scope" },
  { id: "quote", label: "Quote" },
  { id: "intent", label: "Intent" },
  { id: "receipt", label: "Receipt" },
  { id: "policy", label: "Policy" },
  { id: "lifecycle", label: "Object lifecycle" },
  { id: "comparison", label: "Mental anchors" },
];

function ConceptsPage() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Foundations"
        title="Core concepts"
        intro="Astro is built on a small set of durable objects: resources, scopes, quotes, intents, receipts, and policies. Once these click, the rest of the protocol — handshake, settlement, agent commerce — is just orchestration on top."
      />

      <DocSection id="mental-model" title="Mental model">
        <p>
          The classic web has two layers: a <strong>request</strong> (what you want) and a <strong>response</strong> (what you got). Authentication, billing, metering, and rate limiting are bolted on as separate systems, each with its own state, its own database, and its own failure modes. Astro collapses those four systems into the request itself by introducing four protocol-level objects.
        </p>
        <Callout>
          If you remember nothing else: a <strong>quote</strong> is a server's offer, an <strong>intent</strong> is a client's signature, a <strong>receipt</strong> is the public record, and a <strong>scope</strong> is the namespace they all live in.
        </Callout>
      </DocSection>

      <DocSection id="resource" title="Resource">
        <p>
          A resource is the addressable unit of value. In practice, it's a URL plus a verb — for example, <Mono>POST /v1/infer</Mono>. Resources are durable identifiers: once a resource is live, renaming it invalidates outstanding quotes and breaks caller integrations. Treat them like primary keys.
        </p>
        <p>
          A single deployment can expose hundreds of resources, each with its own price, scope, and settlement target. Astro does not impose any structure on resource names — you can mirror REST, RPC, GraphQL operation names, or anything else. The only requirement is stability.
        </p>
      </DocSection>

      <DocSection id="scope" title="Scope">
        <p>
          A scope is a capability namespace. Where a resource is a specific endpoint, a scope is a category of behavior — <Mono>inference.gpt</Mono>, <Mono>search.web</Mono>, <Mono>data.market.l2</Mono>. Scopes use dot-separated hierarchy and support glob matching in client allowlists, which makes them the natural unit for budgets and policy.
        </p>
        <Code lang="ts" code={`// A client allowlist that authorizes an entire family of endpoints
allow: ["inference.*", "search.web", "data.market.*"]

// But denies the expensive subscope
deny:  ["inference.fine-tune"]`} />
        <p>
          Scopes are also how Astro enforces server-side spend caps and how the settlement layer aggregates revenue for reporting. Designing them well is one of the highest-leverage decisions when modeling a Astro-native API.
        </p>
      </DocSection>

      <DocSection id="quote" title="Quote">
        <p>
          A quote is the server's offer for a specific request: an exact amount, an asset, a settlement chain, and a single-use nonce — all bound to a TTL. Quotes are returned in the 402 response and live entirely in headers. They carry no state on the server beyond the nonce reservation.
        </p>
        <Params rows={[
          ["amount", "string", "Exact price; not a range, not an estimate."],
          ["asset", "string", "Settlement asset — typically USDC."],
          ["chain", "string", "Settlement chain target."],
          ["nonce", "hex", "Single-use, bound to this resource and quote."],
          ["expires", "unix", "Hard TTL; expired quotes return 409."],
        ]} />
        <p>
          Quotes are <strong>not</strong> reservations of inventory. They are deterministic offers that the server commits to honor if presented with a valid intent before expiry. This makes the server stateless from the caller's perspective and lets Astro scale horizontally without coordination.
        </p>
      </DocSection>

      <DocSection id="intent" title="Intent">
        <p>
          An intent is the client's signed acceptance of a quote. It's an EIP-712 typed-data structure that binds the payer's wallet to the exact resource, scope, amount, and nonce — and nothing else. Intents are opaque to the application layer; the client SDK signs them, the server verifies them, your handler never sees them.
        </p>
        <Code lang="json" code={`{
  "domain":  { "name": "Astro", "chainId": 8453 },
  "scope":   "inference.gpt",
  "amount":  "2100",
  "asset":   "USDC",
  "nonce":   "0x9f4a…2e1c",
  "expires": 1727384981
}`} />
        <p>
          Because intents are EIP-712, every wallet — hardware, mobile, embedded, or backend — can sign them with no Astro-specific tooling. The signature alone proves authorization; replay is prevented by the nonce; overpay is prevented by the exact amount.
        </p>
      </DocSection>

      <DocSection id="receipt" title="Receipt">
        <p>
          A receipt is the public record of one settled call. It binds the resource, the scope, the amount, the payer, the payee, and the settlement transaction into a single object that is independently verifiable from any Ethereum RPC. Receipts are what make Astro auditable without sharing private logs.
        </p>
        <p>
          Receipts are returned inline (in the response body or a header), streamed via webhook, and queryable via the reconciliation API. They are also publicly indexable, which means a customer can verify your revenue claims, a partner can verify a referral payout, and an auditor can reconstruct your books — all without you exposing internal data.
        </p>
      </DocSection>

      <DocSection id="policy" title="Policy">
        <p>
          A policy is a rule that gates intent signing on the client side. Policies live entirely in the SDK; they never touch the network. The simplest policy is a spend cap (<Mono>maxSpend: "1 USDC / hour"</Mono>); more sophisticated policies include scope allowlists, per-call ceilings, time-of-day windows, and human-in-the-loop approvals.
        </p>
        <Callout tone="muted">
          Policies are local-first guardrails. They prevent over-spend before a signature is ever created. Server-side, the protocol still enforces the exact amount per intent — policies are belt-and-suspenders for the caller, not the server's trust model.
        </Callout>
      </DocSection>

      <DocSection id="lifecycle" title="Object lifecycle">
        <p>
          The objects flow in a strict order on each call:
        </p>
        <ol className="list-decimal pl-5 space-y-2">
          <li><strong>Request</strong> arrives, hits a <strong>resource</strong> with an attached <strong>scope</strong>.</li>
          <li>The price function evaluates and produces a <strong>quote</strong>.</li>
          <li>The server returns 402 with the quote in headers.</li>
          <li>The client checks <strong>policy</strong>, signs an <strong>intent</strong>, retries.</li>
          <li>The server verifies the intent, settles onchain, runs the handler.</li>
          <li>The response carries a <strong>receipt</strong>.</li>
        </ol>
        <p>
          Every step is idempotent; every object is independently inspectable. There are no implicit sessions, no cookies, no server-side state to drift out of sync.
        </p>
      </DocSection>

      <DocSection id="comparison" title="Mental anchors">
        <p>If it helps, here's how Astro's objects map to systems you may already know:</p>
        <Params rows={[
          ["Resource", "REST endpoint", "Stable URL + verb."],
          ["Scope", "OAuth scope", "Namespace for capabilities."],
          ["Quote", "Stripe PaymentIntent", "Server-issued offer with TTL."],
          ["Intent", "EIP-712 signature", "Client's signed acceptance."],
          ["Receipt", "Stripe Charge", "Public, verifiable settlement record."],
          ["Policy", "Spend rule", "Local guardrail before signing."],
        ]} />
        <p>The analogies are loose — Astro's objects are protocol primitives, not vendor abstractions — but they're useful as a starting point.</p>
      </DocSection>

      <PageFooterNav prev={{ to: "/docs/quickstart", label: "Quickstart" }} next={{ to: "/docs/architecture", label: "Architecture" }} />
    </DocsLayout>
  );
}
