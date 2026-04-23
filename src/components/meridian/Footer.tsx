export function Footer() {
  const cols: { t: string; l: { label: string; href: string }[] }[] = [
    { t: "Product", l: [
      { label: "Protocol", href: "/protocol" },
      { label: "Console", href: "/console" },
      { label: "Pricing", href: "/pricing" },
      { label: "Changelog", href: "/changelog" },
    ]},
    { t: "Developers", l: [
      { label: "Documentation", href: "/docs" },
      { label: "Specification", href: "#" },
      { label: "SDKs", href: "#" },
      { label: "Examples", href: "#" },
    ]},
    { t: "Company", l: [
      { label: "About", href: "#" },
      { label: "Manifesto", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
    ]},
    { t: "Resources", l: [
      { label: "Security", href: "#" },
      { label: "Brand", href: "#" },
      { label: "Status", href: "#" },
      { label: "Contact", href: "#" },
    ]},
  ];
  return (
    <footer className="relative border-t border-border py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-[1.5fr_repeat(4,1fr)] gap-10">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="relative h-6 w-6">
                <div className="absolute inset-0 rounded-sm border border-accent/60" />
                <div className="absolute inset-1 bg-accent/80 rounded-[2px]" />
              </div>
              <span className="font-medium tracking-tight">Meridian</span>
            </div>
            <p className="text-[13px] text-muted-foreground max-w-xs leading-relaxed">
              Payment-native protocol layer for the internet. Programmable access, settled on Ethereum.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.t}>
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-4">{c.t}</div>
              <ul className="space-y-2.5 text-[13.5px]">
                {c.l.map((i) => (
                  <li key={i.label}><a href={i.href} className="text-foreground/80 hover:text-foreground transition-colors">{i.label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-muted-foreground">
          <div>© {new Date().getFullYear()} Meridian Labs. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Security</a>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]">v0.402 · ethereum</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
