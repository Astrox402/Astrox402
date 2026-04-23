import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, PageFooterNav, Mono } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Astro Docs" },
      { name: "description", content: "Frequently asked questions about Astro — pricing, Solana settlement, agents, security, and operations." },
      { property: "og:title", content: "FAQ — Astro Docs" },
      { property: "og:description", content: "Common questions about the Astro x402-inspired control plane, SDK, and Solana settlement." },
    ],
  }),
  component: FaqPage,
});

const TOC = [
  { id: "general", label: "General" },
  { id: "pricing-q", label: "Pricing & fees" },
  { id: "chains", label: "Settlement & assets" },
  { id: "agents-q", label: "Agents" },
  { id: "ops", label: "Operations" },
  { id: "compare", label: "Comparisons" },
];

function QA({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-5 first:border-0 first:pt-0">
      <h3 className="text-[15.5px] font-medium text-foreground mb-2">{q}</h3>
      <div className="text-[14.5px] leading-relaxed text-muted-foreground space-y-3">{children}</div>
    </div>
  );
}

function FaqPage() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Resources"
        title="Frequently asked questions"
        intro="Short answers to the questions teams ask most often when adopting Astro. For deeper context, follow the linked sections — every answer here is backed by a more detailed reference page."
      />

      <DocSection id="general" title="General">
        <QA q="Do I need to know anything about crypto to use Astro?">
          <p>No. If you can write a fetch handler and read a function signature, you can ship an Astro endpoint. The protocol uses Solana for settlement, but the SDK abstracts every blockchain interaction. You declare a price in USDC or SOL, the SDK handles the rest.</p>
        </QA>
        <QA q="Is Astro a hosted service?">
          <p>Partially. The SDK and the settlement programs are open and require no Astro-hosted infrastructure to operate. The dashboard and reconciliation API are hosted conveniences; you can replace either with your own implementation built against the public Solana data.</p>
        </QA>
        <QA q="What does 'x402-inspired' mean?">
          <p>The HTTP status code 402 ("Payment Required") was reserved in the original HTTP spec but never standardized. Astro operationalizes that idea: a request without a valid payment intent receives 402 with a structured quote, and the client signs and retries. Astro is not a canonical implementation of any published x402 specification — it's a practical product layer built in the spirit of that protocol. See <Mono>/docs/handshake</Mono>.</p>
        </QA>
      </DocSection>

      <DocSection id="pricing-q" title="Pricing & fees">
        <QA q="What does Astro charge?">
          <p>The protocol itself charges nothing — the SDK is free, the settlement programs take no protocol fee, and you keep 100% of what your endpoints earn. Optional hosted services (dashboard, webhooks, premium support) are billed separately and never gate the core protocol.</p>
        </QA>
        <QA q="Do I have to use USDC?">
          <p>USDC is the default and recommended settlement asset because of its liquidity and stable accounting properties. Native SOL is also supported per-resource. The caller's wallet is converted at quote time if needed.</p>
        </QA>
        <QA q="Can I do free tiers?">
          <p>Yes. Return a price of <Mono>0</Mono> from your price function for any request that should bypass payment — the handshake short-circuits and the handler runs immediately. This lets you mix free and paid behavior on the same endpoint without forking your code.</p>
        </QA>
      </DocSection>

      <DocSection id="chains" title="Settlement & assets">
        <QA q="Which chains are supported?">
          <p>Solana only — mainnet and devnet. Astro is a Solana-native control plane. Settlement targets are declared per-resource using <Mono>{`{ chain: "solana", asset: "USDC" }`}</Mono>. Support for additional networks is not planned for the initial release.</p>
        </QA>
        <QA q="What about transaction fees?">
          <p>On Solana, transaction fees are typically a fraction of a cent and are paid by the caller as part of the intent — providers never see a fee bill. For high-volume resources, batched settlement amortizes the fee across many calls.</p>
        </QA>
        <QA q="Which assets are supported?">
          <p>Native SOL and USDC (SPL token) at launch. The settlement programs are designed to support any SPL token; additional assets can be added through configuration.</p>
        </QA>
      </DocSection>

      <DocSection id="agents-q" title="Agents">
        <QA q="How is an agent different from a regular client?">
          <p>An agent has an identity, a budget, and a scope allowlist as first-class constructor arguments. The SDK refuses to sign calls outside any of these boundaries, and the server enforces them again at settlement. See <Mono>/docs/agents</Mono>.</p>
        </QA>
        <QA q="Can agents call each other?">
          <p>Yes. Agent-to-agent commerce is just one Astro endpoint calling another. The receipt chain makes the entire delegation graph reconstructable after the fact.</p>
        </QA>
      </DocSection>

      <DocSection id="ops" title="Operations">
        <QA q="What's the latency overhead?">
          <p>On Solana with optimistic verification, the full 402 round-trip including settlement is typically 50–100ms of overhead. With pessimistic finality, expect 400–800ms. For latency-sensitive workloads, use optimistic mode.</p>
        </QA>
        <QA q="What happens if my handler throws after payment is verified?">
          <p>The SDK automatically triggers an onchain refund and returns a typed <Mono>AstroHandlerError</Mono> to the caller. The original payment is reversed via the Solana program; the caller is never charged for a failed handler.</p>
        </QA>
        <QA q="How do I reconcile revenue?">
          <p>Use the reconciliation API or the receipts webhook. Both expose every settled call with its resource, scope, payer, amount, and Solana transaction signature. The dashboard provides a UI on top of the same data.</p>
        </QA>
      </DocSection>

      <DocSection id="compare" title="Comparisons">
        <QA q="How is this different from Stripe?">
          <p>Stripe operates a private ledger and a closed network of acquirers. Astro settles on Solana with publicly verifiable receipts. Stripe is the right answer for human checkout flows; Astro is the right answer for machine-to-machine commerce, programmable APIs, and verifiable per-call billing.</p>
        </QA>
        <QA q="How is this different from API keys?">
          <p>API keys are a static authorization that, once issued, can be used unlimitedly until revoked. Astro intents are single-use authorizations bound to an exact request. Keys leak; intents cannot be replayed. Keys require revocation; intents expire on their own.</p>
        </QA>
        <QA q="Why not just use a normal payment processor with metering?">
          <p>You can. But you'll be running an entitlement service, a metering pipeline, a billing engine, a dispute system, and a reconciliation tool — and your customers will still have to trust that your dashboard is accurate. Astro replaces that stack with one HTTP exchange and a Solana transaction.</p>
        </QA>
      </DocSection>

      <PageFooterNav prev={{ to: "/docs/agents", label: "Agent commerce" }} />
    </DocsLayout>
  );
}
