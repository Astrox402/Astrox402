import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Nav } from "@/components/meridian/Nav";
import { Footer } from "@/components/meridian/Footer";

export const DOC_NAV = [
  {
    group: "Getting started",
    items: [
      { to: "/docs", label: "Introduction", exact: true },
      { to: "/docs/quickstart", label: "Quickstart", exact: true },
    ],
  },
  {
    group: "Protocol",
    items: [
      { to: "/docs/handshake", label: "The 402 handshake" },
      { to: "/docs/serve", label: "serve()" },
      { to: "/docs/pricing", label: "Pricing functions" },
      { to: "/docs/receipts", label: "Receipts & settlement" },
    ],
  },
  {
    group: "Clients",
    items: [
      { to: "/docs/clients", label: "SDK clients" },
    ],
  },
] as const;

export function DocsLayout({ children, onThisPage }: { children: ReactNode; onThisPage?: { id: string; label: string }[] }) {
  const { pathname } = useLocation();

  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <Nav />
      <div className="pt-16">
        <div className="border-b border-border bg-surface/30 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[13px]">
              <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <span className="text-muted-foreground/40">/</span>
              <Link to="/docs" className="text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
              {pathname !== "/docs" && (
                <>
                  <span className="text-muted-foreground/40">/</span>
                  <span>{currentLabel(pathname)}</span>
                </>
              )}
              <span className="ml-3 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.18em] border border-border rounded text-muted-foreground">v0.402</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button className="h-8 px-3 text-[12px] text-muted-foreground border border-border rounded-md hover:text-foreground transition-colors flex items-center gap-2">
                <span>Search docs</span>
                <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-background border border-border rounded">⌘K</kbd>
              </button>
              <a href="#" className="h-8 px-3 text-[12px] text-muted-foreground border border-border rounded-md hover:text-foreground transition-colors inline-flex items-center">GitHub ↗</a>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-14 grid lg:grid-cols-[220px_1fr_200px] gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8">
              {DOC_NAV.map((g) => (
                <div key={g.group}>
                  <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-3">{g.group}</div>
                  <ul className="space-y-1">
                    {g.items.map((i) => (
                      <li key={i.to}>
                        <Link
                          to={i.to}
                          activeOptions={{ exact: !!(i as { exact?: boolean }).exact }}
                          activeProps={{ className: "bg-surface text-foreground border-l border-accent" }}
                          inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                          className="block px-3 py-1.5 rounded-md text-[13.5px] transition-colors"
                        >
                          {i.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          <article className="min-w-0 max-w-2xl">{children}</article>

          <aside className="hidden xl:block">
            {onThisPage && onThisPage.length > 0 && (
              <div className="sticky top-28">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-3">On this page</div>
                <ul className="space-y-2 text-[12.5px]">
                  {onThisPage.map((i) => (
                    <li key={i.id}>
                      <a href={`#${i.id}`} className="text-muted-foreground hover:text-foreground transition-colors">{i.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
      <Footer />
    </main>
  );
}

function currentLabel(pathname: string): string {
  for (const g of DOC_NAV) {
    for (const i of g.items) {
      if (i.to === pathname) return i.label;
    }
  }
  return "";
}
