import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/meridian/PageLayout";

export const Route = createFileRoute("/manifesto")({
  component: ManifestoPage,
});

const SECTIONS = [
  {
    num: "I",
    title: "The internet is not built for money.",
    body: `HTTP has verbs for reading and writing. It has headers for authentication. It has status codes for errors, redirects, and rate limits. It has no primitive for payment.

The 402 status code — Payment Required — was reserved in 1991. Thirty-five years later, it remains unimplemented. Every API that needs to charge money invents its own private billing stack. API keys checked against a database. Stripe webhooks updating entitlement tables. Reconciliation pipelines running at midnight. Weeks of engineering for infrastructure that has nothing to do with the actual product.

This is not an accident. It reflects a genuine gap: the internet was built without a settlement layer. There was no programmable money to settle with.`,
  },
  {
    num: "II",
    title: "Solana closed the gap.",
    body: `Solana is the first neutral, programmable, public settlement layer. Its assets are the first assets that software can transact with natively — no bank API, no merchant account, no acquirer. A program is a payment processor that no one controls and anyone can verify.

The combination of a standard HTTP status code that reserved the right concept and an onchain settlement layer that makes that concept concrete creates an opportunity that didn't exist before: a real implementation of 402.

Astro is that implementation.`,
  },
  {
    num: "III",
    title: "Access and payment should be one request.",
    body: `The payment-native web does not need a separate billing system. It needs a protocol where access and payment are the same request.

A caller requests a resource. If the resource costs money, the server returns a price. The caller signs a payment intent. The server settles the intent and runs the handler. The response includes a receipt. Four steps, one request lifecycle. No separate billing API. No entitlement table. No reconciliation pipeline.

The chain is the source of truth. Receipts are public. Anyone can verify any payment without trusting the infrastructure.`,
  },
  {
    num: "IV",
    title: "Open infrastructure is worth more than closed infrastructure.",
    body: `A payment layer that any company controls is a bottleneck. A payment layer that no company controls is infrastructure.

Astro's wire spec is public. Its contracts are deployed on open chains and verified onchain. Its SDKs are source-available. No part of the protocol is gated behind Astro's services. If Astro disappeared tomorrow, every endpoint built on Astro would still work. Every receipt would still verify. Every settlement would still settle.

This is not altruism. It is the correct engineering decision. Infrastructure that doesn't require trust is more valuable than infrastructure that does.`,
  },
  {
    num: "V",
    title: "The agent economy needs this more than the human economy.",
    body: `Autonomous software — LLM agents, workflow orchestrators, automated trading systems — needs to transact with other software. The current payment infrastructure assumes a human in the loop: a person who can log into a billing dashboard, approve a charge, manage an API key.

Autonomous agents can't do any of that. They need identities that carry provable spend authority, budgets that are enforced at the protocol level, and receipts that prove what was purchased and at what price.

Astro was designed from the start for this future. Agent identities, budget policies, and programmatic receipts are first-class protocol features — not afterthoughts bolted on for the AI use case.`,
  },
  {
    num: "VI",
    title: "We are building for a generation.",
    body: `The payment-native web will not be built in a quarter. It requires contracts to be deployed, audited, and trusted. It requires SDKs to be adopted by developers. It requires the mental model — one request, cryptographic proof, onchain receipt — to become the default instead of the exception.

We are not in a hurry to capture a market. We are in the business of making a primitive. Primitives compound slowly and then all at once.

The 402 status code has been waiting 35 years for a real implementation. We intend to ship one.`,
  },
];

function ManifestoPage() {
  return (
    <PageLayout
      eyebrow="Manifesto"
      title="The payment-native web."
      intro="Why we built Astro, and why we think the internet has been missing something fundamental since 1991."
    >
      <div className="max-w-2xl space-y-20">
        {SECTIONS.map((s, i) => (
          <div key={s.num} className={i > 0 ? "border-t border-border pt-20" : ""}>
            <div className="text-[11px] font-mono tracking-[0.22em] text-accent mb-5">{s.num}</div>
            <h2 className="text-[26px] font-medium tracking-tight mb-6">{s.title}</h2>
            <div className="space-y-4">
              {s.body.split("\n\n").map((para, j) => (
                <p key={j} className="text-[15px] text-muted-foreground leading-[1.8]">{para}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-20 mt-20 max-w-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-[22px] font-medium mb-1">Ready to build on it?</h2>
            <p className="text-[14px] text-muted-foreground">The protocol is open. The SDKs are published. The contracts are live.</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to="/about" className="inline-flex h-10 items-center px-5 rounded-md border border-border text-[13.5px] text-muted-foreground hover:text-foreground transition-colors">
              About us
            </Link>
            <Link to="/docs" className="inline-flex h-10 items-center px-5 rounded-md bg-foreground text-background text-[13.5px] font-medium hover:bg-foreground/90 transition-colors">
              Read the docs →
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
