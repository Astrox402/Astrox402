import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getUser } from "@/lib/auth";

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

function DeveloperPage() {
  const user = getUser()!;
  const apiKey = `astro_live_${user.id.slice(0, 8)}xxxxxxxxxxxx`;
  const [showKey, setShowKey] = useState(false);
  const maskedKey = apiKey.slice(0, 16) + "••••••••••••";

  const installCode = `npm install @astro/x402-sdk`;

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
  // SDK handles 402 → sign intent → retry automatically
});

const data = await response.json();
// Response includes X-Payment-Receipt header with on-chain proof`;

  const webhookCode = `// Webhook payload (POST to your endpoint)
{
  "event": "payment.settled",
  "resource_id": "r_abc123",
  "amount": "0.002 USDC",
  "tx": "5JhkLq9Rv…",
  "slot": 281492120,
  "from": "8xMHkrV2Qw…",
  "timestamp": "2026-04-23T06:35:00Z"
}`;

  return (
    <div className="p-6 space-y-6 max-w-[900px]">
      <div>
        <h1 className="text-xl font-semibold">Developer</h1>
        <p className="text-sm text-muted-foreground mt-0.5">API keys, SDK setup, and integration guide</p>
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-4">
        <div className="text-[13px] font-medium">API credentials</div>
        <div className="space-y-3">
          {[
            { label: "Project ID", value: `proj_${user.id.slice(0, 8)}`, copy: true },
            { label: "API Key",    value: showKey ? apiKey : maskedKey, copy: true, reveal: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-24 text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex-shrink-0">{item.label}</div>
              <div className="flex-1 flex items-center gap-2 bg-background/60 border border-border rounded-lg px-3 h-9 font-mono text-[12px] text-foreground/80 min-w-0">
                <span className="truncate">{item.value}</span>
              </div>
              <CopyButton text={item.value} />
              {item.reveal && (
                <button
                  onClick={() => setShowKey((s) => !s)}
                  className="text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded border border-border hover:border-foreground/20"
                >
                  {showKey ? "Hide" : "Reveal"}
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-yellow-400/80 bg-yellow-500/5 border border-yellow-500/15 rounded-lg px-3 py-2">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6.5 1L12 11H1L6.5 1z"/><path d="M6.5 5v3M6.5 9.5v.5"/></svg>
          Never expose your API key in client-side code. Use server-side or environment variables.
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-4">
        <div className="text-[13px] font-medium">SDK installation</div>
        <CodeBlock code={installCode} lang="bash" />
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-4">
        <div className="text-[13px] font-medium">Register a resource + initialize client</div>
        <CodeBlock code={sdkCode} />
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-4">
        <div className="text-[13px] font-medium">x402-compatible request flow</div>
        <p className="text-[12px] text-muted-foreground">The SDK intercepts 402 responses, signs a Solana payment intent using Ed25519, and retries — all transparently.</p>
        <CodeBlock code={requestCode} />
      </div>

      <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-[13px] font-medium">Webhook events</div>
          <span className="text-[10px] font-mono text-muted-foreground border border-border rounded px-2 py-0.5">Coming soon</span>
        </div>
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Webhook URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://yourapp.com/webhooks/astro"
              className="flex-1 h-9 rounded-lg border border-border bg-background/60 px-3 text-[12px] font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40"
              disabled
            />
            <button className="h-9 px-4 rounded-lg border border-border text-[12px] text-muted-foreground opacity-40 cursor-not-allowed">Save</button>
          </div>
        </div>
        <CodeBlock code={webhookCode} lang="json" />
      </div>
    </div>
  );
}
