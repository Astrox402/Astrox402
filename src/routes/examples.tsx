import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/meridian/PageLayout";

export const Route = createFileRoute("/examples")({
  component: ExamplesPage,
});

const EXAMPLES = [
  {
    tag: "TypeScript",
    title: "Per-token inference endpoint",
    desc: "Wrap a language model inference handler with serve(). Price per output token. Settle in USDC on Base.",
    complexity: "Starter",
    code: `import { astro } from "@astro/sdk";

export const POST = astro.serve({
  resource: "/v1/infer",
  scope:    "inference.gpt",
  price:    ({ tokens }) => tokens * 0.000004,
  settle:   { chain: "solana", asset: "USDC" },

  async handler(req, ctx) {
    const { prompt } = await req.json();
    const result = await model.infer(prompt);
    return ctx.respond(result);
  },
});`,
  },
  {
    tag: "TypeScript",
    title: "Tiered data API",
    desc: "Charge different prices based on dataset size or query complexity. Use a pricing function to compute the cost dynamically.",
    complexity: "Intermediate",
    code: `import { astro } from "@astro/sdk";

export const GET = astro.serve({
  resource: "/v1/data",
  scope:    "data.read",
  price:    ({ rows, resolution }) => {
    const base = 0.001;
    const rowCost = rows * 0.00001;
    const resFactor = resolution === "full" ? 2 : 1;
    return (base + rowCost) * resFactor;
  },
  settle: { chain: "solana", asset: "USDC" },

  async handler(req, ctx) {
    const { rows, resolution } = ctx.params;
    return ctx.respond(await db.query({ rows, resolution }));
  },
});`,
  },
  {
    tag: "Python",
    title: "FastAPI paid endpoint",
    desc: "Add Astro to a FastAPI route with a single decorator. No changes to your existing handler logic.",
    complexity: "Starter",
    code: `from meridian import serve
from fastapi import FastAPI

app = FastAPI()

@app.post("/v1/summarize")
@serve(
    resource="/v1/summarize",
    scope="nlp.summarize",
    price=lambda ctx: ctx.word_count * 0.000002,
    settle={"chain": "optimism", "asset": "USDC"},
)
async def summarize(body: SummarizeRequest, ctx):
    result = await model.summarize(body.text)
    return {"summary": result, "receipt": ctx.payment.tx_hash}`,
  },
  {
    tag: "TypeScript",
    title: "Agent budget policy",
    desc: "Issue a scoped identity to an autonomous agent with a per-period spend ceiling enforced at the protocol level.",
    complexity: "Advanced",
    code: `import { astro } from "@astro/sdk";

// Issue identity with spend cap
const agentKey = await astro.agent.create({
  scope: ["inference.gpt", "data.read"],
  budget: {
    period: "daily",
    ceiling: 5.00,   // USD
    asset: "USDC",
    chain: "solana",
  },
});

// Agent calls paid endpoints autonomously
const client = meridian.client({ key: agentKey });
const result = await client.fetch("/v1/infer", {
  method: "POST",
  body: JSON.stringify({ prompt }),
});`,
  },
  {
    tag: "TypeScript",
    title: "Receipt verification",
    desc: "Independently verify any Astro receipt onchain — no trust in Astro infrastructure required.",
    complexity: "Intermediate",
    code: `import { verifyReceipt } from "@astro/sdk";

const receipt = {
  txHash: "0xabc...",
  intentHash: "0xdef...",
  serverAttestation: "0x...",
  merkleProof: ["0x...", "0x..."],
};

const result = await verifyReceipt(receipt, {
  chain: "solana",
  rpcUrl: process.env.BASE_RPC_URL,
});

console.log(result.valid);      // true
console.log(result.payer);      // 0x...
console.log(result.amountUSD);  // 0.0024`,
  },
  {
    tag: "Go",
    title: "net/http middleware",
    desc: "Add 402 payment gating to any Go HTTP handler using the standard library middleware pattern.",
    complexity: "Starter",
    code: `package main

import (
  "net/http"
  meridian "github.com/meridian-protocol/go-sdk"
)

func main() {
  mux := http.NewServeMux()

  handler := meridian.Serve(meridian.Config{
    Resource: "/v1/data",
    Scope:    "data.read",
    Price:    func(ctx meridian.Ctx) float64 { return 0.001 },
    Settle:   meridian.Settle{Chain: "base", Asset: "USDC"},
    Handler:  myDataHandler,
  })

  mux.Handle("/v1/data", handler)
  http.ListenAndServe(":8080", mux)
}`,
  },
];

const COMPLEXITY_STYLE: Record<string, string> = {
  Starter: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Intermediate: "bg-accent/10 text-accent border-accent/20",
  Advanced: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

const TAG_STYLE: Record<string, string> = {
  TypeScript: "text-blue-400",
  Python: "text-yellow-400",
  Go: "text-cyan-400",
};

function ExamplesPage() {
  return (
    <PageLayout
      eyebrow="Examples"
      title="Copy-paste starting points."
      intro="Real code patterns for common Astro use cases — inference endpoints, tiered APIs, agent identities, and receipt verification."
    >
      <div className="flex items-center gap-3 -mt-12 mb-16 flex-wrap">
        {["All", "TypeScript", "Python", "Go"].map((f) => (
          <span key={f} className={`text-[12px] font-mono border rounded-full px-3 py-1 cursor-default ${f === "All" ? "border-accent text-accent" : "border-border text-muted-foreground"}`}>{f}</span>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {EXAMPLES.map((ex) => (
          <div key={ex.title} className="rounded-2xl border border-border bg-surface/20 flex flex-col overflow-hidden hover:border-accent/30 transition-colors">
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[11px] font-mono font-medium ${TAG_STYLE[ex.tag] ?? "text-muted-foreground"}`}>{ex.tag}</span>
                <span className={`text-[10.5px] font-mono uppercase tracking-[0.14em] border rounded px-2 py-0.5 ${COMPLEXITY_STYLE[ex.complexity]}`}>{ex.complexity}</span>
              </div>
              <h2 className="text-[17px] font-medium mb-2">{ex.title}</h2>
              <p className="text-[13.5px] text-muted-foreground leading-relaxed mb-5">{ex.desc}</p>
            </div>
            <div className="mx-6 mb-6 rounded-xl border border-border bg-background/70 overflow-hidden">
              <pre className="p-4 font-mono text-[11.5px] leading-[1.65] text-foreground/80 overflow-x-auto">
                <code>{ex.code}</code>
              </pre>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-20 mt-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-[22px] font-medium mb-1">Want the full walkthrough?</h2>
            <p className="text-[14px] text-muted-foreground">The Quickstart covers each step end-to-end with explanation.</p>
          </div>
          <Link to="/docs/quickstart" className="inline-flex h-10 items-center px-5 rounded-md bg-foreground text-background text-[13.5px] font-medium hover:bg-foreground/90 transition-colors">
            Read the Quickstart →
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
