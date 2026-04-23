import type { ReactNode } from "react";

export function DocSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-16 scroll-mt-32 first:mt-0">
      <h2 className="text-[24px] font-medium tracking-tight mb-5 flex items-center gap-3 group">
        {title}
        <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 text-accent text-[14px] transition-opacity">#</a>
      </h2>
      <div className="space-y-5 text-[15px] leading-relaxed text-muted-foreground [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}

export function Mono({ children }: { children: ReactNode }) {
  return <code className="font-mono text-[13px] text-accent bg-surface/60 border border-border rounded px-1.5 py-0.5">{children}</code>;
}

export function Code({ lang, code }: { lang: string; code: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface/50 overflow-hidden my-2">
      <div className="flex items-center justify-between px-4 h-9 border-b border-border bg-background/60">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">{lang}</span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground hover:text-foreground transition-colors"
        >
          Copy
        </button>
      </div>
      <pre className="p-5 font-mono text-[12.5px] leading-[1.7] text-foreground/85 overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function Callout({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "muted" }) {
  const cls = tone === "accent"
    ? "border-accent/30 bg-accent/5"
    : "border-border bg-surface/40";
  return (
    <div className={`my-2 rounded-lg border ${cls} p-4 text-[14px] text-foreground/90 leading-relaxed`}>
      {children}
    </div>
  );
}

export function Params({ rows }: { rows: string[][] }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden my-2">
      {rows.map((r, i) => (
        <div key={i} className={`grid ${r.length === 3 ? "grid-cols-[160px_160px_1fr]" : "grid-cols-[120px_1fr]"} gap-4 px-4 py-3 text-[13px] border-b border-border last:border-0`}>
          {r.map((cell, j) => (
            <div key={j} className={j === 0 ? "font-mono text-accent" : j === 1 && r.length === 3 ? "font-mono text-muted-foreground" : "text-muted-foreground"}>
              {cell}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <header className="mb-12">
      <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent mb-4">{eyebrow}</div>
      <h1 className="text-[clamp(2rem,4vw,2.75rem)] leading-[1.05] tracking-[-0.025em] font-medium text-gradient">{title}</h1>
      <p className="mt-5 text-[16px] leading-relaxed text-muted-foreground max-w-2xl">{intro}</p>
    </header>
  );
}

export function PageFooterNav({ prev, next }: { prev?: { to: string; label: string }; next?: { to: string; label: string } }) {
  return (
    <div className="mt-20 pt-8 border-t border-border grid grid-cols-2 gap-4 text-[13px]">
      {prev ? (
        <a href={prev.to} className="group rounded-lg border border-border p-4 hover:border-accent/40 hover:bg-surface/40 transition-colors">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-1.5">← Previous</div>
          <div className="text-foreground group-hover:text-accent transition-colors">{prev.label}</div>
        </a>
      ) : <div />}
      {next ? (
        <a href={next.to} className="group rounded-lg border border-border p-4 text-right hover:border-accent/40 hover:bg-surface/40 transition-colors">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-1.5">Next →</div>
          <div className="text-foreground group-hover:text-accent transition-colors">{next.label}</div>
        </a>
      ) : <div />}
    </div>
  );
}
