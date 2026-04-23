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
        intro="Meridian collapses entitlement, metering, and settlement into a single HTTP exchange. This page is the deep specification of the protocol-level handshake that makes that possible — the headers, the intent format, the verification path, and the failure modes."
      />

      <DocSection id="overview" title="Overview">
        <p>
          When a caller requests a Meridian-protected resource without a valid payment, the server responds with <Mono>HTTP 402 Payment Required</Mono>. The response carries the price, scope, settlement chain, and a short-lived nonce. The client signs a payment intent and retries; the server verifies the intent onchain and returns the resource with a receipt. The whole loop typically completes in under 1.2 seconds on L2s, comparable to a normal authenticated API call.
        </p>
        <Callout>
          The handshake is stateless on the server. Every quote is bound to a nonce and TTL, and every receipt is independently verifiable on Ethereum. There is no session, no cookie, and no shared mutable state.
        </Callout>
      </DocSection>

      <DocSection id="history" title="Why 402">
        <p>
          The HTTP/1.1 specification reserved <Mono>402 Payment Required</Mono> in 1997 with a single sentence: "This code is reserved for future use." For the next quarter-century, no standard ever filled it in. Various proposals — micropayments, lightning integrations, custom headers — came and went, but none combined a stable wire format with non-custodial settlement and a deployable runtime.
        </p>
        <p>
          Meridian operationalizes 402 by treating it as the canonical signal for "this resource exists, but you need to pay to access it." The semantics map cleanly: the response carries the price (like 401 carries the auth challenge), the client constructs a credential (the intent), and the request is retried. Existing intermediaries — proxies, gateways, edge caches — pass 402 through correctly because the spec has always reserved it.
        </p>
      </DocSection>

      <DocSection id="lifecycle" title="Request lifecycle">
        <Code lang="http" code={`1. → POST /v1/infer
     Content-Type: application/json
     { "prompt": "hello", "tokens": 120 }

2. ← 402 Payment Required
     X-Meridian-Price:  0.0021 USDC
     X-Meridian-Scope:  inference.gpt
     X-Meridian-Settle: base
     X-Meridian-TTL:    60
     X-Meridian-Nonce:  0x9f4a…2e1c

3. → POST /v1/infer
     X-Meridian-Intent: 0x<eip712-signed-intent>
     Content-Type: application/json
     { "prompt": "hello", "tokens": 120 }

4. ← 200 OK
     X-Meridian-Receipt: 0x<receipt-bytes>
     Content-Type: application/json
     { "result": "..." }`} />
        <p>The full round-trip is typically under <strong>1.2 seconds</strong>, including settlement on supported L2s. The settlement transaction is broadcast in parallel with step 3, so verification is already in-flight by the time the server begins parsing the intent.</p>
      </DocSection>

      <DocSection id="headers" title="Response headers">
        <p>The 402 response is fully described by its headers. The body is empty by default, but providers may include a structured JSON body for clients that prefer it (the SDK uses headers exclusively).</p>
        <Params rows={[
          ["x-meridian-price", "string", "Quoted price as 'amount asset', e.g. '0.0021 USDC'."],
          ["x-meridian-scope", "string", "Capability namespace (e.g. inference.gpt)."],
          ["x-meridian-settle", "string", "Settlement target chain (ethereum, base, optimism, arbitrum)."],
          ["x-meridian-ttl", "number", "Validity window for the quote, in seconds."],
          ["x-meridian-nonce", "hex", "Single-use nonce binding the quote to this request."],
          ["x-meridian-domain", "string", "EIP-712 domain hash for signature binding."],
          ["x-meridian-resource", "string", "Echo of the resource identifier; used for client-side scope routing."],
        ]} />
        <p>All headers are case-insensitive per HTTP semantics. The SDK reads them with normalization; if you implement your own client, do the same.</p>
      </DocSection>

      <DocSection id="intent" title="Payment intent">
        <p>The client signs an EIP-712 typed-data payload binding the nonce, scope, and price. The intent is opaque to the application layer — your handler never reads it directly; the verifier produces a structured <Mono>ctx.payment</Mono> after validation.</p>
        <Code lang="json" code={`{
  "domain": {
    "name":              "Meridian",
    "version":           "1",
    "chainId":           8453,
    "verifyingContract": "0x…"
  },
  "types": {
    "Intent": [
      { "name": "resource", "type": "string"  },
      { "name": "scope",    "type": "string"  },
      { "name": "amount",   "type": "uint256" },
      { "name": "asset",    "type": "address" },
      { "name": "nonce",    "type": "bytes32" },
      { "name": "expires",  "type": "uint64"  }
    ]
  },
  "message": {
    "resource": "/v1/infer",
    "scope":    "inference.gpt",
    "amount":   "2100",
    "asset":    "0xA0b8…eB48",
    "nonce":    "0x9f4a…2e1c",
    "expires":  1727384981
  }
}`} />
        <p>Because the intent is standard EIP-712, every wallet — hardware, mobile, embedded, MPC, or backend KMS — can sign it without Meridian-specific tooling. The signature alone proves authorization; replay is prevented by the nonce; overpay is prevented by the exact amount.</p>
      </DocSection>

      <DocSection id="verification" title="Verification & retry">
        <p>The server verifies the intent in three steps before any handler code runs:</p>
        <ol className="list-decimal pl-5 space-y-2">
          <li><strong>Signature.</strong> Recover the signer from the EIP-712 hash; check it matches the declared payer.</li>
          <li><strong>Quote binding.</strong> Confirm the intent's resource, scope, amount, and nonce match the original quote and that the quote hasn't expired.</li>
          <li><strong>Onchain settlement.</strong> Wait for the settlement transaction (broadcast in parallel by the client) to confirm. The verifier supports both pessimistic (wait for inclusion) and optimistic (proceed on signed pre-confirmation) modes.</li>
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
          <li><strong>Idempotency:</strong> retrying with the same intent and nonce is safe — the settlement contract enforces nonce uniqueness, so duplicate retries collapse to a single settled call.</li>
        </ul>
      </DocSection>

      <DocSection id="security" title="Security model">
        <p>The handshake is designed under three assumptions:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>No replay:</strong> nonces are single-use and bound to a specific resource and quote. The settlement contract maintains the canonical nonce registry; off-chain replays are caught at the contract level even if the server is compromised.</li>
          <li><strong>No overpay:</strong> the signed amount is exact; intents cannot be silently reused for higher-value calls. Two-phase pricing uses the quote as a hard ceiling that the commit cannot exceed.</li>
          <li><strong>No silent settlement:</strong> every successful response carries a receipt the caller can verify independently from any Ethereum RPC, without trusting the server or Meridian.</li>
        </ul>
        <p>The full threat model — including key compromise, network adversaries, and chain-level failures — is documented in <Mono>/docs/security</Mono>.</p>
      </DocSection>

      <DocSection id="wire" title="Wire-level example">
        <p>For implementers building a non-SDK client, here is a complete wire trace of a single paid call, captured with verbose logging:</p>
        <Code lang="text" code={`> POST /v1/infer HTTP/1.1
> Host: api.acme.dev
> Content-Type: application/json
> Content-Length: 38
>
> {"prompt":"hello","tokens":120}

< HTTP/1.1 402 Payment Required
< X-Meridian-Price: 0.0021 USDC
< X-Meridian-Scope: inference.gpt
< X-Meridian-Settle: base
< X-Meridian-TTL: 60
< X-Meridian-Nonce: 0x9f4adc...2e1c
< X-Meridian-Domain: 0x4f2c...91ab
< Content-Length: 0

# client signs intent, broadcasts settlement tx in parallel

> POST /v1/infer HTTP/1.1
> Host: api.acme.dev
> Content-Type: application/json
> X-Meridian-Intent: 0xeb91...a201
> Content-Length: 38
>
> {"prompt":"hello","tokens":120}

< HTTP/1.1 200 OK
< X-Meridian-Receipt: 0x1d4a...8f33
< Content-Type: application/json
<
< {"result":"hi there"}`} />
      </DocSection>

      <PageFooterNav prev={{ to: "/docs/architecture", label: "Architecture" }} next={{ to: "/docs/serve", label: "serve()" }} />
    </DocsLayout>
  );
}
