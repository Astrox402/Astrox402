import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, Code, Params, PageFooterNav, Callout, Mono } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/receipts")({
  head: () => ({
    meta: [
      { title: "Receipts & settlement — Meridian Docs" },
      { name: "description", content: "Onchain receipts, supported chains, settlement timing, and reconciliation. Every Meridian call produces a verifiable proof on Ethereum." },
      { property: "og:title", content: "Receipts & settlement — Meridian Docs" },
      { property: "og:description", content: "Verifiable onchain proofs for every paid endpoint call. Receipts, chains, and reconciliation." },
    ],
  }),
  component: ReceiptsPage,
});

const TOC = [
  { id: "what", label: "What is a receipt" },
  { id: "shape", label: "Receipt shape" },
  { id: "chains", label: "Supported chains" },
  { id: "verify", label: "Verifying receipts" },
  { id: "reconcile", label: "Reconciliation" },
  { id: "webhooks", label: "Settlement webhooks" },
];

function ReceiptsPage() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Protocol"
        title="Receipts & settlement"
        intro="Every successful Meridian call produces a receipt — a verifiable, onchain proof that the resource was delivered and the payment was settled. Receipts are queryable from the SDK, the console, and directly from Ethereum."
      />

      <DocSection id="what" title="What is a receipt">
        <p>
          A receipt is the public record of one paid request. It binds the resource, the scope, the amount, the payer, and the settlement transaction into a single object. Receipts are what make Meridian auditable without sharing private logs.
        </p>
        <Callout>
          You don't have to use Meridian's database to trust the data — every receipt is independently verifiable from any Ethereum RPC.
        </Callout>
      </DocSection>

      <DocSection id="shape" title="Receipt shape">
        <Code lang="ts" code={`type Receipt = {
  id:          string;            // "rcp_2NfA…"
  resource:    string;            // "/v1/infer"
  scope:       string;            // "inference.gpt"
  amount:      string;            // "0.0021 USDC"
  payer:       \`0x\${string}\`;
  payee:       \`0x\${string}\`;
  chain:       "ethereum" | "base" | "optimism" | "arbitrum";
  txHash:      \`0x\${string}\`;
  settledAt:   number;            // unix seconds
  proof:       \`0x\${string}\`;     // EIP-712 digest
};`} />
      </DocSection>

      <DocSection id="chains" title="Supported chains">
        <Params rows={[
          ["ethereum", "L1", "~12s finality, highest assurance, suited for large settlements."],
          ["base", "L2", "~1.2s, low fees, default for high-volume API endpoints."],
          ["optimism", "L2", "~1.5s, broad ecosystem support."],
          ["arbitrum", "L2", "~1.5s, low fees, broad tooling."],
        ]} />
        <p>Settlement target is declared per-resource in <Mono>serve()</Mono>. The same payer wallet works across all supported chains.</p>
      </DocSection>

      <DocSection id="verify" title="Verifying receipts">
        <p>Receipts can be verified locally from any Ethereum RPC, with no Meridian dependency.</p>
        <Code lang="ts" code={`import { verifyReceipt } from "@meridian/sdk";

const ok = await verifyReceipt(receipt, {
  rpc: "https://mainnet.base.org",
});

if (!ok) throw new Error("Invalid receipt");`} />
      </DocSection>

      <DocSection id="reconcile" title="Reconciliation">
        <p>The SDK exposes a paginated reconciliation API for accounting and revenue reporting.</p>
        <Code lang="ts" code={`for await (const r of meridian.receipts.list({
  resource: "/v1/infer",
  since:    "2025-01-01",
})) {
  ledger.record(r.id, r.amount, r.settledAt);
}`} />
      </DocSection>

      <DocSection id="webhooks" title="Settlement webhooks">
        <p>Subscribe to receipt events via signed webhooks. Payloads are HMAC-signed; replay-protected with a 5-minute window.</p>
        <Code lang="ts" code={`meridian.webhooks.on("receipt.settled", async (e) => {
  await crm.recordRevenue(e.receipt);
});`} />
      </DocSection>

      <PageFooterNav prev={{ to: "/docs/pricing", label: "Pricing functions" }} next={{ to: "/docs/clients", label: "SDK clients" }} />
    </DocsLayout>
  );
}
