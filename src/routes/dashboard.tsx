import { createFileRoute, Outlet, Link, useNavigate, useLocation, redirect } from "@tanstack/react-router";
import { usePrivy, useLogout, useWallets } from "@privy-io/react-auth";
import { getUser, buildUserFromPrivy, setUser, clearUser } from "@/lib/auth";
import { useEffect, useState } from "react";

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
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="1" y="1" width="5" height="5" rx="1"/>
        <rect x="9" y="1" width="5" height="5" rx="1"/>
        <rect x="1" y="9" width="5" height="5" rx="1"/>
        <rect x="9" y="9" width="5" height="5" rx="1"/>
      </svg>
    ),
  },
  {
    label: "Resources",
    to: "/dashboard/resources",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4">
        <ellipse cx="7.5" cy="4.5" rx="5.5" ry="2.5"/>
        <path d="M2 4.5v3C2 9.43 4.69 11 7.5 11S13 9.43 13 7.5V4.5"/>
        <path d="M2 7.5v3C2 12.43 4.69 14 7.5 14S13 12.43 13 10.5v-3"/>
      </svg>
    ),
  },
  {
    label: "Payments",
    to: "/dashboard/payments",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="1" y="3" width="13" height="9" rx="1.5"/>
        <path d="M1 6.5h13"/>
        <path d="M4 10h2"/>
      </svg>
    ),
  },
  {
    label: "Developer",
    to: "/dashboard/developer",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M4.5 4L1 7.5 4.5 11M10.5 4L14 7.5 10.5 11M8.5 2L6.5 13"/>
      </svg>
    ),
  },
  {
    label: "Settings",
    to: "/dashboard/settings",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4">
        <circle cx="7.5" cy="7.5" r="2"/>
        <path d="M7.5 1v1.5M7.5 12.5V14M1 7.5h1.5M12.5 7.5H14M2.7 2.7l1.06 1.06M11.24 11.24l1.06 1.06M2.7 12.3l1.06-1.06M11.24 3.76l1.06-1.06"/>
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
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 group relative ${
        collapsed ? "justify-center" : ""
      } ${
        isActive
          ? "bg-accent/10 text-accent"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
      }`}
    >
      {isActive && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-accent rounded-full" />
      )}
      <span className={`flex-shrink-0 transition-colors ${isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground"}`}>
        {item.icon}
      </span>
      {!collapsed && <span className="font-medium">{item.label}</span>}
    </Link>
  );
}

function TopbarProfileMenu({ displayName, displayEmail, avatarInitials, onSignOut }: {
  displayName: string;
  displayEmail: string;
  avatarInitials: string;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-lg hover:bg-white/6 transition-colors"
      >
        <div className="h-6 w-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-[10px] font-mono font-bold text-accent flex-shrink-0">
          {avatarInitials}
        </div>
        <span className="text-[12px] text-foreground font-medium hidden sm:block">{displayName}</span>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
          <path d="M2 4L5.5 7.5L9 4"/>
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 w-52 bg-[oklch(0.11_0.005_250)] border border-border rounded-xl shadow-2xl shadow-black/50 py-1.5 z-50">
            <div className="px-3 py-2 border-b border-border mb-1">
              <div className="text-[12px] font-medium text-foreground">{displayName}</div>
              <div className="text-[11px] text-muted-foreground truncate">{displayEmail}</div>
            </div>
            <Link
              to="/dashboard"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="1" y="1" width="4.5" height="4.5" rx="0.8"/><rect x="7.5" y="1" width="4.5" height="4.5" rx="0.8"/><rect x="1" y="7.5" width="4.5" height="4.5" rx="0.8"/><rect x="7.5" y="7.5" width="4.5" height="4.5" rx="0.8"/></svg>
              Overview
            </Link>
            <Link
              to="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="6.5" cy="6.5" r="2"/><path d="M6.5 1v1.5M6.5 10v1.5M1 6.5h1.5M10 6.5h1.5M2.4 2.4l1.06 1.06M9.54 9.54l1.06 1.06M2.4 10.6l1.06-1.06M9.54 3.46l1.06-1.06"/></svg>
              Settings
            </Link>
            <div className="border-t border-border mt-1 pt-1">
              <button
                onClick={() => { setOpen(false); onSignOut(); }}
                className="flex items-center gap-2.5 px-3 py-2 text-[12px] text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-colors w-full"
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8.5 4.5L11.5 7.5L8.5 10.5M4.5 7.5h7M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h3"/></svg>
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DashboardLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const { ready, authenticated, user } = usePrivy();
  const { logout } = useLogout({ onSuccess: () => {
    clearUser();
    navigate({ to: "/" });
  }});
  const { wallets } = useWallets();
  const solanaWallets = wallets.filter((w) => w.walletClientType?.toLowerCase().includes("solana"));

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      clearUser();
      navigate({ to: "/sign-in" });
      return;
    }
    if (user) {
      const localUser = buildUserFromPrivy(user as any);
      setUser(localUser);
    }
  }, [ready, authenticated, user, navigate]);

  const localUser = getUser();

  const displayName = (() => {
    if (!user) return localUser?.name ?? "User";
    if (user.google?.name) return user.google.name;
    if (user.github?.name) return user.github.name;
    const email = user.email?.address ?? user.google?.email ?? user.github?.email;
    if (email) return email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const wallet = user.wallet?.address;
    if (wallet) return `${wallet.slice(0, 4)}…${wallet.slice(-4)}`;
    return "Astro User";
  })();

  const displayEmail = (() => {
    if (!user) return localUser?.email ?? "";
    return (
      user.email?.address ??
      user.google?.email ??
      user.github?.email ??
      user.wallet?.address ??
      ""
    );
  })();

  const avatarInitials = displayName.slice(0, 2).toUpperCase();

  const workspaceName = localUser?.workspace ?? `${displayEmail.split("@")[0] || "workspace"}-workspace`;

  const primarySolanaWallet = solanaWallets[0];
  const walletDisplay = primarySolanaWallet
    ? `${primarySolanaWallet.address.slice(0, 4)}…${primarySolanaWallet.address.slice(-4)}`
    : null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className={`flex-shrink-0 flex flex-col border-r border-border bg-[oklch(0.09_0.005_250)] transition-all duration-200 ${collapsed ? "w-14" : "w-56"}`}>

        {/* Logo */}
        <div className={`flex items-center h-14 border-b border-border px-3 gap-2.5 flex-shrink-0 ${collapsed ? "justify-center" : ""}`}>
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
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
            <button onClick={() => setCollapsed(true)} className="ml-auto text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 2L4 7l5 5"/></svg>
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="flex justify-center pt-3 pb-1">
            <button onClick={() => setCollapsed(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-md hover:bg-white/5">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 2L10 7L5 12"/></svg>
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 pt-4 space-y-0.5 overflow-y-auto">
          {!collapsed && (
            <div className="px-2.5 mb-3 text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground/50">Menu</div>
          )}
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.label} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Sidebar footer */}
        {!collapsed && (
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="h-5 w-5 rounded-sm bg-accent/20 border border-accent/30 flex items-center justify-center text-[9px] font-mono font-bold text-accent flex-shrink-0">
                {workspaceName.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-medium text-foreground truncate">{workspaceName}</div>
                <div className="text-[10px] text-muted-foreground">Free plan</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Topbar ── */}
        <header className="h-14 flex-shrink-0 border-b border-border bg-[oklch(0.09_0.005_250)] flex items-center px-5 gap-4">

          {/* Workspace name */}
          <div className="flex items-center gap-2 mr-2">
            <span className="text-[13px] font-medium text-foreground">{workspaceName}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/40"><path d="M3 4.5L6 7.5L9 4.5"/></svg>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs">
            <div className="flex items-center gap-2 h-8 px-3 rounded-lg bg-white/4 border border-border/70 hover:border-border transition-colors cursor-text">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground flex-shrink-0">
                <circle cx="5" cy="5" r="3.5"/><path d="M8 8l2.5 2.5"/>
              </svg>
              <span className="text-[12px] text-muted-foreground/50 flex-1">Search resources, payments…</span>
              <span className="text-[10px] font-mono text-muted-foreground/30 border border-border/40 rounded px-1 flex-shrink-0">⌘K</span>
            </div>
          </div>

          <div className="flex-1" />

          {/* Wallet / network badge */}
          <div className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-white/4 text-[11px] font-mono text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0 animate-pulse"/>
            <span className="hidden sm:inline">Solana Mainnet</span>
            <span className="sm:hidden">SOL</span>
            {walletDisplay && (
              <>
                <span className="ml-1 text-muted-foreground/40">·</span>
                <span className="text-emerald-400/80 font-mono">{walletDisplay}</span>
              </>
            )}
          </div>

          {/* Profile menu */}
          <TopbarProfileMenu
            displayName={displayName}
            displayEmail={displayEmail}
            avatarInitials={avatarInitials}
            onSignOut={logout}
          />
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
