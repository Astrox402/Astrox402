import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { getUser, signOut } from "@/lib/auth";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (!getUser()) throw redirect({ to: "/sign-in" });
  },
  component: DashboardLayout,
});

const NAV_ITEMS = [
  {
    label: "Overview",
    to: "/dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="5.5" height="5.5" rx="1"/>
        <rect x="9.5" y="1" width="5.5" height="5.5" rx="1"/>
        <rect x="1" y="9.5" width="5.5" height="5.5" rx="1"/>
        <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="1"/>
      </svg>
    ),
  },
  {
    label: "Resources",
    to: "/dashboard/resources",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 1.5C4.41 1.5 1.5 3.07 1.5 5s2.91 3.5 6.5 3.5S14.5 6.93 14.5 5 11.59 1.5 8 1.5z"/>
        <path d="M1.5 5v3.5C1.5 10.43 4.41 12 8 12s6.5-1.57 6.5-3.5V5"/>
        <path d="M1.5 8.5V12c0 1.93 2.91 3.5 6.5 3.5s6.5-1.57 6.5-3.5V8.5"/>
      </svg>
    ),
  },
  {
    label: "Payments",
    to: "/dashboard/payments",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="3.5" width="14" height="9" rx="1.5"/>
        <path d="M1 6.5h14"/>
        <path d="M4 10h2"/>
      </svg>
    ),
  },
  {
    label: "Developer",
    to: "/dashboard/developer",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 4.5L1.5 8 5 11.5M11 4.5L14.5 8 11 11.5M9 2.5L7 13.5"/>
      </svg>
    ),
  },
  {
    label: "Settings",
    to: "/dashboard/settings",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="2.5"/>
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.93 2.93l1.41 1.41M11.66 11.66l1.41 1.41M2.93 13.07l1.41-1.41M11.66 4.34l1.41-1.41"/>
      </svg>
    ),
  },
];

function SidebarLink({ item, collapsed }: { item: (typeof NAV_ITEMS)[0]; collapsed: boolean }) {
  const location = useLocation();
  const isActive = item.to === "/dashboard"
    ? location.pathname === "/dashboard" || location.pathname === "/dashboard/"
    : location.pathname.startsWith(item.to);

  return (
    <Link
      to={item.to as any}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 group relative ${
        isActive
          ? "bg-accent/10 text-accent"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-accent rounded-full" />
      )}
      <span className={`flex-shrink-0 ${isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground"} transition-colors`}>
        {item.icon}
      </span>
      {!collapsed && <span className="font-medium truncate">{item.label}</span>}
    </Link>
  );
}

function UserMenu({ onSignOut }: { onSignOut: () => void }) {
  const user = getUser()!;
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
      >
        <div className="h-7 w-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-[11px] font-mono font-bold text-accent flex-shrink-0">
          {user.avatar}
        </div>
        <div className="min-w-0">
          <div className="text-[12px] font-medium text-foreground truncate">{user.name}</div>
          <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
        </div>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="ml-auto flex-shrink-0 text-muted-foreground">
          <path d="M3 4.5L6 7.5L9 4.5"/>
        </svg>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface border border-border rounded-lg shadow-xl shadow-black/40 py-1 z-50">
          <Link to="/dashboard/settings" className="flex items-center gap-2 px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="2"/><path d="M6.5 1v1.5M6.5 10.5V12M1 6.5h1.5M10.5 6.5H12M2.4 2.4l1.06 1.06M9.54 9.54l1.06 1.06M2.4 10.6l1.06-1.06M9.54 3.46l1.06-1.06"/></svg>
            Settings
          </Link>
          <div className="border-t border-border my-1"/>
          <button
            onClick={() => { setOpen(false); onSignOut(); }}
            className="flex items-center gap-2 px-3 py-2 text-[12px] text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-colors w-full"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8.5 4.5L11.5 7.5L8.5 10.5M4.5 7.5h7M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h3"/></svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function DashboardLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const user = getUser()!;

  function handleSignOut() {
    signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside
        className={`flex-shrink-0 flex flex-col border-r border-border bg-[oklch(0.09_0.005_250)] transition-all duration-200 ${
          collapsed ? "w-14" : "w-56"
        }`}
      >
        <div className={`flex items-center h-14 border-b border-border px-3 gap-2.5 flex-shrink-0 ${collapsed ? "justify-center" : ""}`}>
          <Link to="/" className="flex items-center gap-2.5">
            <div className="relative h-6 w-6 flex-shrink-0">
              <div className="absolute inset-0 rounded-sm border border-accent/60" />
              <div className="absolute inset-1 bg-accent/80 rounded-[2px]" />
            </div>
            {!collapsed && (
              <>
                <span className="font-medium tracking-tight text-[14px]">Astro</span>
                <span className="px-1.5 py-0.5 text-[9px] font-mono tracking-wider text-muted-foreground border border-border rounded">x402</span>
              </>
            )}
          </Link>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 2L4 7l5 5"/></svg>
            </button>
          )}
        </div>

        {collapsed && (
          <div className="flex justify-center pt-2 pb-1">
            <button
              onClick={() => setCollapsed(false)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 2L10 7L5 12"/></svg>
            </button>
          </div>
        )}

        {!collapsed && (
          <div className="px-3 pt-4 pb-1">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-white/4 border border-border/60">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground flex-shrink-0">
                <circle cx="5" cy="5" r="3.5"/><path d="M8 8l2.5 2.5"/>
              </svg>
              <span className="text-[11px] text-muted-foreground/60">Quick search…</span>
              <span className="ml-auto text-[10px] font-mono text-muted-foreground/40 border border-border/40 rounded px-1">⌘K</span>
            </div>
          </div>
        )}

        <nav className="flex-1 px-2 pt-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.label} item={item} collapsed={collapsed} />
          ))}
        </nav>

        <div className="border-t border-border p-2">
          {collapsed ? (
            <div className="flex justify-center py-2">
              <div className="h-7 w-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-[11px] font-mono font-bold text-accent">
                {user.avatar}
              </div>
            </div>
          ) : (
            <UserMenu onSignOut={handleSignOut} />
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 flex-shrink-0 border-b border-border bg-[oklch(0.09_0.005_250)] flex items-center px-6 gap-4">
          <div className="flex-1 text-[13px] font-medium text-foreground truncate">
            {user.workspace}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-white/4 text-[11px] font-mono text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0"/>
              Solana Mainnet
            </div>
            <div className="h-7 w-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-[10px] font-mono font-bold text-accent cursor-pointer hover:bg-accent/30 transition-colors">
              {user.avatar}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
