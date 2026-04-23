import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/meridian/PageLayout";

export const Route = createFileRoute("/careers")({
  component: CareersPage,
});

const ROLES = [
  {
    title: "Protocol Engineer",
    team: "Protocol",
    type: "Full-time · Remote",
    desc: "Own the core spec — intent encoding, settlement contract upgrades, receipt anchoring, and replay protection. You'll work directly on the protocol layer, audit PRs against the spec, and drive the roadmap for new settlement chains.",
    reqs: ["Deep familiarity with EIP-712, ERC-20, and EVM internals", "Experience writing or auditing Solidity contracts", "Strong sense of cryptographic threat modelling", "Comfort reading and writing protocol specs"],
  },
  {
    title: "SDK Engineer — TypeScript",
    team: "Developer Experience",
    type: "Full-time · Remote",
    desc: "Own the TypeScript SDK from ergonomics to correctness. You'll shape the serve() API, the pricing function interface, the intent-signing client, and the receipt verifier — and write the examples that teach developers how to use all of it.",
    reqs: ["Production TypeScript experience", "Understanding of HTTP fundamentals", "Experience building SDKs or libraries used by other engineers", "Care for documentation and developer experience"],
  },
  {
    title: "DevRel Lead",
    team: "Developer Experience",
    type: "Full-time · Remote",
    desc: "Be the connective tissue between Meridian and the developer community. You'll write guides, run the Discord, speak at conferences, build relationships with API teams and agent developers, and feed real feedback back into the product.",
    reqs: ["Track record building developer communities", "Genuine interest in payment protocols and distributed systems", "Good technical writing", "Comfortable giving talks and running workshops"],
  },
  {
    title: "Infrastructure Engineer",
    team: "Platform",
    type: "Full-time · Remote",
    desc: "Own the hosted infrastructure: the verifier fleet, the receipt indexer, and the Console backend. You'll keep latency under 50ms, uptime over 99.98%, and the receipt indexer within 2 seconds of finality — at any scale.",
    reqs: ["Experience operating distributed systems at scale", "Familiarity with EVM RPC infrastructure", "Strong observability and on-call culture", "Ideally experience with Cloudflare Workers or similar edge platforms"],
  },
];

const PERKS = [
  ["Remote-first", "Work from anywhere. Async by default. Sync when it matters."],
  ["Equity", "Meaningful early-stage equity. We're building something real."],
  ["Hardware", "Whatever you need to do your best work."],
  ["Books & courses", "Uncapped learning budget. No approval required."],
  ["Protocol access", "Starter plan free for life. Builder plan on us while you're here."],
  ["Small team", "No layers. Direct impact on the product from day one."],
];

function CareersPage() {
  return (
    <PageLayout
      eyebrow="Careers"
      title="Build the payment layer for the internet."
      intro="We're a small, technical team working on a hard problem. We move carefully, write things down, and ship things that last. If that sounds good, read on."
    >
      <div className="border-t border-border pt-20 mb-20">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-10">Open roles</div>
        <div className="space-y-4">
          {ROLES.map((role) => (
            <details key={role.title} className="group rounded-2xl border border-border bg-surface/20 overflow-hidden hover:border-accent/30 transition-colors">
              <summary className="flex items-center justify-between px-7 py-5 cursor-pointer list-none">
                <div>
                  <div className="text-[17px] font-medium mb-1">{role.title}</div>
                  <div className="text-[12.5px] text-muted-foreground flex items-center gap-3">
                    <span className="font-mono">{role.team}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span>{role.type}</span>
                  </div>
                </div>
                <span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl flex-shrink-0 ml-4">+</span>
              </summary>
              <div className="px-7 pb-7 border-t border-border">
                <p className="text-[14px] text-muted-foreground leading-relaxed my-5">{role.desc}</p>
                <div className="text-[12px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3">We're looking for</div>
                <ul className="space-y-2 mb-6">
                  {role.reqs.map((r) => (
                    <li key={r} className="flex gap-3 text-[13.5px] text-muted-foreground">
                      <span className="text-accent mt-0.5">—</span>
                      {r}
                    </li>
                  ))}
                </ul>
                <a href="mailto:jobs@meridian.xyz" className="inline-flex h-9 items-center px-4 rounded-md bg-foreground text-background text-[13px] font-medium hover:bg-foreground/90 transition-colors">
                  Apply for this role →
                </a>
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-20 mb-20">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-10">What we offer</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PERKS.map(([title, desc]) => (
            <div key={title} className="rounded-2xl border border-border bg-surface/20 p-6">
              <div className="text-[15px] font-medium mb-2">{title}</div>
              <div className="text-[13.5px] text-muted-foreground leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-20">
        <div className="max-w-xl">
          <h2 className="text-[22px] font-medium mb-2">Don't see the right role?</h2>
          <p className="text-[14px] text-muted-foreground mb-6 leading-relaxed">
            We occasionally hire for roles we haven't posted yet. If you're deeply technical and genuinely excited about payment protocols, send us a note — we read everything.
          </p>
          <a href="mailto:jobs@meridian.xyz" className="inline-flex h-10 items-center px-5 rounded-md border border-border text-[13.5px] text-muted-foreground hover:text-foreground transition-colors">
            jobs@meridian.xyz →
          </a>
        </div>
      </div>
    </PageLayout>
  );
}
