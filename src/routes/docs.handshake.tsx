import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, Code, Callout, Params, PageFooterNav, Mono } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/handshake")({
  head: () => ({
    meta: [
      { title: "The 402 handshake — Astro Docs" },
      { name: "description", content: "How Astro unifies access and payment into a single HTTP round-trip with the x402-inspired 402 Payment Required handshake on Solana." },
      { property: "og:title", content: "The 402 handshake — Astro Docs" },
      { property: "og:description", content: "Access and payment in one request: the x402-inspired protocol handshake powering Astro on Solana." },
    ],
  }),
  component: HandshakePage,
});

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "history", label: "Why 402" },
  { id: "lifecycle", label: "Request lifecycle" },
  { id: "headers", label: "Response headers" },
  { id: "intent", label: "Payment intent" },
  { id: "verification", label: "Verification & retry" },
  { id: "edge", label: "Edge cases" },
  { id: "security", label: "Security model" },
  { id: "wire", label: "Wire-level example" },
];

function HandshakePage() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Protocol"
        title="The 402 handshake"
        intro="Astro collapses entitlement, metering, and settlement into a single HTTP exchange. This page is the deep specification of the x402-inspired handshake — the headers, the intent format, the verification path, and the failure modes."
      />

      <DocSection id="overview" title="Overview">
        <p>
          When a caller requests an Astro-protected resource without a valid payment, the server responds with <Mono>HTTP 402 Payment Required</Mono>. The response carries the price, scope, settlement target, and a short-lived nonce. The client signs a payment intent and retries; the server verifies the intent on Solana and returns the resource with a receipt. The whole loop typically completes in under one second on Solana.
        </p>
        <Callout>
          The handshake is stateless on the server. Every quote is bound to a nonce and TTL, and every receipt is independently verifiable on Solana. There is no session, no cookie, and no shared mutable state.
        </Callout>
      </DocSection>

      <DocSection id="history" title="Why 402">
        <p>
          The HTTP/1.1 specification reserved <Mono>402 Payment Required</Mono> in 1997 with a single sentence: "This code is reserved for future use." For the next quarter-century, no standard ever filled it in. Various proposals — micropayments, lightning integrations, custom headers — came and went, but none combined a stable wire format with non-custodial settlement and a deployable runtime.
        </p>
        <p>
          Astro operationalizes 402 by treating it as the canonical signal for "this resource exists, but you need to pay to access it." The semantics map cleanly: the response carries the price (like 401 carries the auth challenge), the client constructs a credential (the intent), and the request is retried. Existing intermediaries — proxies, gateways, edge caches — pass 402 through correctly because the spec has always reserved it.
        </p>
      </DocSection>

      <DocSection id="lifecycle" title="Request lifecycle">
        <Code lang="http" code={`1. → POST /v1/infer
     Content-Type: application/json
     { "prompt": "hello", "tokens": 120 }

2. ← 402 Payment Required
     X-Astro-Price:  0.0021 USDC
     X-Astro-Scope:  inference.gpt
     X-Astro-Settle: solana
     X-Astro-TTL:    60
     X-Astro-Nonce:  9f4a…2e1c

3. → POST /v1/infer
     X-Astro-Intent: <ed25519-signed-intent>
     Content-Type: application/json
     { "prompt": "hello", "tokens": 120 }

4. ← 200 OK
     X-Astro-Receipt: <receipt-bytes>
     Content-Type: application/json
     { "result": "..." }`} />
        <p>The full round-trip is typically under <strong>one second</strong> on Solana. The settlement transaction is broadcast in parallel with step 3, so verification is already in-flight by the time the server begins parsing the intent.</p>
      </DocSection>

      <DocSection id="headers" title="Response headers">
        <p>The 402 response is fully described by its headers. The body is empty by default, but providers may include a structured JSON body for clients that prefer it (the SDK uses headers exclusively).</p>
        <Params rows={[
          ["x-astro-price", "string", "Quoted price as 'amount asset', e.g. '0.0021 USDC'."],
          ["x-astro-scope", "string", "Capability namespace (e.g. inference.gpt)."],
          ["x-astro-settle", "string", "Settlement target: 'solana' or 'solana-devnet'."],
          ["x-astro-ttl", "number", "Validity window for the quote, in seconds."],
          ["x-astro-nonce", "hex", "Single-use nonce binding the quote to this request."],
          ["x-astro-domain", "string", "Domain hash for signature binding."],
          ["x-astro-resource", "string", "Echo of the resource identifier; used for client-side scope routing."],
        ]} />
        <p>All headers are case-insensitive per HTTP semantics. The SDK reads them with normalization; if you implement your own client, do the same.</p>
      </DocSection>

      <DocSection id="intent" title="Payment intent">
        <p>The client signs a structured payload binding the nonce, scope, and price using Ed25519. The intent is opaque to the application layer — your handler never reads it directly; the verifier produces a structured <Mono>ctx.payment</Mono> after validation.</p>
        <Code lang="json" code={`{
  "domain":  { "name": "Astro", "version": "1", "cluster": "mainnet-beta" },
  "scope":   "inference.gpt",
  "amount":  "2100",
  "asset":   "USDC",
  "nonce":   "9f4a…2e1c",
  "expires": 1727384981
}`} />
        <p>
          Because intents are Ed25519-signed off-chain messages, every Solana wallet — hardware, mobile, embedded, or backend MPC — can sign them with no Astro-specific tooling. The signature alone proves authorization; replay is prevented by the nonce; overpay is prevented by the exact amount.
        </p>
      </DocSection>

      <DocSection id="verification" title="Verification & retry">
        <p>The server verifies the intent in three steps before any handler code runs:</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li><strong>Signature.</strong> Verify the Ed25519 signature against the message hash; check it matches the declared payer's public key.</li>
          <li><strong>Quote binding.</strong> Confirm the intent's resource, scope, amount, and nonce match the original quote and that the quote hasn't expired.</li>
          <li><strong>Onchain settlement.</strong> Confirm the settlement transaction is included on Solana. The verifier supports both pessimistic (wait for finality) and optimistic (proceed on pre-confirmation) modes.</li>
        </ol>
        <Code lang="ts" code={`// SDK clients retry transparently on 402 and 409.
const res = await client.fetch("/v1/infer", { method: "POST" });`} />
        <p>Failed verification returns <Mono>422 Unprocessable</Mono> with a typed error code; expired quotes return <Mono>409 Conflict</Mono> and the client SDK fetches a fresh quote and retries once. See <Mono>/docs/errors</Mono> for the complete status code reference.</p>
      </DocSection>

      <DocSection id="edge" title="Edge cases">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Free tiers:</strong> a price function that returns <Mono>0</Mono> short-circuits the handshake — the server skips 402 entirely and runs the handler immediately. The receipt is still emitted, with amount 0, for auditability.</li>
          <li><strong>Quote drift:</strong> if the request body changes between the 402 and the retry, the price function re-evaluates. If the new quote differs, the server rejects the intent with <Mono>422</Mono> and a fresh quote.</li>
          <li><strong>Multi-step calls:</strong> for streaming or long-running handlers, use the <Mono>quote</Mono> + <Mono>commit</Mono> two-phase pricing pattern (see <Mono>/docs/pricing</Mono>) so the final settlement reflects actual usage.</li>
          <li><strong>Idempotency:</strong> retrying with the same intent and nonce is safe — the settlement program enforces nonce uniqueness, so duplicate retries collapse to a single settled call.</li>
        </ul>
      </DocSection>

      <DocSection id="security" title="Security model">
        <p>The handshake is designed under three assumptions:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>No replay:</strong> nonces are single-use and bound to a specific resource and quote. The settlement program maintains the canonical nonce registry; off-chain replays are caught at the program level even if the server is compromised.</li>
          <li><strong>No overpay:</strong> the signed amount is exact; intents cannot be silently reused for higher-value calls. Two-phase pricing uses the quote as a hard ceiling that the commit cannot exceed.</li>
          <li><strong>No silent settlement:</strong> every successful response carries a receipt the caller can verify independently from any Solana RPC, without trusting the server or Astro.</li>
        </ul>
        <p>The full threat model is documented in <Mono>/docs/security</Mono>.</p>
      </DocSection>

      <DocSection id="wire" title="Wire-level example">
        <p>For implementers building a non-SDK client, here is a complete wire trace of a single paid call:</p>
        <Code lang="text" code={`> POST /v1/infer HTTP/1.1
> Host: api.acme.dev
> Content-Type: application/json
> Content-Length: 38
>
> {"prompt":"hello","tokens":120}

< HTTP/1.1 402 Payment Required
< X-Astro-Price: 0.0021 USDC
< X-Astro-Scope: inference.gpt
< X-Astro-Settle: solana
< X-Astro-TTL: 60
< X-Astro-Nonce: 9f4adc...2e1c
< X-Astro-Domain: 4f2c...91ab
< Content-Length: 0

# client signs intent with Ed25519, broadcasts settlement tx on Solana

> POST /v1/infer HTTP/1.1
> Host: api.acme.dev
> Content-Type: application/json
> X-Astro-Intent: eb91...a201
> Content-Length: 38
>
> {"prompt":"hello","tokens":120}

< HTTP/1.1 200 OK
< X-Astro-Receipt: 1d4a...8f33
< Content-Type: application/json
<
< {"result":"hi there"}`} />
      </DocSection>

      <PageFooterNav prev={{ to: "/docs/architecture", label: "Architecture" }} next={{ to: "/docs/serve", label: "serve()" }} />
    </DocsLayout>
  );
}
