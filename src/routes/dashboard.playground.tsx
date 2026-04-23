import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { api, ApiResource, lamportsToDisplay } from "@/lib/api";
import { getUser } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/playground")({
  component: PlaygroundPage,
});

type StepStatus = "pending" | "active" | "done";
type Phase = "idle" | "running" | "complete";

interface SimData {
  resource: ApiResource;
  nonce: string;
  domain: string;
  priceDisplay: string;
  amountRaw: number;
  scope: string;
  payerWallet: string;
  txSignature: string;
  slot: number;
  blockTime: number;
  receiptId: string;
  expires: number;
  requestBody: string;
  responseBody: string;
  intentSig: string;
}

const STEPS = [
  {
    id: "request",
    label: "Request initiated",
    desc: "Client sends unauthenticated HTTP request to the protected resource.",
    color: "text-sky-400",
    dot: "bg-sky-400",
  },
  {
    id: "payment_required",
    label: "402 Payment Required",
    desc: "Server responds with a structured quote — price, scope, nonce, and TTL.",
    color: "text-amber-400",
    dot: "bg-amber-400",
  },
  {
    id: "intent_signed",
    label: "Intent signed",
    desc: "SDK constructs and signs a payment intent with the payer's Ed25519 key.",
    color: "text-violet-400",
    dot: "bg-violet-400",
  },
  {
    id: "verification",
    label: "Verification",
    desc: "Server verifier checks signature, nonce, and quote binding before handler runs.",
    color: "text-orange-400",
    dot: "bg-orange-400",
  },
  {
    id: "settlement",
    label: "Settlement confirmed",
    desc: "Solana program executes the atomic token transfer and registers the nonce.",
    color: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  {
    id: "fulfilled",
    label: "Response fulfilled",
    desc: "Handler executes, response returned with receipt attached.",
    color: "text-accent",
    dot: "bg-accent",
  },
];

const STEP_DURATIONS = [600, 900, 1100, 700, 1400, 800];

function randomHex(n: number) {
  let s = "";
  const h = "0123456789abcdef";
  for (let i = 0; i < n; i++) s += h[Math.floor(Math.random() * 16)];
  return s;
}

function randomBase58(n: number) {
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let s = "";
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function buildSimData(resource: ApiResource): SimData {
  const nonce = randomHex(16);
  const domain = randomHex(8);
  const payerWallet = randomBase58(44);
  const txSignature = randomBase58(88);
  const receiptId = `rcp_${randomHex(8)}`;
  const slot = 298000000 + Math.floor(Math.random() * 500000);
  const blockTime = Math.floor(Date.now() / 1000);
  const expires = blockTime + 60;
  const amountRaw = resource.price_lamports;
  const priceDisplay = lamportsToDisplay(amountRaw, resource.price_token);
  const scope = resource.category
    ? `${resource.category.toLowerCase().replace(/\s+/g, ".")}.resource`
    : "resource.access";
  const intentSig = randomBase58(88);

  const requestBody = resource.category?.toLowerCase().includes("infer")
    ? `{\n  "model": "gpt-4o-mini",\n  "prompt": "Summarize this article...",\n  "max_tokens": 150\n}`
    : `{\n  "resource": "${resource.endpoint}",\n  "version": "1"\n}`;

  const responseBody = resource.category?.toLowerCase().includes("infer")
    ? `{\n  "result": "Here is the summary you requested...",\n  "tokens_used": 143,\n  "model": "gpt-4o-mini"\n}`
    : `{\n  "status": "ok",\n  "resource": "${resource.name}",\n  "data": { "served": true }\n}`;

  return {
    resource, nonce, domain, priceDisplay, amountRaw, scope,
    payerWallet, txSignature, slot, blockTime, receiptId,
    expires, requestBody, responseBody, intentSig,
  };
}

function CodeBlock({ children, className = "" }: { children: string; className?: string }) {
  return (
    <pre className={`font-mono text-[12px] leading-[1.65] whitespace-pre-wrap break-all ${className}`}>
      {children}
    </pre>
  );
}

function HttpToken({ children, type }: { children: string; type: "method" | "path" | "header-key" | "header-val" | "status" | "comment" | "json-key" | "json-val" | "json-str" | "json-num" | "muted" | "ok" | "warn" }) {
  const colors: Record<string, string> = {
    method: "text-sky-400 font-semibold",
    path: "text-foreground",
    "header-key": "text-violet-300",
    "header-val": "text-amber-300/90",
    status: "text-amber-400 font-semibold",
    comment: "text-muted-foreground/60 italic",
    "json-key": "text-sky-300",
    "json-val": "text-emerald-300",
    "json-str": "text-amber-200/90",
    "json-num": "text-violet-300",
    muted: "text-muted-foreground/50",
    ok: "text-emerald-400",
    warn: "text-amber-400",
  };
  return <span className={colors[type] ?? "text-foreground"}>{children}</span>;
}

function StepPayload({ step, data }: { step: number; data: SimData }) {
  const endpoint = data.resource.endpoint ?? "/v1/resource";
  const host = "api.acme.dev";

  if (step === 0) {
    return (
      <CodeBlock>
        <HttpToken type="method">{"POST"}</HttpToken>
        {" "}
        <HttpToken type="path">{endpoint}</HttpToken>
        {" HTTP/1.1\n"}
        <HttpToken type="header-key">{"Host"}</HttpToken>
        {": "}
        <HttpToken type="header-val">{host}</HttpToken>
        {"\n"}
        <HttpToken type="header-key">{"Content-Type"}</HttpToken>
        {": "}
        <HttpToken type="header-val">{"application/json"}</HttpToken>
        {"\n"}
        <HttpToken type="header-key">{"X-Client-Id"}</HttpToken>
        {": "}
        <HttpToken type="header-val">{"sdk@0.402.3"}</HttpToken>
        {"\n\n"}
        <HttpToken type="json-str">{data.requestBody}</HttpToken>
      </CodeBlock>
    );
  }

  if (step === 1) {
    return (
      <CodeBlock>
        <HttpToken type="muted">{"< "}</HttpToken>
        <HttpToken type="status">{"HTTP/1.1 402 Payment Required"}</HttpToken>
        {"\n"}
        <HttpToken type="header-key">{"X-Astro-Price"}</HttpToken>
        {": "}
        <HttpToken type="header-val">{data.priceDisplay}</HttpToken>
        {"\n"}
        <HttpToken type="header-key">{"X-Astro-Scope"}</HttpToken>
        {": "}
        <HttpToken type="header-val">{data.scope}</HttpToken>
        {"\n"}
        <HttpToken type="header-key">{"X-Astro-Settle"}</HttpToken>
        {": "}
        <HttpToken type="header-val">{"solana"}</HttpToken>
        {"\n"}
        <HttpToken type="header-key">{"X-Astro-TTL"}</HttpToken>
        {": "}
        <HttpToken type="header-val">{"60"}</HttpToken>
        {"\n"}
        <HttpToken type="header-key">{"X-Astro-Nonce"}</HttpToken>
        {": "}
        <HttpToken type="header-val">{data.nonce}</HttpToken>
        {"\n"}
        <HttpToken type="header-key">{"X-Astro-Domain"}</HttpToken>
        {": "}
        <HttpToken type="header-val">{data.domain}</HttpToken>
        {"\n"}
        <HttpToken type="header-key">{"Content-Length"}</HttpToken>
        {": "}
        <HttpToken type="header-val">{"0"}</HttpToken>
      </CodeBlock>
    );
  }

  if (step === 2) {
    const shortWallet = `${data.payerWallet.slice(0, 6)}…${data.payerWallet.slice(-6)}`;
    return (
      <CodeBlock>
        {"{\n"}
        {"  "}
        <HttpToken type="json-key">{'"domain"'}</HttpToken>
        {": {\n"}
        {"    "}
        <HttpToken type="json-key">{'"name"'}</HttpToken>
        {": "}
        <HttpToken type="json-str">{'"Astro"'}</HttpToken>
        {",\n"}
        {"    "}
        <HttpToken type="json-key">{'"version"'}</HttpToken>
        {": "}
        <HttpToken type="json-str">{'"1"'}</HttpToken>
        {",\n"}
        {"    "}
        <HttpToken type="json-key">{'"cluster"'}</HttpToken>
        {": "}
        <HttpToken type="json-str">{'"mainnet-beta"'}</HttpToken>
        {"\n  },\n"}
        {"  "}
        <HttpToken type="json-key">{'"payer"'}</HttpToken>
        {": "}
        <HttpToken type="json-str">{`"${shortWallet}"`}</HttpToken>
        {",\n"}
        {"  "}
        <HttpToken type="json-key">{'"scope"'}</HttpToken>
        {": "}
        <HttpToken type="json-str">{`"${data.scope}"`}</HttpToken>
        {",\n"}
        {"  "}
        <HttpToken type="json-key">{'"amount"'}</HttpToken>
        {": "}
        <HttpToken type="json-num">{`${data.amountRaw}`}</HttpToken>
        {",\n"}
        {"  "}
        <HttpToken type="json-key">{'"asset"'}</HttpToken>
        {": "}
        <HttpToken type="json-str">{`"${data.resource.price_token}"`}</HttpToken>
        {",\n"}
        {"  "}
        <HttpToken type="json-key">{'"nonce"'}</HttpToken>
        {": "}
        <HttpToken type="json-str">{`"${data.nonce}"`}</HttpToken>
        {",\n"}
        {"  "}
        <HttpToken type="json-key">{'"expires"'}</HttpToken>
        {": "}
        <HttpToken type="json-num">{`${data.expires}`}</HttpToken>
        {",\n"}
        {"  "}
        <HttpToken type="json-key">{'"signature"'}</HttpToken>
        {": "}
        <HttpToken type="json-str">{`"${data.intentSig.slice(0, 16)}…"`}</HttpToken>
        {"\n}"}
      </CodeBlock>
    );
  }

  if (step === 3) {
    return (
      <CodeBlock>
        <HttpToken type="ok">{"✓"}</HttpToken>
        {" "}
        <HttpToken type="json-key">{"Signature"}</HttpToken>
        {"  Ed25519 match — payer confirmed\n"}
        <HttpToken type="ok">{"✓"}</HttpToken>
        {" "}
        <HttpToken type="json-key">{"Nonce    "}</HttpToken>
        {" "}
        <HttpToken type="json-str">{data.nonce}</HttpToken>
        {" — unused, valid\n"}
        <HttpToken type="ok">{"✓"}</HttpToken>
        {" "}
        <HttpToken type="json-key">{"Binding  "}</HttpToken>
        {"  resource · scope · amount · expiry match\n"}
        <HttpToken type="ok">{"✓"}</HttpToken>
        {" "}
        <HttpToken type="json-key">{"TTL      "}</HttpToken>
        {"  quote within validity window\n\n"}
        <HttpToken type="warn">{"→"}</HttpToken>
        {" "}
        <HttpToken type="muted">{"broadcasting settlement transaction to Solana…"}</HttpToken>
      </CodeBlock>
    );
  }

  if (step === 4) {
    const shortTx = `${data.txSignature.slice(0, 8)}…${data.txSignature.slice(-8)}`;
    return (
      <CodeBlock>
        {"{\n"}
        {"  "}
        <HttpToken type="json-key">{'"txSignature"'}</HttpToken>
        {": "}
        <HttpToken type="json-str">{`"${shortTx}"`}</HttpToken>
        {",\n"}
        {"  "}
        <HttpToken type="json-key">{'"slot"'}</HttpToken>
        {": "}
        <HttpToken type="json-num">{`${data.slot}`}</HttpToken>
        {",\n"}
        {"  "}
        <HttpToken type="json-key">{'"blockTime"'}</HttpToken>
        {": "}
        <HttpToken type="json-num">{`${data.blockTime}`}</HttpToken>
        {",\n"}
        {"  "}
        <HttpToken type="json-key">{'"confirmationStatus"'}</HttpToken>
        {": "}
        <HttpToken type="json-str">{'"confirmed"'}</HttpToken>
        {",\n"}
        {"  "}
        <HttpToken type="json-key">{'"fee"'}</HttpToken>
        {": "}
        <HttpToken type="json-num">{"5000"}</HttpToken>
        {" "}
        <HttpToken type="comment">{"// lamports"}</HttpToken>
        {",\n"}
        {"  "}
        <HttpToken type="json-key">{'"logs"'}</HttpToken>
        {": [\n"}
        {"    "}
        <HttpToken type="json-str">{'"Program AstroSettle… invoke [1]"'}</HttpToken>
        {",\n"}
        {"    "}
        <HttpToken type="json-str">{`"Program log: nonce consumed ${data.nonce.slice(0, 8)}…"`}</HttpToken>
        {",\n"}
        {"    "}
        <HttpToken type="json-str">{`"Program log: transfer ${data.amountRaw} ${data.resource.price_token} settled"`}</HttpToken>
        {",\n"}
        {"    "}
        <HttpToken type="json-str">{'"Program AstroSettle… success"'}</HttpToken>
        {"\n  ]\n}"}
      </CodeBlock>
    );
  }

  if (step === 5) {
    const shortReceipt = data.receiptId;
    return (
      <CodeBlock>
        <HttpToken type="ok">{"HTTP/1.1 200 OK"}</HttpToken>
        {"\n"}
        <HttpToken type="header-key">{"X-Astro-Receipt"}</HttpToken>
        {": "}
        <HttpToken type="header-val">{shortReceipt}</HttpToken>
        {"\n"}
        <HttpToken type="header-key">{"Content-Type"}</HttpToken>
        {": "}
        <HttpToken type="header-val">{"application/json"}</HttpToken>
        {"\n\n"}
        <HttpToken type="json-str">{data.responseBody}</HttpToken>
        {"\n\n"}
        <HttpToken type="comment">{"// Receipt verifiable from any Solana RPC:"}</HttpToken>
        {"\n"}
        <HttpToken type="comment">{"// verifyReceipt(receipt, { rpc: \"https://api.mainnet-beta.solana.com\" })"}</HttpToken>
      </CodeBlock>
    );
  }

  return null;
}

const STEP_LABELS = [
  "HTTP Request",
  "402 Response",
  "Signed Intent",
  "Verifier Output",
  "Settlement Log",
  "200 Response",
];

function PlaygroundPage() {
  const [resources, setResources] = useState<ApiResource[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentStep, setCurrentStep] = useState(-1);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(STEPS.map(() => "pending"));
  const [stepTimes, setStepTimes] = useState<number[]>(STEPS.map(() => 0));
  const [viewingStep, setViewingStep] = useState(0);
  const [simData, setSimData] = useState<SimData | null>(null);
  const [createdPaymentId, setCreatedPaymentId] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  const cancelRef = useRef(false);
  const user = getUser();

  useEffect(() => {
    api.getResources().then((rs) => {
      setResources(rs);
      if (rs.length > 0) setSelectedId(rs[0].id);
    });
  }, []);

  const selectedResource = resources.find((r) => r.id === selectedId) ?? null;

  const runSimulation = useCallback(async () => {
    if (!selectedResource) return;
    cancelRef.current = false;

    const data = buildSimData(selectedResource);
    setSimData(data);
    setPhase("running");
    setCurrentStep(0);
    setViewingStep(0);
    setStepStatuses(STEPS.map(() => "pending"));
    setStepTimes(STEPS.map(() => 0));
    setCreatedPaymentId(null);
    setTotalTime(0);

    const newStatuses: StepStatus[] = STEPS.map(() => "pending");
    const newTimes: number[] = STEPS.map(() => 0);
    let runningTotal = 0;

    for (let i = 0; i < STEPS.length; i++) {
      if (cancelRef.current) return;
      newStatuses[i] = "active";
      setStepStatuses([...newStatuses]);
      setCurrentStep(i);
      setViewingStep(i);

      const dur = STEP_DURATIONS[i];
      await new Promise((r) => setTimeout(r, dur));
      if (cancelRef.current) return;

      newStatuses[i] = "done";
      newTimes[i] = dur;
      runningTotal += dur;
      setStepStatuses([...newStatuses]);
      setStepTimes([...newTimes]);
      setTotalTime(runningTotal);
    }

    try {
      const payment = await api.createPayment({
        resource_id: data.resource.id,
        resource_name: data.resource.name,
        amount_lamports: data.amountRaw,
        token: data.resource.price_token,
        payer_wallet: data.payerWallet,
        tx_signature: data.txSignature,
        status: "settled",
      });
      setCreatedPaymentId(payment.id ?? null);
    } catch {}

    setPhase("complete");
  }, [selectedResource]);

  const reset = () => {
    cancelRef.current = true;
    setPhase("idle");
    setCurrentStep(-1);
    setSimData(null);
    setCreatedPaymentId(null);
    setStepStatuses(STEPS.map(() => "pending"));
    setStepTimes(STEPS.map(() => 0));
    setTotalTime(0);
    setViewingStep(0);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">

      {/* ── Header ── */}
      <div className="border-b border-border px-6 py-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[16px] font-medium">Handshake Playground</h1>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">
              Step through the x402-inspired payment request lifecycle end-to-end on Solana.
            </p>
          </div>

          {phase === "complete" && createdPaymentId && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/8 text-[12px] text-emerald-400 font-mono flex-shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
              Settlement recorded · {createdPaymentId}
            </div>
          )}
        </div>

        {/* Resource selector + controls */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground/60 mb-1.5">Resource</label>
            <div className="relative">
              <select
                value={selectedId}
                onChange={(e) => { setSelectedId(e.target.value); if (phase !== "idle") reset(); }}
                disabled={phase === "running"}
                className="w-full h-8 pl-3 pr-8 rounded-md border border-border bg-surface/40 text-[12.5px] text-foreground appearance-none focus:outline-none focus:border-accent/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resources.length === 0 && <option value="">No resources — add one first</option>}
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.endpoint}
                  </option>
                ))}
              </select>
              <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3.5L5 6.5L8 3.5"/></svg>
            </div>
          </div>

          {selectedResource && (
            <div className="flex items-center gap-2 mt-5">
              <span className="text-[11px] font-mono text-muted-foreground/60">Price:</span>
              <span className="text-[11px] font-mono text-accent">{lamportsToDisplay(selectedResource.price_lamports, selectedResource.price_token)}</span>
              <span className="text-muted-foreground/30 mx-1">·</span>
              <span className={`text-[10px] font-mono uppercase tracking-[0.12em] px-2 py-0.5 rounded border ${selectedResource.status === "active" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-muted-foreground bg-surface/20 border-border"}`}>
                {selectedResource.status}
              </span>
            </div>
          )}

          <div className="ml-auto mt-5 flex items-center gap-2">
            {phase !== "idle" && (
              <button
                onClick={reset}
                className="h-8 px-3 rounded-md border border-border text-[12px] text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
              >
                Reset
              </button>
            )}
            <button
              onClick={phase === "idle" || phase === "complete" ? runSimulation : undefined}
              disabled={phase === "running" || !selectedResource || resources.length === 0}
              className={`h-8 px-4 rounded-md text-[12.5px] font-medium transition-all flex items-center gap-2 ${
                phase === "running"
                  ? "bg-accent/20 text-accent border border-accent/30 cursor-not-allowed"
                  : "bg-accent text-background hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {phase === "running" ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse flex-shrink-0" />
                  Simulating…
                </>
              ) : phase === "complete" ? (
                "Run again"
              ) : (
                "Run simulation"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main split ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: step timeline ── */}
        <div className="w-72 flex-shrink-0 border-r border-border overflow-y-auto p-4 space-y-0">
          {STEPS.map((step, i) => {
            const status = stepStatuses[i];
            const isViewing = viewingStep === i;
            const hasData = simData !== null && (status === "done" || status === "active");
            const ms = stepTimes[i];

            return (
              <div key={step.id} className="relative">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className={`absolute left-[18px] top-[36px] w-px h-[calc(100%-4px)] transition-colors duration-500 ${
                    stepStatuses[i] === "done" ? "bg-border" : "bg-border/30"
                  }`} />
                )}

                <button
                  onClick={() => hasData && setViewingStep(i)}
                  disabled={!hasData}
                  className={`relative w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all ${
                    hasData ? "cursor-pointer hover:bg-white/4" : "cursor-default"
                  } ${isViewing && hasData ? "bg-white/5" : ""}`}
                >
                  {/* Status dot */}
                  <div className="flex-shrink-0 mt-0.5">
                    {status === "pending" && (
                      <div className="h-5 w-5 rounded-full border border-border bg-surface/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                      </div>
                    )}
                    {status === "active" && (
                      <div className={`h-5 w-5 rounded-full border ${step.color.replace("text-", "border-")}/40 bg-surface/40 flex items-center justify-center`}>
                        <div className={`h-2 w-2 rounded-full ${step.dot} animate-pulse`} />
                      </div>
                    )}
                    {status === "done" && (
                      <div className={`h-5 w-5 rounded-full border ${step.color.replace("text-", "border-")}/40 flex items-center justify-center`}
                        style={{ background: "rgba(var(--accent-rgb, 14 165 233), 0.08)" }}>
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className={step.color}>
                          <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`text-[12.5px] font-medium leading-tight ${
                        status === "pending" ? "text-muted-foreground/50" :
                        status === "active" ? step.color :
                        "text-foreground"
                      }`}>
                        {step.label}
                      </span>
                      {ms > 0 && (
                        <span className="text-[10px] font-mono text-muted-foreground/50 flex-shrink-0">{ms}ms</span>
                      )}
                    </div>
                    <p className={`text-[11px] leading-relaxed mt-0.5 ${
                      status === "pending" ? "text-muted-foreground/30" : "text-muted-foreground/70"
                    }`}>
                      {step.desc}
                    </p>
                  </div>
                </button>
              </div>
            );
          })}

          {/* Timing summary */}
          {phase === "complete" && totalTime > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-muted-foreground/60">Total</span>
                <span className="text-accent">{totalTime}ms</span>
              </div>
              <div className="mt-2 space-y-1">
                {STEPS.map((s, i) => (
                  stepTimes[i] > 0 && (
                    <div key={s.id} className="flex items-center gap-2">
                      <div className={`h-0.5 rounded-full ${s.dot}`} style={{ width: `${Math.round((stepTimes[i] / totalTime) * 100)}%`, minWidth: 4 }} />
                      <span className="text-[10px] font-mono text-muted-foreground/50 flex-shrink-0">{stepTimes[i]}ms</span>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: payload viewer ── */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Tab bar */}
          <div className="flex items-center gap-0 border-b border-border px-4 flex-shrink-0 overflow-x-auto">
            {STEPS.map((step, i) => {
              const hasData = simData !== null && (stepStatuses[i] === "done" || stepStatuses[i] === "active");
              return (
                <button
                  key={step.id}
                  onClick={() => hasData && setViewingStep(i)}
                  disabled={!hasData}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-[11.5px] font-mono border-b-2 transition-all flex-shrink-0 ${
                    viewingStep === i && hasData
                      ? `border-accent ${step.color}`
                      : hasData
                      ? "border-transparent text-muted-foreground hover:text-foreground"
                      : "border-transparent text-muted-foreground/25 cursor-default"
                  }`}
                >
                  {stepStatuses[i] === "active" && (
                    <span className={`h-1.5 w-1.5 rounded-full ${step.dot} animate-pulse flex-shrink-0`} />
                  )}
                  {STEP_LABELS[i]}
                </button>
              );
            })}
          </div>

          {/* Payload area */}
          <div className="flex-1 overflow-y-auto p-6 bg-[oklch(0.07_0.004_250)]">
            {phase === "idle" ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-xl border border-border bg-surface/20 flex items-center justify-center mb-4">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.3" className="text-muted-foreground/50">
                    <path d="M11 5v12M5 11h12"/>
                    <circle cx="11" cy="11" r="9"/>
                  </svg>
                </div>
                <p className="text-[13.5px] font-medium text-muted-foreground/60 mb-1">Select a resource and run the simulation</p>
                <p className="text-[12px] text-muted-foreground/40 max-w-xs">
                  Each step of the x402 handshake will be shown here — from HTTP request through Solana settlement to the fulfilled response.
                </p>
              </div>
            ) : simData ? (
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <span className={`text-[10px] font-mono uppercase tracking-[0.16em] px-2 py-1 rounded border ${STEPS[viewingStep].color} border-current/30`}
                    style={{ background: "rgba(var(--color-accent-rgb, 14 165 233), 0.06)" }}>
                    {STEP_LABELS[viewingStep]}
                  </span>
                  <span className="text-[11px] text-muted-foreground/50 font-mono">
                    Step {viewingStep + 1} of {STEPS.length}
                  </span>
                  {stepTimes[viewingStep] > 0 && (
                    <span className="ml-auto text-[11px] font-mono text-muted-foreground/50">{stepTimes[viewingStep]}ms</span>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-[oklch(0.065_0.004_250)] p-5 overflow-x-auto">
                  <StepPayload step={viewingStep} data={simData} />
                </div>

                <p className="mt-4 text-[12px] text-muted-foreground/60 leading-relaxed">
                  {STEPS[viewingStep].desc}
                </p>

                {viewingStep === 5 && phase === "complete" && createdPaymentId && (
                  <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className="text-emerald-400">
                          <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-emerald-400">Simulation complete</p>
                        <p className="text-[12px] text-emerald-400/70 mt-0.5">
                          Payment recorded as <span className="font-mono">{createdPaymentId}</span>. Check the Payments page to see it reflected in your activity log.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Bottom status bar ── */}
      <div className="border-t border-border px-5 py-2 flex items-center gap-4 text-[11px] font-mono text-muted-foreground/50 flex-shrink-0 bg-[oklch(0.09_0.005_250)]">
        <span className={`flex items-center gap-1.5 ${
          phase === "running" ? "text-amber-400/80" :
          phase === "complete" ? "text-emerald-400/80" :
          "text-muted-foreground/40"
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
            phase === "running" ? "bg-amber-400 animate-pulse" :
            phase === "complete" ? "bg-emerald-400" :
            "bg-muted-foreground/20"
          }`} />
          {phase === "idle" ? "Idle" : phase === "running" ? `Step ${currentStep + 1} / ${STEPS.length}` : "Complete"}
        </span>
        <span className="text-muted-foreground/20">·</span>
        <span>x402-inspired · Solana mainnet</span>
        {totalTime > 0 && (
          <>
            <span className="text-muted-foreground/20">·</span>
            <span className="text-accent/60">{totalTime}ms total</span>
          </>
        )}
        <span className="ml-auto">
          {user?.name ?? "Playground"}
        </span>
      </div>
    </div>
  );
}
