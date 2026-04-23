import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/meridian/PageLayout";

export const Route = createFileRoute("/blog")({
  component: BlogPage,
});

const POSTS = [
  {
    date: "Apr 18, 2026",
    tag: "Engineering",
    title: "How we designed the Meridian pricing function API",
    excerpt: "Pricing logic is the most application-specific part of a paid endpoint. Here's how we landed on a composable, testable function API that covers 90% of use cases without sacrificing flexibility for the rest.",
    readTime: "9 min read",
  },
  {
    date: "Apr 9, 2026",
    tag: "Protocol",
    title: "Arbitrum support: why L2 settlement changes the economics of micropayments",
    excerpt: "With Arbitrum settlement live, the minimum viable payment on Meridian is now a fraction of a cent in gas. That changes which use cases are worth building. We explain the math and what it unlocks.",
    readTime: "7 min read",
  },
  {
    date: "Mar 28, 2026",
    tag: "Announcements",
    title: "Console public beta: receipt explorer, CSV export, and access policies",
    excerpt: "Console is now in public beta. Here's what's in the release: a full-text receipt explorer, bulk CSV export, batch onchain verification, and access policies — all live today.",
    readTime: "5 min read",
  },
  {
    date: "Mar 14, 2026",
    tag: "Announcements",
    title: "Meridian public beta: what shipped and what's next",
    excerpt: "We're open. TypeScript and Python SDKs are live. Ethereum, Base, and Optimism settlement is available. The spec is public. Here's a full breakdown of v0.402.0 and the roadmap through the rest of the year.",
    readTime: "12 min read",
  },
  {
    date: "Feb 21, 2026",
    tag: "Engineering",
    title: "EIP-712 in practice: lessons from 18 months of intent signing",
    excerpt: "EIP-712 is the right foundation for Meridian's signing scheme, but the details matter. We learned several non-obvious things building a production implementation. Here's what we'd do differently — and what we got right.",
    readTime: "11 min read",
  },
  {
    date: "Feb 7, 2026",
    tag: "Vision",
    title: "Agents need money: the design space for autonomous economic identities",
    excerpt: "LLM agents already purchase API capacity on behalf of users. The infrastructure assumes a human backstop. We think that assumption breaks down at scale, and we explore what a correct, protocol-level solution looks like.",
    readTime: "14 min read",
  },
];

const TAG_STYLE: Record<string, string> = {
  Engineering: "bg-accent/10 text-accent border-accent/20",
  Protocol: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Announcements: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Vision: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

function BlogPage() {
  return (
    <PageLayout
      eyebrow="Blog"
      title="Writing from the Meridian team."
      intro="Protocol design, engineering decisions, announcements, and thinking about the payment-native web."
    >
      <div className="grid lg:grid-cols-3 gap-5 mb-20">
        {POSTS.map((post, i) => (
          <a
            key={post.title}
            href="#"
            className={`rounded-2xl border border-border bg-surface/20 p-7 flex flex-col hover:border-accent/30 hover:bg-surface/40 transition-colors ${i === 0 ? "lg:col-span-2" : ""}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[11px] font-mono text-muted-foreground">{post.date}</span>
              <span className={`text-[10.5px] font-mono uppercase tracking-[0.14em] border rounded px-2 py-0.5 ${TAG_STYLE[post.tag] ?? "border-border text-muted-foreground"}`}>
                {post.tag}
              </span>
            </div>
            <h2 className={`font-medium mb-3 leading-snug ${i === 0 ? "text-[22px]" : "text-[17px]"}`}>{post.title}</h2>
            <p className="text-[13.5px] text-muted-foreground leading-relaxed flex-1 mb-5">{post.excerpt}</p>
            <div className="text-[12px] font-mono text-muted-foreground/60">{post.readTime}</div>
          </a>
        ))}
      </div>

      <div className="border-t border-border pt-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-[22px] font-medium mb-1">Stay in the loop.</h2>
            <p className="text-[14px] text-muted-foreground">New posts are rare and worth reading. No noise.</p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="h-10 rounded-md border border-border bg-surface/40 px-4 text-[13.5px] text-foreground placeholder:text-muted-foreground flex-1 sm:w-56 focus:outline-none focus:border-accent/60 transition-colors"
            />
            <button className="h-10 px-5 rounded-md bg-foreground text-background text-[13.5px] font-medium hover:bg-foreground/90 transition-colors flex-shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
