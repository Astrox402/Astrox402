import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, Code, Callout, PageFooterNav, Mono, Params } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture — Astro Docs" },
      { name: "description", content: "How the Astro SDK, verifier, settlement contracts, and indexer fit together to deliver sub-second paid API calls on Solana." },
      { property: "og:title", content: "Architecture — Astro Docs" },
      { property: "og:description", content: "End-to-end architecture of the Astro protocol: SDK, verifier, settlement, indexer, and reconciliation." },
    ],
  }),
  component: ArchitecturePage,
});

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "components", label: "Components" },
  { id: "sdk", label: "SDK layer" },
  { id: "verifier", label: "Verifier" },
  { id: "settlement", label: "Settlement contracts" },
  { id: "indexer", label: "Indexer" },
  { id: "data-flow", label: "Data flow" },
  { id: "scaling", label: "Scaling characteristics" },
  { id: "trust", label: "Trust boundaries" },
];

function ArchitecturePage() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Foundations"
        title="Architecture"
        intro="Astro is composed of four cleanly separated layers: the SDK, the verifier, the settlement contracts, and the indexer. Each layer is independently replaceable, independently auditable, and has a single responsibility."
      />

      <DocSection id="overview" title="Overview">
        <p>
          The architecture is deliberately minimal. There is no central API server that mediates requests, no proprietary database that holds the source of truth, and no shared mutable state between callers and providers. Everything either lives in the request/response cycle, on the chain, or in client-side memory.
        </p>
        <Callout>
          Astro's central design principle: <strong>the chain is the source of truth, the SDK is the interface, and everything else is convenience.</strong> If Astro's hosted infrastructure disappeared tomorrow, your endpoints would still work and your receipts would still verify.
        </Callout>
      </DocSection>

      <DocSection id="components" title="Components">
        <Params rows={[
          ["SDK", "Client + server library", "Signs intents, runs serve(), verifies receipts."],
          ["Verifier", "Stateless service / lib", "Validates intents and settlement before handler runs."],
          ["Settlement contracts", "Solana programs", "Custody-free escrow + atomic transfer + nonce registry."],
          ["Indexer", "Optional hosted service", "Reconciliation API, dashboards, webhooks."],
        ]} />
      </DocSection>

      <DocSection id="sdk" title="SDK layer">
        <p>
          The SDK is the only piece you import. It exposes <Mono>serve()</Mono> for endpoints, <Mono>astroClient()</Mono> for callers, <Mono>agent()</Mono> for autonomous identities, and a handful of utilities like <Mono>verifyReceipt()</Mono>. It is self-contained and has no runtime dependency on any Astro-hosted service.
        </p>
        <p>
          On the server, the SDK is a thin middleware: it intercepts incoming requests, runs the price function to produce a quote, returns 402 if no intent is attached, and otherwise hands the verified payment context to your handler. On the client, it implements the 402 retry loop, signs intents, and exposes the receipt on the response object.
        </p>
        <Code lang="ts" code={`// The whole SDK surface, conceptually
import {
  meridian,        // namespace: serve, agent, webhooks, receipts
  astroClient,  // wallet-backed client
  verifyReceipt,   // pure verification helper
} from "@astro/sdk";`} />
      </DocSection>

      <DocSection id="verifier" title="Verifier">
        <p>
          The verifier is the security-critical core: it validates Ed25519 signatures, checks nonce uniqueness, confirms the settlement transaction is included on the declared chain, and binds the verified payment context to the request. It runs in-process inside <Mono>serve()</Mono> by default, but can be split into a sidecar or a hosted service for environments that need it (regulated industries, high-throughput marketplaces).
        </p>
        <Callout tone="muted">
          The verifier is fully open-source and reproducible. There is no proprietary verification path. If you do not trust Astro's binary, you can compile the verifier yourself or implement it from the published spec — the on-the-wire format is stable and documented.
        </Callout>
      </DocSection>

      <DocSection id="settlement" title="Settlement contracts">
        <p>
          The settlement contracts are deployed on Solana. They are minimal by design: an atomic transfer function, a nonce registry to prevent replay, and an event log that the indexer consumes. The contracts are non-custodial — Astro never holds caller or provider funds at any point.
        </p>
        <p>
          Because the contracts are public, any third party can build their own indexer, their own client, or their own verifier. The protocol's openness is enforced at the lowest layer — there is no part of the system that requires Astro's permission to participate.
        </p>
      </DocSection>

      <DocSection id="indexer" title="Indexer">
        <p>
          The indexer is the only optional, hosted component. It watches settlement contract events on every supported chain, materializes them into queryable receipts, exposes the reconciliation API, and powers the dashboard, webhooks, and analytics. Because all source data is onchain, you can always rebuild the index from scratch — there is no exclusive data inside the indexer.
        </p>
      </DocSection>

      <DocSection id="data-flow" title="Data flow">
        <Code lang="text" code={`Caller                Astro SDK            Provider                 Chain
  │                        │                       │                       │
  │── POST /v1/infer ─────────────────────────────▶│                       │
  │                        │                       │── 402 + quote ────────│
  │◀──────────────── 402 + headers ────────────────│                       │
  │── sign(intent) ────────│                       │                       │
  │── settle(intent) ──────────────────────────────────────────────────────▶│
  │                        │                       │                       │
  │── retry + intent ─────────────────────────────▶│── verify ─────────────▶│
  │                        │                       │── handler runs ──────│
  │◀────── 200 + receipt ──────────────────────────│                       │`} />
        <p>
          The whole loop is observable: every arrow corresponds to a public artifact (HTTP message, signed intent, onchain transaction, or receipt). There are no opaque internal RPCs and no privileged side channels.
        </p>
      </DocSection>

      <DocSection id="scaling" title="Scaling characteristics">
        <p>
          The hot path — quote generation, intent verification, handler execution — is stateless. A Astro-wrapped endpoint scales identically to the underlying handler. There is no shared write path, no cross-region coordination, and no Astro rate limit on your endpoint's capacity.
        </p>
        <p>
          The cold path — settlement and indexing — is bounded by the underlying chain. Solana comfortably handle thousands of settlements per second; Solana is more constrained but appropriate for high-value, low-frequency calls. For burst traffic, Astro supports batched settlement that amortizes a single onchain transaction over many calls (see <Mono>/docs/serve</Mono>).
        </p>
      </DocSection>

      <DocSection id="trust" title="Trust boundaries">
        <p>
          The trust model is intentionally narrow:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>You trust your own SDK build.</strong> Source-available, reproducible, no telemetry by default.</li>
          <li><strong>You trust the underlying chain.</strong> Same assumption as any other onchain system.</li>
          <li><strong>You do not need to trust Astro.</strong> Hosted indexer is optional; the protocol works without it.</li>
          <li><strong>You do not need to trust the counterparty.</strong> Receipts are the proof; no off-chain claim is required.</li>
        </ul>
      </DocSection>

      <PageFooterNav prev={{ to: "/docs/concepts", label: "Core concepts" }} next={{ to: "/docs/handshake", label: "The 402 handshake" }} />
    </DocsLayout>
  );
}
