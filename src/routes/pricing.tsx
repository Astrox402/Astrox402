import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/meridian/Nav";
import { Footer } from "@/components/meridian/Footer";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "For developers exploring the protocol. No card required.",
    highlight: false,
    cta: "Get started",
    ctaHref: "#waitlist",
    features: [
      "Up to 10,000 settled calls / month",
      "Ethereum mainnet + Base",
      "USDC settlement",
      "Onchain receipt log",
      "TypeScript SDK",
      "Community support",
    ],
  },
  {
    name: "Builder",
    price: "$49",
    period: "/ month",
    desc: "For production teams shipping paid APIs and agents.",
    highlight: true,
    cta: "Request access",
    ctaHref: "#waitlist",
    features: [
      "Up to 1M settled calls / month",
      "All 4 chains (L1 + L2)",
      "USDC, USDT, ETH",
      "Advanced receipt search & export",
      "Pricing playground",
      "Access policies & per-caller caps",
      "API keys & team management",
      "Email support",
    ],
  },
  {
    name: "Scale",
    price: "Custom",
    period: "",
    desc: "For high-volume operators and enterprise deployments.",
    highlight: false,
    cta: "Talk to us",
    ctaHref: "#waitlist",
    features: [
      "Unlimited settled calls",
      "Custom chain support",
      "Custom asset support",
      "SLA + uptime guarantee",
      "Dedicated verifier infrastructure",
      "Warehouse / data pipeline integration",
      "White-glove onboarding",
      "Dedicated Slack support",
    ],
  },
];

const FAQS = [
  {
    q: "What does Astro charge on top of settlement?",
    a: "Nothing per transaction. Astro charges a flat monthly platform fee for Console access and infrastructure. The settlement amount your endpoint receives goes directly to your wallet — Astro takes no cut of the payment.",
  },
  {
    q: "Who pays gas fees?",
    a: "Gas is paid by the caller's wallet at settlement time. On L2 chains (Base, Optimism, Arbitrum) gas costs are negligible — typically fractions of a cent per settlement.",
  },
  {
    q: "Can I start on Starter and upgrade?",
    a: "Yes. Starter is free with no time limit. When you outgrow the 10,000 call ceiling, you can upgrade to Builder without losing any data or changing your endpoint code.",
  },
  {
    q: "Is the protocol itself free?",
    a: "The protocol is open and free. You can implement the wire spec yourself, run your own verifier, and never pay Astro anything. The platform fee covers Console, hosted verification, and managed infrastructure — not protocol access.",
  },
];

function PricingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <Nav />

      <div className="pt-32 pb-24">
        <div className="mx-auto max-w-7xl px-6">

          <div className="text-center max-w-2xl mx-auto mb-20">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent mb-5">Pricing</div>
            <h1 className="text-[clamp(2.5rem,5vw,3.75rem)] leading-[1.05] tracking-[-0.03em] font-medium text-gradient">
              Simple, honest pricing.
            </h1>
            <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">
              No revenue share. No per-transaction fees. Pay for the platform — keep everything your endpoints earn.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-5 mb-24">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 flex flex-col ${plan.highlight ? "border-accent/50 bg-accent/5 relative" : "border-border bg-surface/20"}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-background text-[11px] font-mono uppercase tracking-[0.16em]">
                    Most popular
                  </div>
                )}
                <div className="mb-6">
                  <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-3">{plan.name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-[3rem] font-medium tracking-tight leading-none">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground text-[15px]">{plan.period}</span>}
                  </div>
                  <p className="mt-3 text-[13.5px] text-muted-foreground">{plan.desc}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[13.5px] text-foreground/85">
                      <span className="mt-0.5 text-accent flex-shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.ctaHref}
                  className={`inline-flex h-10 items-center justify-center px-5 rounded-md text-[13.5px] font-medium transition-colors ${plan.highlight ? "bg-foreground text-background hover:bg-foreground/90" : "border border-border text-muted-foreground hover:text-foreground"}`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-20 mb-20">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-10">Frequently asked questions</div>
            <div className="grid sm:grid-cols-2 gap-8 max-w-4xl">
              {FAQS.map((faq) => (
                <div key={faq.q}>
                  <h3 className="text-[15px] font-medium mb-2">{faq.q}</h3>
                  <p className="text-[13.5px] text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-[22px] font-medium mb-1">Still have questions?</h2>
                <p className="text-[14px] text-muted-foreground">Read the protocol docs or reach out — we're happy to talk through your use case.</p>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/docs" className="inline-flex h-10 items-center px-5 rounded-md border border-border text-[13.5px] text-muted-foreground hover:text-foreground transition-colors">
                  Read the docs
                </Link>
                <a href="#waitlist" className="inline-flex h-10 items-center px-5 rounded-md bg-foreground text-background text-[13.5px] font-medium hover:bg-foreground/90 transition-colors">
                  Contact us
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
