import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { getUser } from "@/lib/auth";
import { api, type ApiKey, type ApiResource } from "@/lib/api";

export const Route = createFileRoute("/dashboard/developer")({
  component: DeveloperPage,
});

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-foreground/20"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

function CodeBlock({ code, lang = "typescript" }: { code: string; lang?: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/80 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/60">
        <span className="text-[10px] font-mono text-muted-foreground">{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="p-4 text-[12px] font-mono text-foreground/80 leading-relaxed overflow-x-auto whitespace-pre">{code}</pre>
    </div>
  );
}

function expiryStatus(expires_at: string | null): { label: string; color: string } | null {
  if (!expires_at) return null;
  const diff = new Date(expires_at).getTime() - Date.now();
  if (diff < 0) return { label: "Expired", color: "text-red-400 border-red-500/20 bg-red-500/8" };
  if (diff < 7 * 86400 * 1000) return { label: "Expiring soon", color: "text-orange-400 border-orange-500/20 bg-orange-500/8" };
  return { label: new Date(expires_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }), color: "text-muted-foreground border-border bg-surface/40" };
}

const FLOW_STEPS = [
  { n: "1", label: "Request",       color: "border-accent/40 bg-accent/5 text-accent",           dot: "bg-accent",       desc: "Caller makes a standard HTTP request to your monetized endpoint.",          detail: "GET /v1/resource → server" },
  { n: "2", label: "402 Issued",    color: "border-yellow-500/40 bg-yellow-500/5 text-yellow-400", dot: "bg-yellow-400",   desc: "Server responds 402 Payment Required with payment terms in headers.",       detail: "X-Payment-Price: 0.002 USDC" },
  { n: "3", label: "Intent Signed", color: "border-purple-500/40 bg-purple-500/5 text-purple-400", dot: "bg-purple-400",   desc: "SDK signs a payment intent using Ed25519. No wallet popup — fully programmatic.", detail: "Ed25519 · ~5ms" },
  { n: "4", label: "Settled",       color: "border-accent/40 bg-accent/5 text-accent",           dot: "bg-accent",       desc: "Solana confirms payment. Server verifies on-chain and fulfills the request.", detail: "~400ms · on-chain proof" },
];

function KeyCard({ k, resources, onDelete }: { k: ApiKey; resources: ApiResource[]; onDelete: () => void }) {
  const [revealed, setRevealed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const scopes: string[] = (() => { try { return JSON.parse(k.scopes); } catch { return []; } })();
  const expiry = expiryStatus(k.expires_at);
  const usageLimit = Number(k.usage_limit) || 0;
  const usageCount = Number(k.usage_count) || 0;
  const usagePct = usageLimit > 0 ? Math.min(100, Math.round((usageCount / usageLimit) * 100)) : 0;
  const scopeNames = scopes.map((id) => resources.find((r) => r.id === id)?.name ?? id);

  const doDelete = async () => {
    setDeleting(true);
    await api.deleteApiKey(k.id);
    onDelete();
  };

  return (
    <div className={`rounded-xl border bg-surface/50 p-5 ${expiry?.label === "Expired" ? "opacity-60 border-red-500/20" : "border-border"}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold">{k.label || "Unnamed key"}</span>
            {expiry && (
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${expiry.color}`}>{expiry.label}</span>
            )}
            {usageLimit > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border text-muted-foreground">{usageCount}/{usageLimit} uses</span>
            )}
          </div>
          <div className="text-[11px] font-mono text-muted-foreground/60 mt-0.5">{k.id}</div>
        </div>
        <button
          onClick={doDelete}
          disabled={deleting}
          className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground/40 hover:text-red-400 hover:border-red-500/30 transition-colors disabled:opacity-40 flex-shrink-0"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1.5 3h8M4.5 3V2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1M2.5 3l.5 6.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5L8.5 3"/></svg>
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-8 flex items-center px-3 rounded-md border border-border bg-background/60 font-mono text-[12px] text-foreground/80 min-w-0 overflow-hidden">
          <span className="truncate">{revealed ? k.key_value : k.key_value.slice(0, 20) + "••••••••••••••••"}</span>
        </div>
        <button onClick={() => setRevealed((v) => !v)} className="text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-foreground/20 flex-shrink-0">
          {revealed ? "Hide" : "Reveal"}
        </button>
        <CopyButton text={k.key_value} />
      </div>

      {usageLimit > 0 && (
        <div className="mb-4">
          <div className="h-1 rounded-full bg-border/30 overflow-hidden">
            <div className={`h-full rounded-full transition-all ${usagePct > 90 ? "bg-red-400" : usagePct > 70 ? "bg-orange-400" : "bg-accent"}`} style={{ width: `${usagePct}%` }} />
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] font-mono text-muted-foreground/60">
        <span>Created {new Date(k.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</span>
        {k.last_used_at && <span>Last used {new Date(k.last_used_at).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>}
        {scopeNames.length > 0 ? (
          <span>Scopes: {scopeNames.join(", ")}</span>
        ) : (
          <span>Scope: all resources</span>
        )}
      </div>
    </div>
  );
}

function CreateKeyPanel({ resources, onCreated }: { resources: ApiResource[]; onCreated: (key: ApiKey) => void }) {
  const [label, setLabel] = useState("");
  const [scopes, setScopes] = useState<string[]>([]);
  const [expiry, setExpiry] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [creating, setCreating] = useState(false);
  const labelRef = useRef<HTMLInputElement>(null);

  useEffect(() => { labelRef.current?.focus(); }, []);

  const create = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const key = await api.createApiKey({
        label: label.trim() || "New key",
        scopes,
        expires_at: expiry || null,
        usage_limit: Number(usageLimit) || 0,
      });
      onCreated(key);
    } finally { setCreating(false); }
  };

  const toggleScope = (id: string) => setScopes((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);

  return (
    <div className="rounded-xl border border-accent/20 bg-accent/3 p-5 space-y-4">
      <div className="text-[13px] font-semibold">New API key</div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground/60 mb-1.5">Label</label>
          <input ref={labelRef} value={label} onChange={(e) => setLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} placeholder="e.g. Production server" className="w-full h-9 px-3 rounded-lg border border-border bg-background/60 text-[13px] font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 transition-colors" />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground/60 mb-1.5">Expires (optional)</label>
          <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} min={new Date().toISOString().slice(0, 10)} className="w-full h-9 px-3 rounded-lg border border-border bg-background/60 text-[13px] font-mono text-muted-foreground focus:outline-none focus:border-accent/40 transition-colors [color-scheme:dark]" />
        </div>
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground/60 mb-1.5">Usage limit (0 = unlimited)</label>
          <input type="number" value={usageLimit} onChange={(e) => setUsageLimit(e.target.value)} placeholder="0" min="0" className="w-full h-9 px-3 rounded-lg border border-border bg-background/60 text-[13px] font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 transition-colors" />
        </div>
      </div>
      {resources.length > 0 && (
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground/60 mb-2">Resource scopes (empty = all resources)</label>
          <div className="flex flex-wrap gap-2">
            {resources.map((r) => (
              <button
                key={r.id}
                onClick={() => toggleScope(r.id)}
                className={`h-7 px-3 rounded-full border text-[11.5px] font-mono transition-colors ${scopes.includes(r.id) ? "border-accent/30 bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <button onClick={create} disabled={creating} className="h-8 px-5 rounded-lg bg-accent text-background text-[13px] font-medium hover:bg-accent/90 disabled:opacity-40 transition-colors">
        {creating ? "Creating…" : "Generate key"}
      </button>
    </div>
  );
}

function DeveloperPage() {
  const user = getUser()!;
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [resources, setResources] = useState<ApiResource[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.getApiKeys().then(setKeys);
    api.getResources().then(setResources);
  }, [user.id]);

  const firstKey = keys[0];
  const displayKey = firstKey?.key_value ?? `astro_live_${"·".repeat(32)}`;
  const maskedKey = displayKey.startsWith("astro_live_·") ? displayKey : displayKey.slice(0, 20) + "••••••••••••••••";

  const sdkCode = `import { Astro402 } from "@astro/x402-sdk";

const client = new Astro402({
  apiKey: "${maskedKey}",
  network: "solana",
});

// Register a monetized resource
const resource = await client.resources.create({
  name: "My API Endpoint",
  url: "https://api.myapp.com/v1/inference",
  price: 0.002,       // USDC per request
  asset: "USDC",
  scope: "inference.v1",
  ttl: 60,
});`;

  const requestCode = `// x402-compatible fetch — auto-attaches payment intent
const response = await client.fetch("https://api.myapp.com/v1/inference", {
  method: "POST",
  body: JSON.stringify({ prompt: "Summarize this document…" }),
  // SDK intercepts 402 → signs Ed25519 intent → retries automatically
});

const data = await response.json();
// Response includes X-Payment-Receipt with on-chain proof
console.log(response.headers.get("X-Payment-Receipt"));
// → "5JhkLq9Rv…|slot:281492120|settled"`;

  const verifyCode = `// Verify incoming payment on your server before fulfilling
import { verifyPayment } from "@astro/x402-sdk/server";

app.post("/v1/inference", async (req, res) => {
  const receipt = req.headers["x-payment-receipt"];
  const verified = await verifyPayment(receipt, {
    expectedAmount: "0.002 USDC",
    network: "solana",
  });

  if (!verified) return res.status(402).json({ error: "Payment required" });

  // Fulfil the request
  const result = await runInference(req.body);
  res.json(result);
});`;

  return (
    <div className="p-6 space-y-6 max-w-[900px]">
      <div>
        <h1 className="text-xl font-semibold">Developer</h1>
        <p className="text-sm text-muted-foreground mt-0.5">API keys, scopes, SDK setup, and integration guide</p>
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-5">
        <div>
          <div className="text-[13px] font-medium">How x402 works</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">The Solana-native payment flow behind every monetized resource</div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FLOW_STEPS.map((step) => (
            <div key={step.n} className={`rounded-xl border p-4 ${step.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold ${step.dot} text-background`}>{step.n}</div>
                <span className="text-[11px] font-semibold">{step.label}</span>
              </div>
              <p className="text-[10px] leading-snug opacity-80 mb-2">{step.desc}</p>
              <div className="text-[9px] font-mono opacity-60">{step.detail}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground bg-background/40 border border-border/50 rounded-lg px-4 py-3">
          <span className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"/>
          <span>Protocol: HTTP 402 · Network: Solana · Settlement: ~400ms · Signature: Ed25519 · Asset: USDC or SOL</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-medium">API keys</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">Create keys with custom scopes, expiry, and usage limits</div>
          </div>
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-accent text-background text-[12.5px] font-medium hover:bg-accent/90 transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5.5 1v9M1 5.5h9"/></svg>
            New key
          </button>
        </div>

        {showCreate && (
          <CreateKeyPanel
            resources={resources}
            onCreated={(k) => { setKeys((prev) => [k, ...prev]); setShowCreate(false); }}
          />
        )}

        <div className="flex items-center gap-2 text-[11px] font-mono text-yellow-400/80 bg-yellow-500/5 border border-yellow-500/15 rounded-lg px-3 py-2">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6.5 1L12 11H1L6.5 1z"/><path d="M6.5 5v3M6.5 9.5v.5"/></svg>
          Never expose API keys in client-side code. Use server-side environment variables only.
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background/40 text-[11px] font-mono text-muted-foreground">
          <div className="text-muted-foreground/50 w-20 flex-shrink-0">Project ID</div>
          <div className="flex-1 truncate">proj_{user.id.slice(0, 8)}</div>
          <CopyButton text={`proj_${user.id.slice(0, 8)}`} />
        </div>

        {keys.length === 0 ? (
          <div className="py-8 text-center text-[12px] text-muted-foreground/50 font-mono border border-dashed border-border/40 rounded-xl">
            No API keys yet · click "New key" to create your first one
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k) => (
              <KeyCard
                key={k.id}
                k={k}
                resources={resources}
                onDelete={() => setKeys((prev) => prev.filter((x) => x.id !== k.id))}
              />
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-4">
        <div className="text-[13px] font-medium">SDK installation</div>
        <CodeBlock code="npm install @astro/x402-sdk" lang="bash" />
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-4">
        <div className="text-[13px] font-medium">Register a resource + initialize client</div>
        <CodeBlock code={sdkCode} />
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-4">
        <div className="text-[13px] font-medium">Making a paid request (caller side)</div>
        <p className="text-[12px] text-muted-foreground">The SDK intercepts 402 responses, signs a Solana payment intent using Ed25519, and retries — all transparently. No wallet popup.</p>
        <CodeBlock code={requestCode} />
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-4">
        <div className="text-[13px] font-medium">Verifying payment on your server</div>
        <p className="text-[12px] text-muted-foreground">Use the server SDK to verify the X-Payment-Receipt header before fulfilling any request.</p>
        <CodeBlock code={verifyCode} />
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5">
        <div className="text-[13px] font-medium mb-4">Resources & documentation</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: "SDK reference",        sub: "Full API documentation",         badge: "Coming soon" },
            { label: "x402 spec",            sub: "Protocol specification",         badge: null },
            { label: "Solana settlement",     sub: "How on-chain settlement works",  badge: null },
            { label: "Payment verification", sub: "Ed25519 receipt format",         badge: null },
            { label: "Webhook integration",  sub: "Event delivery & retries",       badge: null },
            { label: "CLI tools",            sub: "Manage resources from shell",    badge: "Coming soon" },
          ].map((item) => (
            <div key={item.label} className="p-3.5 rounded-lg border border-border bg-background/30 hover:bg-background/60 transition-colors cursor-default">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-[12px] font-medium">{item.label}</div>
                {item.badge && <span className="text-[9px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5 flex-shrink-0">{item.badge}</span>}
              </div>
              <div className="text-[11px] text-muted-foreground">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
