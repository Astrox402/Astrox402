import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/meridian/PageLayout";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

const CHANNELS = [
  {
    title: "Developer support",
    desc: "Questions about the SDK, the protocol, or your integration. Community members and the team are both active here.",
    action: "Join Discord",
    href: "#",
    icon: "◈",
  },
  {
    title: "Security disclosures",
    desc: "Found a vulnerability? We respond within 48 hours. Please encrypt sensitive disclosures with our PGP key.",
    action: "security@meridian.xyz",
    href: "mailto:security@meridian.xyz",
    icon: "⬡",
  },
  {
    title: "Business & partnerships",
    desc: "Enterprise deployments, chain partnerships, integration opportunities, and press inquiries.",
    action: "hello@meridian.xyz",
    href: "mailto:hello@meridian.xyz",
    icon: "◎",
  },
  {
    title: "Careers",
    desc: "Interested in joining the team? We're hiring protocol engineers, SDK engineers, and a DevRel lead.",
    action: "View open roles",
    href: "/careers",
    icon: "◇",
  },
];

function ContactPage() {
  return (
    <PageLayout
      eyebrow="Contact"
      title="Get in touch."
      intro="We're a small team and we read everything. Pick the right channel for your question."
    >
      <div className="grid sm:grid-cols-2 gap-5 mb-20">
        {CHANNELS.map((c) => (
          <div key={c.title} className="rounded-2xl border border-border bg-surface/20 p-7 flex flex-col hover:border-accent/30 transition-colors">
            <div className="text-accent text-[22px] mb-4">{c.icon}</div>
            <h2 className="text-[18px] font-medium mb-2">{c.title}</h2>
            <p className="text-[13.5px] text-muted-foreground leading-relaxed flex-1 mb-6">{c.desc}</p>
            <a
              href={c.href}
              className="inline-flex h-9 items-center px-4 rounded-md border border-border text-[13px] text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors self-start"
            >
              {c.action} →
            </a>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-20 mb-20">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-8">Send a message</div>
        <div className="max-w-xl">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-mono uppercase tracking-[0.16em] text-muted-foreground mb-2">Name</label>
                <input type="text" className="w-full h-10 rounded-md border border-border bg-surface/40 px-4 text-[13.5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 transition-colors" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-[12px] font-mono uppercase tracking-[0.16em] text-muted-foreground mb-2">Email</label>
                <input type="email" className="w-full h-10 rounded-md border border-border bg-surface/40 px-4 text-[13.5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 transition-colors" placeholder="your@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-mono uppercase tracking-[0.16em] text-muted-foreground mb-2">Subject</label>
              <input type="text" className="w-full h-10 rounded-md border border-border bg-surface/40 px-4 text-[13.5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 transition-colors" placeholder="What's this about?" />
            </div>
            <div>
              <label className="block text-[12px] font-mono uppercase tracking-[0.16em] text-muted-foreground mb-2">Message</label>
              <textarea rows={5} className="w-full rounded-md border border-border bg-surface/40 px-4 py-3 text-[13.5px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/60 transition-colors resize-none" placeholder="Tell us what you're working on or what you need." />
            </div>
            <button type="submit" className="inline-flex h-10 items-center px-6 rounded-md bg-foreground text-background text-[13.5px] font-medium hover:bg-foreground/90 transition-colors">
              Send message
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-border pt-20">
        <div className="flex flex-wrap gap-8 text-[13.5px] text-muted-foreground">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] mb-2">Meridian Labs</div>
            <p className="leading-relaxed">Remote-first · Incorporated in Delaware</p>
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] mb-2">Response times</div>
            <p className="leading-relaxed">Security: 48 hours<br />General: 3–5 business days</p>
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.18em] mb-2">Community</div>
            <a href="#" className="text-accent hover:underline">Discord →</a>
            <span className="mx-2 text-muted-foreground/40">·</span>
            <a href="#" className="text-accent hover:underline">GitHub →</a>
            <span className="mx-2 text-muted-foreground/40">·</span>
            <a href="#" className="text-accent hover:underline">Twitter →</a>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
