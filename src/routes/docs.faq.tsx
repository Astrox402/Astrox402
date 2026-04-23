import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, PageFooterNav, Mono } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Astro Docs" },
      { name: "description", content: "Frequently asked questions about the Astro payment-native protocol — pricing, chains, agents, security, and operations." },
      { property: "og:title", content: "FAQ — Astro Docs" },
      { property: "og:description", content: "Common questions about the Astro protocol, SDKs, and operations." },
    ],
  }),
  component: FaqPage,
});

const TOC = [
  { id: "general", label: "General" },
  { id: "pricing-q", label: "Pricing & fees" },
  { id: "chains", label: "Chains & assets" },
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
          <p>No. If you can write a fetch handler and read a function signature, you can ship a Astro endpoint. The protocol uses Solana for settlement, but the SDK abstracts every blockchain interaction. You declare a price in USDC, the SDK handles the rest.</p>
        </QA>
        <QA q="Is Astro a hosted service?">
          <p>Partially. The SDK and the settlement contracts are open-source and require no Astro-hosted infrastructure to operate. The dashboard, indexer, and reconciliation API are hosted conveniences; you can replace any of them with your own implementation against the public protocol.</p>
        </QA>
        <QA q="What does '402-inspired' mean?">
          <p>The HTTP status code 402 ("Payment Required") was reserved in the original HTTP spec but never standardized. Astro operationalizes it: a request without a valid payment intent receives 402 with a structured quote, and the client signs and retries. See <Mono>/docs/handshake</Mono>.</p>
        </QA>
      </DocSection>

      <DocSection id="pricing-q" title="Pricing & fees">
        <QA q="What does Astro charge?">
          <p>The protocol itself charges nothing — the SDK is free, the contracts take no fee, and you keep 100% of what your endpoints earn. Optional hosted services (dashboard, webhooks, premium support) are billed separately and never gate the core protocol.</p>
        </QA>
        <QA q="Do I have to use USDC?">
          <p>USDC is the default and recommended settlement asset because of its liquidity and stable accounting properties. Other SPL assets are supported per-resource at the provider's discretion; the caller's wallet is converted at quote time if needed.</p>
        </QA>
        <QA q="Can I do free tiers?">
          <p>Yes. Return a price of <Mono>0</Mono> from your price function for any request that should bypass payment — the handshake short-circuits and the handler runs immediately. This lets you mix free and paid behavior on the same endpoint without forking your code.</p>
        </QA>
      </DocSection>

      <DocSection id="chains" title="Chains & assets">
        <QA q="Which chains are supported?">
          <p>Solana at launch. Each resource declares its preferred settlement chain; callers can be on any supported chain and the SDK bridges automatically when needed.</p>
        </QA>
        <QA q="What about gas costs?">
          <p>On Solana, settlement gas is typically a fraction of a cent and is paid by the caller as part of the intent — providers never see a gas bill. On Solana, gas is higher and is amortized through batched settlement for high-volume resources.</p>
        </QA>
        <QA q="Can I add a new chain?">
          <p>The settlement contracts are minimal and Solana-native; deploying to a new Solana is a small, well-defined process. Non-Solanas require a custom verifier and are evaluated case-by-case.</p>
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
          <p>On Solana settlement chains, the full 402 round-trip including settlement is typically under 1.2 seconds. On Solana, it's bounded by block time (~400ms). For latency-sensitive workloads, prefer Solana.</p>
        </QA>
        <QA q="What happens if my handler throws after payment is verified?">
          <p>The SDK automatically triggers an onchain refund and returns a typed <Mono>AstroHandlerError</Mono> to the caller. The original payment is reversed in the same atomic settlement; the caller is never charged for a failed handler.</p>
        </QA>
        <QA q="How do I reconcile revenue?">
          <p>Use the reconciliation API or the receipts webhook. Both expose every settled call with its resource, scope, payer, amount, and onchain proof. The dashboard provides a UI on top of the same data.</p>
        </QA>
      </DocSection>

      <DocSection id="compare" title="Comparisons">
        <QA q="How is this different from Stripe?">
          <p>Stripe operates a private ledger and a closed network of acquirers. Astro operates an open protocol with public, onchain settlement. Stripe is the right answer for human checkout; Astro is the right answer for machine-to-machine commerce, programmable APIs, and verifiable settlement.</p>
        </QA>
        <QA q="How is this different from API keys?">
          <p>API keys are a static authorization that, once issued, can be used unlimitedly until revoked. Astro intents are single-use authorizations bound to an exact request. Keys leak; intents cannot be replayed. Keys require revocation; intents expire on their own.</p>
        </QA>
        <QA q="Why not just use a normal payment processor with metering?">
          <p>You can. But you'll be running an entitlement service, a metering pipeline, a billing engine, a dispute system, and a reconciliation tool — and your customers will still have to trust that your dashboard is accurate. Astro replaces that stack with one HTTP exchange and a public chain.</p>
        </QA>
      </DocSection>

      <PageFooterNav prev={{ to: "/docs/agents", label: "Agent commerce" }} />
    </DocsLayout>
  );
}
