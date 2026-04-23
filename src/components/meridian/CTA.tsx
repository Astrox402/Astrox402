import { useState } from "react";

export function CTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="waitlist" className="relative py-32 border-t border-border">
      <div className="mx-auto max-w-4xl px-6">
        <div className="relative rounded-3xl border border-border bg-surface/40 p-12 md:p-16 text-center overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px scan-line" />
          <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 h-64 w-[600px] rounded-full bg-accent/10 blur-[100px]" />

          <div className="relative">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent mb-5">Early access</div>
            <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] tracking-[-0.025em] font-medium text-gradient">
              Build on the payment-<br />native internet.
            </h2>
            <p className="mt-6 text-[16px] text-muted-foreground max-w-lg mx-auto">
              We're onboarding a small group of teams shipping APIs, agents, and infrastructure. Join the waitlist for protocol access and developer credits.
            </p>

            <form
              onSubmit={(e) => { e.preventDefault(); if (email) setSubmitted(true); }}
              className="mt-10 max-w-md mx-auto flex flex-col sm:flex-row gap-2"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="flex-1 h-12 px-4 rounded-md bg-background border border-border text-[14px] placeholder:text-muted-foreground/60 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition"
              />
              <button
                type="submit"
                className="h-12 px-6 rounded-md bg-foreground text-background text-[14px] font-medium hover:bg-foreground/90 transition-all hover:-translate-y-px"
              >
                {submitted ? "✓ Requested" : "Request access"}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-center gap-6 text-[12px] text-muted-foreground">
              <a href="#docs" className="hover:text-foreground transition-colors">Read the protocol →</a>
              <span className="opacity-40">·</span>
              <a href="#" className="hover:text-foreground transition-colors">Talk to the team</a>
            </div>

            <div className="mt-8 text-[12px] text-muted-foreground/70">
              Audited contracts. Open specification. No lock-in.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
