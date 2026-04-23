import type { ReactNode } from "react";

export function SectionHeader({ eyebrow, title, intro, id }: { eyebrow: string; title: ReactNode; intro?: string; id?: string }) {
  return (
    <div id={id} className="max-w-3xl">
      <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent mb-5">{eyebrow}</div>
      <h2 className="text-[clamp(2rem,4.2vw,3.25rem)] leading-[1.05] tracking-[-0.025em] font-medium text-gradient">
        {title}
      </h2>
      {intro && <p className="mt-6 text-[17px] leading-relaxed text-muted-foreground max-w-2xl">{intro}</p>}
    </div>
  );
}

export function Hairline() {
  return <div className="hairline w-full" />;
}
