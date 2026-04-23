import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, Code, Callout, Params, PageFooterNav, Mono } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/handshake")({
  head: () => ({
    meta: [
      { title: "The 402 handshake — Meridian Docs" },
      { name: "description", content: "How Meridian unifies access and payment into a single HTTP round-trip with the x402-inspired 402 Payment Required handshake." },
      { property: "og:title", content: "The 402 handshake — Meridian Docs" },
      { property: "og:description", content: "Access and payment in one request: the x402-inspired protocol handshake powering Meridian." },
    ],
  }),
  component: HandshakePage,
});

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "lifecycle", label: "Request lifecycle" },
  { id: "headers", label: "Response headers" },
  { id: "intent", label: "Payment intent" },
  { id: "verification", label: "Verification & retry" },
  { id: "security", label: "Security model" },
];

function HandshakePage() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Protocol"
        title="The 402 handshake"
        intro="Meridian collapses entitlement, metering, and settlement into a single HTTP exchange. This page describes the protocol-level handshake that makes that possible."
      />

      <DocSection id="overview" title="Overview">
        <p>
          When a caller requests a Meridian-protected resource without a valid payment, the server responds with <Mono>HTTP 402 Payment Required</Mono>. The response carries the price, scope, settlement chain, and a short-lived nonce. The client signs a payment intent and retries; the server verifies the intent onchain and returns the resource with a receipt.
        </p>
        <Callout>
          The handshake is stateless on the server. Every quote is bound to a nonce and TTL, and every receipt is independently verifiable on Ethereum.
        </Callout>
      </DocSection>

      <DocSection id="lifecycle" title="Request lifecycle">
        <Code lang="http" code={`1. → POST /v1/infer
2. ← 402 Payment Required  (price, scope, nonce, ttl)
3. → POST /v1/infer
     X-Meridian-Intent: 0xeip712-signed-intent...
4. ← 200 OK
     X-Meridian-Receipt: 0x9f4a…2e1c`} />
        <p>The full round-trip is typically under <strong>1.2 seconds</strong>, including settlement on supported L2s.</p>
      </DocSection>

      <DocSection id="headers" title="Response headers">
        <Params rows={[
          ["x-meridian-price", "string", "Quoted price as 'amount asset', e.g. '0.0021 USDC'."],
          ["x-meridian-scope", "string", "Capability namespace (e.g. inference.gpt)."],
          ["x-meridian-settle", "string", "Settlement target chain (ethereum, base, optimism, …)."],
          ["x-meridian-ttl", "number", "Validity window for the quote, in seconds."],
          ["x-meridian-nonce", "hex", "Single-use nonce binding the quote to this request."],
        ]} />
      </DocSection>

      <DocSection id="intent" title="Payment intent">
        <p>The client signs an EIP-712 typed-data payload binding the nonce, scope, and price. The intent is opaque to the application layer.</p>
        <Code lang="json" code={`{
  "domain":   { "name": "Meridian", "chainId": 1 },
  "scope":    "inference.gpt",
  "amount":   "2100",
  "asset":    "USDC",
  "nonce":    "0x9f4a…2e1c",
  "expires":  1727384981
}`} />
      </DocSection>

      <DocSection id="verification" title="Verification & retry">
        <p>The server verifies the intent's signature, nonce uniqueness, and onchain settlement before the handler runs. Failed verification returns <Mono>422 Unprocessable</Mono> with a typed error code; expired quotes return <Mono>409 Conflict</Mono>.</p>
        <Code lang="ts" code={`// SDK clients retry transparently on 402 and 409.
const res = await client.fetch("/v1/infer", { method: "POST" });`} />
      </DocSection>

      <DocSection id="security" title="Security model">
        <p>The handshake is designed under three assumptions:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>No replay:</strong> nonces are single-use and bound to a specific resource and quote.</li>
          <li><strong>No overpay:</strong> the signed amount is exact; intents cannot be silently reused for higher-value calls.</li>
          <li><strong>No silent settlement:</strong> every successful response carries a receipt the caller can verify independently.</li>
        </ul>
      </DocSection>

      <PageFooterNav prev={{ to: "/docs", label: "Introduction" }} next={{ to: "/docs/serve", label: "serve()" }} />
    </DocsLayout>
  );
}
