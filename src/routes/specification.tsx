import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/meridian/PageLayout";

export const Route = createFileRoute("/specification")({
  component: SpecificationPage,
});

const SECTIONS = [
  {
    id: "handshake",
    title: "The 402 handshake",
    description: "When a client requests a resource that requires payment, the server returns HTTP 402 with a quote object. The quote is a signed JSON envelope containing the price, accepted assets, settlement chains, scope, and expiry. The client signs a payment intent referencing the exact quote and re-submits the request.",
    fields: [
      ["status", "402", "Payment Required — never 200 on the first attempt for paid resources"],
      ["X-Payment-Quote", "JSON (base64)", "Signed quote envelope"],
      ["X-Payment-Version", "string", "Protocol version (current: 0.402)"],
    ],
  },
  {
    id: "quote",
    title: "Quote object",
    description: "A quote is a short-lived cryptographic offer. It commits the server to a price and a handler behavior for the duration of the TTL. Quotes are EIP-712 typed data and can be verified without trusting Meridian infrastructure.",
    fields: [
      ["resource", "string", "Fully qualified resource path"],
      ["scope", "string", "Required capability (e.g. inference.gpt)"],
      ["price", "uint256", "Amount in atomic units of the settlement asset"],
      ["asset", "address", "ERC-20 token contract (or zero address for ETH)"],
      ["chain", "uint256", "EIP-155 chain ID"],
      ["ttl", "uint64", "Quote expiry — unix timestamp in seconds"],
      ["nonce", "bytes32", "Replay-protection nonce"],
      ["serverKey", "address", "Server's signing address"],
      ["signature", "bytes", "ECDSA signature over the EIP-712 digest"],
    ],
  },
  {
    id: "intent",
    title: "Payment intent",
    description: "The client signs an intent that references the quote and authorizes the token transfer. The intent is submitted as the X-Payment-Intent header on the retry request. The server verifies the signature, submits the settlement, and — if successful — runs the handler.",
    fields: [
      ["quoteHash", "bytes32", "Keccak hash of the quote envelope"],
      ["payer", "address", "Caller's Ethereum address"],
      ["signature", "bytes", "ECDSA signature over the EIP-712 intent digest"],
    ],
  },
  {
    id: "receipt",
    title: "Receipt",
    description: "On successful settlement, the server includes a receipt in the response. Receipts are permanent, publicly verifiable records of the payment and the handler execution. They are indexed by Meridian's receipt indexer but can be verified independently using only the settlement contract.",
    fields: [
      ["txHash", "bytes32", "Settlement transaction hash"],
      ["blockNumber", "uint64", "Block in which settlement was confirmed"],
      ["intentHash", "bytes32", "Hash of the signed intent"],
      ["serverAttestation", "bytes", "Server signature attesting to handler execution"],
      ["merkleProof", "bytes[]", "Proof anchoring receipt to the settlement event log"],
    ],
  },
];

function SpecificationPage() {
  return (
    <PageLayout
      eyebrow="Specification"
      title="Protocol wire spec."
      intro="The complete wire-level specification for the Meridian 402 protocol — quote format, intent encoding, settlement flow, and receipt schema."
    >
      <div className="flex items-center gap-4 -mt-12 mb-16">
        <Link to="/docs/handshake" className="inline-flex h-9 items-center px-4 rounded-md bg-foreground text-background text-[13px] font-medium hover:bg-foreground/90 transition-colors">
          Read the handshake docs →
        </Link>
        <span className="text-[12px] font-mono text-muted-foreground border border-border rounded px-2.5 py-1">v0.402</span>
      </div>

      <div className="space-y-20">
        {SECTIONS.map((s, idx) => (
          <div key={s.id} id={s.id} className={idx > 0 ? "border-t border-border pt-20" : ""}>
            <div className="text-[11px] font-mono tracking-[0.2em] text-accent mb-4">
              {String(idx + 1).padStart(2, "0")}
            </div>
            <h2 className="text-[26px] font-medium mb-4">{s.title}</h2>
            <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl mb-8">{s.description}</p>
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="grid grid-cols-[160px_140px_1fr] bg-surface/40 border-b border-border px-5 py-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                <div>Field</div><div>Type</div><div>Description</div>
              </div>
              {s.fields.map(([field, type, desc]) => (
                <div key={field} className="grid grid-cols-[160px_140px_1fr] gap-4 px-5 py-3.5 text-[13px] border-b border-border last:border-0 hover:bg-surface/20 transition-colors">
                  <div className="font-mono text-accent">{field}</div>
                  <div className="font-mono text-muted-foreground">{type}</div>
                  <div className="text-foreground/80">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Section>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-[22px] font-medium mb-1">Need the full reference?</h2>
            <p className="text-[14px] text-muted-foreground">The docs cover each concept in depth with worked examples and SDK code.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/docs/concepts" className="inline-flex h-10 items-center px-5 rounded-md border border-border text-[13.5px] text-muted-foreground hover:text-foreground transition-colors">
              Core concepts
            </Link>
            <Link to="/docs/handshake" className="inline-flex h-10 items-center px-5 rounded-md bg-foreground text-background text-[13.5px] font-medium hover:bg-foreground/90 transition-colors">
              The 402 handshake
            </Link>
          </div>
        </div>
      </Section>
    </PageLayout>
  );
}

function Section({ children }: { children: import("react").ReactNode }) {
  return <div className="border-t border-border pt-20 mt-20">{children}</div>;
}
