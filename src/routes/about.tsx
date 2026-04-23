import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/meridian/PageLayout";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

const VALUES = [
  {
    title: "Neutral infrastructure",
    desc: "A payment layer that no single company controls is more valuable than one that any company does. We build in public, spec in public, and contract in public.",
  },
  {
    title: "Boring cryptography",
    desc: "We use the most widely reviewed, most widely deployed primitives: EIP-712, ECDSA, ERC-20. No exotic schemes. No proprietary chains. No new token.",
  },
  {
    title: "Receipts, not promises",
    desc: "Every settled call produces a publicly verifiable onchain receipt. Our users don't have to trust Meridian — they can verify every payment independently.",
  },
  {
    title: "Protocol first",
    desc: "Meridian's value lives in the open spec and the onchain contracts, not in our managed infrastructure. If we disappeared tomorrow, every endpoint built on Meridian would still work.",
  },
];

const TEAM = [
  { name: "Adriana Reyes", role: "Co-founder & CEO", bg: "from-accent/20 to-accent/5" },
  { name: "Marcus Okafor", role: "Co-founder & CTO", bg: "from-violet-500/20 to-violet-500/5" },
  { name: "Selin Çelik", role: "Protocol Engineer", bg: "from-emerald-500/20 to-emerald-500/5" },
  { name: "James Luo", role: "SDK Engineer", bg: "from-amber-500/20 to-amber-500/5" },
  { name: "Priya Nair", role: "Product Design", bg: "from-pink-500/20 to-pink-500/5" },
  { name: "Tobias Wren", role: "DevRel & Docs", bg: "from-accent/20 to-accent/5" },
];

function AboutPage() {
  return (
    <PageLayout
      eyebrow="About"
      title="We're building the payment layer the internet was always missing."
      intro="Meridian Labs is a small, technical team that believes programmable, verifiable, open payment infrastructure should be a primitive — not a product feature."
    >
      <div className="border-t border-border pt-20 mb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-6">Our story</div>
            <div className="space-y-5 text-[15px] text-muted-foreground leading-relaxed">
              <p>
                Meridian grew out of a frustration we shared across too many teams: every API that needed to charge money ended up with the same bespoke billing stack — API keys, Stripe integrations, entitlement tables, reconciliation pipelines. Weeks of engineering for infrastructure that has nothing to do with the actual product.
              </p>
              <p>
                The HTTP 402 status code has been reserved for "Payment Required" since 1991. Nobody ever shipped a real implementation because there was no programmable settlement layer to back it. Ethereum changed that. We spent a year figuring out what a correct, minimal, open implementation actually looks like.
              </p>
              <p>
                The result is Meridian: a protocol that makes access and payment the same request, with cryptographic proof that the payment happened, and no infrastructure beyond the chain.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-surface/20 p-5">
                <h3 className="text-[14px] font-medium mb-2">{v.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-20 mb-20">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-10">The team</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEAM.map((m) => (
            <div key={m.name} className="rounded-2xl border border-border bg-surface/20 p-6 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${m.bg} flex-shrink-0`} />
              <div>
                <div className="text-[15px] font-medium">{m.name}</div>
                <div className="text-[13px] text-muted-foreground">{m.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-[22px] font-medium mb-1">Come build with us.</h2>
            <p className="text-[14px] text-muted-foreground">We're hiring protocol engineers, SDK engineers, and a DevRel lead.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/manifesto" className="inline-flex h-10 items-center px-5 rounded-md border border-border text-[13.5px] text-muted-foreground hover:text-foreground transition-colors">
              Read the manifesto
            </Link>
            <Link to="/careers" className="inline-flex h-10 items-center px-5 rounded-md bg-foreground text-background text-[13.5px] font-medium hover:bg-foreground/90 transition-colors">
              Open roles →
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
