import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { buildUserFromPrivy, setUser } from "@/lib/auth";

export const Route = createFileRoute("/sign-in")({
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const { ready, authenticated, user, login } = usePrivy();

  useEffect(() => {
    if (!ready) return;
    if (authenticated && user) {
      const localUser = buildUserFromPrivy(user as any);
      setUser(localUser);
      navigate({ to: "/dashboard" });
    }
  }, [ready, authenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,oklch(0.78_0.13_195_/_0.08),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center gap-2.5 justify-center mb-10">
          <div className="relative h-6 w-6">
            <div className="absolute inset-0 rounded-sm border border-accent/60" />
            <div className="absolute inset-1 bg-accent/80 rounded-[2px]" />
          </div>
          <span className="font-medium tracking-tight text-[15px]">Astro</span>
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono tracking-wider text-muted-foreground border border-border rounded">x402</span>
        </Link>

        <div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-sm p-8 shadow-2xl shadow-black/40">
          <h1 className="text-xl font-semibold mb-1">Sign in to your workspace</h1>
          <p className="text-sm text-muted-foreground mb-7">
            Connect with email, Google, GitHub, or your Solana wallet.
          </p>

          <button
            onClick={login}
            disabled={!ready}
            className="w-full h-11 rounded-lg bg-accent text-background text-[13px] font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2.5"
          >
            {!ready ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Loading…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7.5 1a6.5 6.5 0 100 13A6.5 6.5 0 007.5 1z"/>
                  <path d="M7.5 4v3.5l2.5 1.5"/>
                </svg>
                Continue
              </>
            )}
          </button>

          <div className="mt-5 pt-5 border-t border-border/60">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {[
                { label: "Email", icon: "✉" },
                { label: "Google", icon: "G" },
                { label: "GitHub", icon: "⌥" },
                { label: "Phantom", icon: "◎" },
              ].map(({ label, icon }) => (
                <div key={label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
                  <span className="font-mono">{icon}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-[12px] text-muted-foreground mt-6">
          Don't have an account?{" "}
          <a href="/#waitlist" className="text-accent/80 hover:text-accent transition-colors">Request access →</a>
        </p>
      </div>
    </div>
  );
}
