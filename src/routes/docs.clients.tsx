import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, Code, Params, PageFooterNav, Mono, Callout } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/clients")({
  head: () => ({
    meta: [
      { title: "SDK clients — Astro Docs" },
      { name: "description", content: "Call Astro endpoints from apps, services, and infrastructure. Wallet config, spend limits, scope allowlists, retries, streaming, and language SDKs." },
      { property: "og:title", content: "SDK clients — Astro Docs" },
      { property: "og:description", content: "Calling Astro endpoints from apps and services — wallets, spend limits, retries, and language coverage." },
    ],
  }),
  component: ClientsPage,
});

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "fetch", label: "Web client" },
  { id: "wallets", label: "Wallet integration" },
  { id: "limits", label: "Spend limits" },
  { id: "policies", label: "Approval policies" },
  { id: "streaming", label: "Streaming responses" },
  { id: "errors", label: "Errors & retries" },
  { id: "languages", label: "Languages" },
  { id: "interop", label: "Interop & raw HTTP" },
];

function ClientsPage() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Clients"
        title="SDK clients"
        intro="The client SDKs handle the 402 handshake transparently — signing intents, retrying, surfacing receipts. Use them from web apps, backends, or any service that consumes paid APIs. For autonomous agents specifically, see /docs/agents."
      />

      <DocSection id="overview" title="Overview">
        <p>All clients share the same surface area: a fetch-style call that resolves to a typed response with an attached receipt. The differences are in <strong>identity</strong> (which wallet signs), <strong>policy</strong> (interactive vs. autonomous), and <strong>runtime</strong> (browser, Node, edge, mobile).</p>
        <p>The client is intentionally thin. It does not own a connection pool, does not introduce its own retry queue beyond the protocol-defined retries, and does not buffer requests. Every call maps to one HTTP exchange (plus the 402 retry), and every retry is observable.</p>
      </DocSection>

      <DocSection id="fetch" title="Web client">
        <p>For human-in-the-loop applications, use a wallet-backed client. The signer can be anything that implements EIP-712 — wagmi, viem, ethers, RainbowKit, embedded wallets like Privy or Turnkey, or a custom MPC service.</p>
        <Code lang="ts" code={`import { astroClient } from "@astro/sdk";

const client = astroClient({
  wallet:   signer,
  maxSpend: "1 USDC / hour",
});

const res = await client.fetch("/v1/infer", {
  method: "POST",
  body:   JSON.stringify({ prompt: "hello" }),
});

const data    = await res.json();
const receipt = res.receipt;        // attached automatically`} />
        <p>The response is a slightly extended <Mono>Response</Mono> — every standard method (<Mono>json()</Mono>, <Mono>text()</Mono>, <Mono>arrayBuffer()</Mono>, <Mono>body</Mono>) works as expected, plus <Mono>res.receipt</Mono> exposes the parsed receipt.</p>
      </DocSection>

      <DocSection id="wallets" title="Wallet integration">
        <p>Astro works with any signer that can produce an EIP-712 signature. The SDK ships first-class adapters for the most common stacks:</p>
        <Params rows={[
          ["viem", "WalletClient", "Pass the wallet client directly as the signer."],
          ["ethers", "Signer", "v5 and v6 supported via astro.adapters.ethers()."],
          ["wagmi", "useAccount + signTypedData", "Use the React hook in browser apps."],
          ["Privy / Turnkey / Dynamic", "Embedded wallet", "Use the SDK's getSigner() helper."],
          ["KMS (AWS / GCP)", "Backend signer", "Use astro.adapters.kms() for server-side flows."],
        ]} />
      </DocSection>

      <DocSection id="limits" title="Spend limits">
        <p>All client constructors accept spend caps. Limits are evaluated locally before signing and enforced server-side at settlement, providing defense in depth.</p>
        <Params rows={[
          ["maxSpend", "string", "Total spend per window, e.g. '1 USDC / hour'."],
          ["perCallMax", "string", "Hard cap per single call."],
          ["perDayMax", "string", "Daily aggregate ceiling."],
          ["allow", "string[]", "Scope allowlist with glob support."],
          ["deny", "string[]", "Scope denylist; takes precedence over allow."],
          ["expiresAt", "number", "Unix timestamp; client refuses to sign after."],
        ]} />
        <Callout tone="muted">
          Limits are local-first guardrails. They prevent over-spend before any signature is ever created. The server also enforces per-payer rate limits and the contract enforces per-intent amount caps — three independent layers of protection.
        </Callout>
      </DocSection>

      <DocSection id="policies" title="Approval policies">
        <p>For sensitive flows, attach an approval callback. The client pauses before signing and waits for confirmation. The callback receives the full quote — amount, scope, resource, expiry — so you can render meaningful UI.</p>
        <Code lang="ts" code={`const client = astroClient({
  wallet: signer,
  approve: async (quote) => {
    if (quote.amountUsd > 0.5) return await ui.confirm(quote);
    return true;
  },
});`} />
        <p>The approval callback can be synchronous or async, can return a boolean or a partial quote object (to renegotiate), and times out at the quote's TTL by default.</p>
      </DocSection>

      <DocSection id="streaming" title="Streaming responses">
        <p>For streaming endpoints (SSE, NDJSON, raw byte streams), the client exposes the response body as a standard <Mono>ReadableStream</Mono>. The receipt arrives in the response header before the stream begins, so you have proof of payment in hand for the entire stream lifetime.</p>
        <Code lang="ts" code={`const res = await client.fetch("/v1/stream", { method: "POST" });
const reader = res.body!.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  process(value);
}`} />
      </DocSection>

      <DocSection id="errors" title="Errors & retries">
        <Params rows={[
          ["402", "Payment required. Handled automatically."],
          ["409", "Quote expired — client retries with a fresh quote."],
          ["422", "Settlement rejected. Inspect receipt.error."],
          ["429", "Rate limited at the resource level. Retry-After respected."],
          ["503", "Settlement chain congested. Exponential backoff, max 3 attempts."],
          ["LimitExceeded", "Spend or scope policy denied the call locally — no retry."],
        ]} />
        <p>Every error is a typed class extending <Mono>AstroError</Mono>. See <Mono>/docs/errors</Mono> for the complete reference and recommended handling patterns.</p>
      </DocSection>

      <DocSection id="languages" title="Languages">
        <p>First-party clients ship for TypeScript, Python, Go, and Rust. The wire protocol is open — additional clients can be implemented against the published specification.</p>
        <Code lang="bash" code={`# TypeScript
npm install @astro/sdk

# Python
pip install astro-sdk

# Go
go get github.com/astro/sdk-go

# Rust
cargo add astro-sdk`} />
        <p>All language SDKs implement the same protocol verbatim and produce wire-identical intents and signatures. A TypeScript client and a Rust agent can call the same endpoint, see the same quotes, and produce receipts that are indistinguishable on the chain.</p>
      </DocSection>

      <DocSection id="interop" title="Interop & raw HTTP">
        <p>You don't need an SDK to call a Astro endpoint. The protocol is plain HTTP plus EIP-712 signatures, both of which are widely supported. Implementing a client from scratch takes around 200 lines of code in any language with an EVM signing library.</p>
        <p>The full wire specification is published at the protocol repository, including reference test vectors that any new client implementation can validate against. If you build one, the interop test suite will tell you whether it's protocol-compliant before you ship.</p>
      </DocSection>

      <PageFooterNav prev={{ to: "/docs/errors", label: "Errors & status codes" }} next={{ to: "/docs/agents", label: "Agent commerce" }} />
    </DocsLayout>
  );
}
