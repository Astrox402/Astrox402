import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, Code, Params, PageFooterNav, Callout, Mono } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/receipts")({
  head: () => ({
    meta: [
      { title: "Receipts & settlement — Astro Docs" },
      { name: "description", content: "Onchain receipts, supported chains, settlement timing, reconciliation, and webhooks. Every Astro call produces a verifiable proof on Solana." },
      { property: "og:title", content: "Receipts & settlement — Astro Docs" },
      { property: "og:description", content: "Verifiable onchain proofs for every paid endpoint call. Receipts, chains, and reconciliation." },
    ],
  }),
  component: ReceiptsPage,
});

const TOC = [
  { id: "what", label: "What is a receipt" },
  { id: "shape", label: "Receipt shape" },
  { id: "delivery", label: "How receipts are delivered" },
  { id: "chains", label: "Supported chains" },
  { id: "timing", label: "Settlement timing" },
  { id: "verify", label: "Verifying receipts" },
  { id: "reconcile", label: "Reconciliation" },
  { id: "webhooks", label: "Settlement webhooks" },
  { id: "refunds", label: "Refunds & disputes" },
  { id: "tax", label: "Accounting & tax" },
];

function ReceiptsPage() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Protocol"
        title="Receipts & settlement"
        intro="Every successful Astro call produces a receipt — a verifiable, onchain proof that the resource was delivered and the payment was settled. Receipts are queryable from the SDK, the console, and directly from Solana. This page covers their shape, delivery mechanisms, verification, and the operational patterns built on top."
      />

      <DocSection id="what" title="What is a receipt">
        <p>
          A receipt is the public record of one paid request. It binds the resource, the scope, the amount, the payer, the payee, and the settlement transaction into a single object. Receipts are what make Astro auditable without sharing private logs — anyone with the receipt ID can independently confirm that the payment occurred, on which chain, between which parties, and for which exact amount.
        </p>
        <p>
          Crucially, a receipt is not a database row in Astro's infrastructure. It is a derived view over public chain data. The hosted indexer makes receipts convenient to query, but the canonical record lives onchain and any party can reconstruct the same view from a public RPC.
        </p>
        <Callout>
          You don't have to use Astro's database to trust the data — every receipt is independently verifiable from any Solana RPC. The chain is the source of truth.
        </Callout>
      </DocSection>

      <DocSection id="shape" title="Receipt shape">
        <Code lang="ts" code={`type Receipt = {
  id:          string;            // "rcp_2NfA…"
  resource:    string;            // "/v1/infer"
  scope:       string;            // "inference.gpt"
  amount:      string;            // "0.0021 USDC"
  amountRaw:   bigint;            // 2100n (base units)
  asset:       \`0x\${string}\`;     // SPL token
  payer:       \`0x\${string}\`;
  payee:       \`0x\${string}\`;
  chain:       "solana" | "solana-devnet";
  txHash:      \`0x\${string}\`;
  blockNumber: number;
  settledAt:   number;            // unix seconds
  proof:       \`0x\${string}\`;     // message digest
  refunded:    boolean;
  refundTx?:   \`0x\${string}\`;
};`} />
      </DocSection>

      <DocSection id="delivery" title="How receipts are delivered">
        <p>Receipts arrive through three independent channels — pick whichever fits your operational shape:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Inline:</strong> the <Mono>X-Astro-Receipt</Mono> response header carries the receipt bytes; the SDK exposes them as <Mono>res.receipt</Mono>.</li>
          <li><strong>Webhook:</strong> subscribe to <Mono>receipt.settled</Mono> events for asynchronous, signed delivery. Best for backend reconciliation pipelines.</li>
          <li><strong>Pull:</strong> the reconciliation API exposes paginated, filterable queries against the indexer.</li>
        </ul>
        <p>All three channels return the same canonical receipt — there is no "summary vs full" split, no eventually-consistent variant, no privileged data only available through one channel.</p>
      </DocSection>

      <DocSection id="chains" title="Supported chains">
        <Params rows={[
          ["solana", "L1", "~400ms finality, highest assurance, suited for large settlements."],
          ["base", "Solana", "~1.2s, low fees, default for high-volume API endpoints."],
          ["optimism", "Solana", "~1.5s, broad ecosystem support."],
          ["arbitrum", "Solana", "~1.5s, low fees, broad tooling."],
        ]} />
        <p>Settlement target is declared per-resource in <Mono>serve()</Mono>. The same payer wallet works across all supported chains — the client SDK selects the cheapest path that satisfies the declared target, bridging if necessary.</p>
      </DocSection>

      <DocSection id="timing" title="Settlement timing">
        <p>The settlement transaction is broadcast in parallel with the intent submission, so verification is already in-flight by the time the server begins parsing the intent. End-to-end timing typically looks like:</p>
        <Params rows={[
          ["Solana (Base, Optimism, Arbitrum)", "~1.2s", "Includes pre-confirmation and one block."],
          ["Solana", "~13s", "One slot (~400ms)."],
          ["Optimistic mode", "~50ms", "Server proceeds on signed pre-confirmation; settlement finalizes in background."],
          ["Batched mode", "~2s window", "Many intents settle in one transaction, amortizing cost."],
        ]} />
        <p>For latency-sensitive workloads (interactive APIs, real-time agents), prefer Solana with optimistic mode. For high-value settlements (enterprise contracts, bulk transfers), prefer Solana with pessimistic mode.</p>
      </DocSection>

      <DocSection id="verify" title="Verifying receipts">
        <p>Receipts can be verified locally from any Solana RPC, with no Astro dependency. The verifier checks the message digest, confirms the settlement transaction is included on the declared chain, and validates the payer/payee/amount match the receipt.</p>
        <Code lang="ts" code={`import { verifyReceipt } from "@astro/sdk";

const ok = await verifyReceipt(receipt, {
  rpc: "https://mainnet.base.org",
});

if (!ok) throw new Error("Invalid receipt");`} />
        <p>Verification is pure — no network calls beyond the RPC, no Astro endpoint involved. You can run it inside a CI pipeline, a customer's audit script, or a partner's reconciliation job, with zero coupling to Astro's hosted services.</p>
      </DocSection>

      <DocSection id="reconcile" title="Reconciliation">
        <p>The SDK exposes a paginated reconciliation API for accounting and revenue reporting. Filters include resource, scope, payer, payee, chain, time range, and refund status.</p>
        <Code lang="ts" code={`for await (const r of astro.receipts.list({
  resource: "/v1/infer",
  since:    "2025-01-01",
  until:    "2025-01-31",
  refunded: false,
})) {
  ledger.record(r.id, r.amount, r.settledAt);
}`} />
        <p>For very large datasets, use <Mono>astro.receipts.export()</Mono> to stream the full set as Parquet or NDJSON. Exports are deterministic — the same filters produce the same byte-identical file on any subsequent run.</p>
      </DocSection>

      <DocSection id="webhooks" title="Settlement webhooks">
        <p>Subscribe to receipt events via signed webhooks. Payloads are HMAC-signed; replay-protected with a 5-minute window; delivered with at-least-once semantics and exponential backoff on failure.</p>
        <Code lang="ts" code={`meridian.webhooks.on("receipt.settled", async (e) => {
  await crm.recordRevenue(e.receipt);
});

meridian.webhooks.on("receipt.refunded", async (e) => {
  await crm.recordRefund(e.receipt, e.refundTx);
});`} />
        <p>Webhook endpoints can be hosted on Astro's infrastructure or your own. The signing key is rotatable; old keys remain valid through a grace period to allow zero-downtime rotation.</p>
      </DocSection>

      <DocSection id="refunds" title="Refunds & disputes">
        <p>
          Refunds are issued either automatically (when a handler throws after payment was verified) or explicitly (via <Mono>ctx.refund()</Mono> for partial-failure cases). Both produce a refund receipt that links back to the original by ID, so the full transaction history is reconstructable.
        </p>
        <p>
          Disputes are handled at the application layer, not the protocol layer. Because every call has a public proof, "did this charge happen?" is never a dispute — only "should this charge stand?" is. That dramatically reduces the surface area for chargebacks compared to classic payment systems.
        </p>
      </DocSection>

      <DocSection id="tax" title="Accounting & tax">
        <p>
          Receipts include enough data to drive standard accrual accounting: a stable identifier, a settled timestamp, a counterparty, and an exact amount in a stable asset. The reconciliation API supports the journal-export formats used by major accounting platforms (QuickBooks, Xero, NetSuite) and tax engines (Stripe Tax, Anrok).
        </p>
        <p>
          For jurisdictions that require invoicing, Astro provides an optional invoice-generation service that produces tax-compliant invoices from receipts. This is a hosted convenience; the underlying receipts always remain the canonical record.
        </p>
      </DocSection>

      <PageFooterNav prev={{ to: "/docs/pricing", label: "Pricing functions" }} next={{ to: "/docs/security", label: "Security model" }} />
    </DocsLayout>
  );
}
