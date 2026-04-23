export function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/60 backdrop-blur-xl bg-background/70">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <div className="relative h-6 w-6">
            <div className="absolute inset-0 rounded-sm border border-accent/60" />
            <div className="absolute inset-1 bg-accent/80 rounded-[2px]" />
          </div>
          <span className="font-medium tracking-tight text-[15px]">Meridian</span>
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono tracking-wider text-muted-foreground border border-border rounded">
            x402
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-[13.5px] text-muted-foreground">
          <a href="#protocol" className="hover:text-foreground transition-colors">Protocol</a>
          <a href="#flow" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#usecases" className="hover:text-foreground transition-colors">Use cases</a>
          <a href="#ethereum" className="hover:text-foreground transition-colors">Ethereum</a>
          <a href="#docs" className="hover:text-foreground transition-colors">Docs</a>
        </nav>
        <div className="flex items-center gap-2">
          <a href="#waitlist" className="hidden sm:inline-flex h-9 items-center px-3.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            Sign in
          </a>
          <a href="#waitlist" className="inline-flex h-9 items-center px-4 rounded-md bg-foreground text-background text-[13px] font-medium hover:bg-foreground/90 transition-colors">
            Request access
          </a>
        </div>
      </div>
    </header>
  );
}
