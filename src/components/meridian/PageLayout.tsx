import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function PageLayout({
  eyebrow,
  title,
  intro,
  children,
  centered = false,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: string;
  children?: ReactNode;
  centered?: boolean;
}) {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <Nav />
      <div className="pt-32 pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className={`max-w-3xl mb-20 ${centered ? "mx-auto text-center" : ""}`}>
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent mb-5">{eyebrow}</div>
            <h1 className="text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] tracking-[-0.03em] font-medium text-gradient">
              {title}
            </h1>
            {intro && (
              <p className={`mt-6 text-[17px] leading-relaxed text-muted-foreground ${centered ? "" : "max-w-2xl"}`}>
                {intro}
              </p>
            )}
          </div>
          {children}
        </div>
      </div>
      <Footer />
    </main>
  );
}

export function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border-t border-border pt-20 mb-20 ${className}`}>{children}</div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-8">
      {children}
    </div>
  );
}

export function Card({ children, highlight = false }: { children: ReactNode; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-7 ${highlight ? "border-accent/40 bg-accent/5" : "border-border bg-surface/20"} hover:border-accent/30 transition-colors`}>
      {children}
    </div>
  );
}
