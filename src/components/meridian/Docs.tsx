import { useState } from "react";
import { SectionHeader } from "./Section";

const TABS = [
  {
    id: "ts",
    label: "TypeScript",
    code: `import { meridian } from "@meridian/sdk";

// Expose any function as a paid, programmable endpoint.
export const POST = meridian.serve({
  resource: "/v1/infer",
  scope:    "inference.gpt",
  price:    ({ tokens }) => tokens * 0.000004 + 0.001, // USDC
  settle:   { chain: "ethereum", asset: "USDC" },
  ttl:      60,

  async handler(req, ctx) {
    // ctx.payment is verified before this runs.
    const { prompt } = await req.json();
    const result = await model.infer(prompt);

    return ctx.respond(result, {
      receipt: ctx.payment.txHash, // onchain proof
    });
  },
});`,
  },
  {
    id: "py",
    label: "Python",
    code: `from meridian import serve

@serve(
    resource="/v1/infer",
    scope="inference.gpt",
    price=lambda req: req.tokens * 0.000004 + 0.001,
    settle={"chain": "ethereum", "asset": "USDC"},
    ttl=60,
)
async def infer(req, ctx):
    # ctx.payment is verified before this runs.
    result = await model.infer(req.prompt)
    return ctx.respond(result, receipt=ctx.payment.tx_hash)`,
  },
  {
    id: "curl",
    label: "Client",
    code: `# 1. Caller hits the endpoint without payment
$ curl -i https://api.acme.dev/v1/infer
HTTP/1.1 402 Payment Required
x-meridian-price:  0.0021 USDC
x-meridian-scope:  inference.gpt
x-meridian-settle: ethereum
x-meridian-ttl:    60

# 2. Sign + retry — the SDK handles it transparently
$ meridian call /v1/infer --pay
→ 200 OK
✓ settled 0.0021 USDC  tx 0x9f4a…2e1c`,
  },
];

export function Docs() {
  const [active, setActive] = useState(TABS[0].id);
  const [copied, setCopied] = useState(false);
  const current = TABS.find((t) => t.id === active)!;

  const copy = async () => {
    await navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section id="docs-preview" className="relative py-32 border-t border-border">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-16 items-start">
          <div>
            <SectionHeader
              eyebrow="Docs preview"
              title={<>Ship a paid endpoint <span className="font-serif italic">in nine lines.</span></>}
              intro="One function. Programmable price. Verified settlement. Meridian handles the 402 handshake, the receipt, and the onchain proof."
            />
            <div className="mt-10 space-y-4 text-[13.5px] text-muted-foreground">
              {[
                ["serve()", "Wraps any handler in the payment-aware envelope."],
                ["price()", "Static value or pure function over the request."],
                ["settle", "Chain + asset. Receipts attached automatically."],
                ["ctx.payment", "Verified onchain before your handler runs."],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-4 border-t border-border pt-4">
                  <code className="font-mono text-[12.5px] text-accent w-28 shrink-0">{k}</code>
                  <span className="leading-relaxed">{v}</span>
                </div>
              ))}
            </div>
            <a href="/docs" className="mt-10 inline-flex items-center gap-2 text-[13.5px] text-foreground hover:text-accent transition-colors">
              Read the full specification
              <span aria-hidden>→</span>
            </a>
          </div>

          <div className="rounded-2xl border border-border bg-surface/40 overflow-hidden accent-glow">
            <div className="flex items-center justify-between h-11 px-3 border-b border-border bg-background/60">
              <div className="flex items-center">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActive(t.id)}
                    className={`px-3.5 h-11 text-[12.5px] font-mono transition-colors ${
                      active === t.id
                        ? "text-foreground border-b border-accent"
                        : "text-muted-foreground hover:text-foreground/80"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <button
                onClick={copy}
                className="mr-1 px-2.5 h-7 rounded-md border border-border text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
            <pre className="p-6 font-mono text-[12.5px] leading-[1.7] text-foreground/85 overflow-x-auto">
              <code>{current.code}</code>
            </pre>
            <div className="border-t border-border px-5 h-9 flex items-center justify-between text-[10.5px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <span>example · meridian/sdk</span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-slow" />
                runnable
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
