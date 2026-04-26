import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { api, ApiResource, lamportsToDisplay } from "@/lib/api";
import { useWallets } from "@privy-io/react-auth";
import { Connection, Transaction, SystemProgram, PublicKey } from "@solana/web3.js";

export const Route = createFileRoute("/dashboard/playground")({
  component: PlaygroundPage,
});

type StepStatus = "pending" | "active" | "done";
type Phase = "idle" | "running" | "waiting_wallet" | "complete";

const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

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
  isRealTx: boolean;
}

const STEPS = [
  { id: "request",        label: "Request initiated",    desc: "Client sends unauthenticated HTTP request to the protected resource.", color: "text-sky-400",    dot: "bg-sky-400"    },
  { id: "payment_required", label: "402 Payment Required", desc: "Server responds with a structured quote — price, scope, nonce, and TTL.", color: "text-amber-400",  dot: "bg-amber-400"  },
  { id: "intent_signed",  label: "Intent signed",        desc: "SDK constructs and signs a payment intent with the payer's Ed25519 key.", color: "text-violet-400", dot: "bg-violet-400" },
  { id: "verification",   label: "Verification",         desc: "Server verifier checks signature, nonce, and quote binding before handler runs.", color: "text-orange-400", dot: "bg-orange-400" },
  { id: "settlement",     label: "Settlement confirmed",  desc: "Solana program executes the atomic token transfer and registers the nonce.", color: "text-accent",    dot: "bg-accent"     },
  { id: "fulfilled",      label: "Response fulfilled",   desc: "Handler executes, response returned with receipt attached.", color: "text-accent",    dot: "bg-accent"     },
];

const STEP_DURATIONS = [600, 900, 1100, 700, 0, 800];

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

function buildSimData(resource: ApiResource, walletAddress: string | null, txSig?: string, realTx?: boolean): SimData {
  const nonce = randomHex(16);
  const domain = randomHex(8);
  const payerWallet = walletAddress ?? randomBase58(44);
  const txSignature = txSig ?? randomBase58(88);
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
    isRealTx: realTx ?? false,
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
        {"  "}<HttpToken type="json-key">{'"domain"'}</HttpToken>{": {\n"}
        {"    "}<HttpToken type="json-key">{'"name"'}</HttpToken>{": "}<HttpToken type="json-str">{'"Astro"'}</HttpToken>{",\n"}
        {"    "}<HttpToken type="json-key">{'"version"'}</HttpToken>{": "}<HttpToken type="json-str">{'"1"'}</HttpToken>{",\n"}
        {"    "}<HttpToken type="json-key">{'"cluster"'}</HttpToken>{": "}<HttpToken type="json-str">{'"mainnet-beta"'}</HttpToken>{"\n  },\n"}
        {"  "}<HttpToken type="json-key">{'"payer"'}</HttpToken>{": "}<HttpToken type="json-str">{`"${shortWallet}"`}</HttpToken>{",\n"}
        {"  "}<HttpToken type="json-key">{'"scope"'}</HttpToken>{": "}<HttpToken type="json-str">{`"${data.scope}"`}</HttpToken>{",\n"}
        {"  "}<HttpToken type="json-key">{'"amount"'}</HttpToken>{": "}<HttpToken type="json-num">{`${data.amountRaw}`}</HttpToken>{",\n"}
        {"  "}<HttpToken type="json-key">{'"asset"'}</HttpToken>{": "}<HttpToken type="json-str">{`"${data.resource.price_token}"`}</HttpToken>{",\n"}
        {"  "}<HttpToken type="json-key">{'"nonce"'}</HttpToken>{": "}<HttpToken type="json-str">{`"${data.nonce}"`}</HttpToken>{",\n"}
        {"  "}<HttpToken type="json-key">{'"expires"'}</HttpToken>{": "}<HttpToken type="json-num">{`${data.expires}`}</HttpToken>{",\n"}
        {"  "}<HttpToken type="json-key">{'"signature"'}</HttpToken>{": "}<HttpToken type="json-str">{`"${data.intentSig.slice(0, 16)}…"`}</HttpToken>{"\n}"}
      </CodeBlock>
    );
  }

  if (step === 3) {
    return (
      <CodeBlock>
        <HttpToken type="ok">{"✓"}</HttpToken>{" "}<HttpToken type="json-key">{"Signature"}</HttpToken>{"  Ed25519 match — payer confirmed\n"}
        <HttpToken type="ok">{"✓"}</HttpToken>{" "}<HttpToken type="json-key">{"Nonce    "}</HttpToken>{" "}<HttpToken type="json-str">{data.nonce}</HttpToken>{" — unused, valid\n"}
        <HttpToken type="ok">{"✓"}</HttpToken>{" "}<HttpToken type="json-key">{"Binding  "}</HttpToken>{"  resource · scope · amount · expiry match\n"}
        <HttpToken type="ok">{"✓"}</HttpToken>{" "}<HttpToken type="json-key">{"TTL      "}</HttpToken>{"  quote within validity window\n\n"}
        <HttpToken type="warn">{"→"}</HttpToken>{" "}<HttpToken type="muted">{"broadcasting settlement transaction to Solana…"}</HttpToken>
      </CodeBlock>
    );
  }

  if (step === 4) {
    const shortTx = `${data.txSignature.slice(0, 8)}…${data.txSignature.slice(-8)}`;
    return (
      <CodeBlock>
        {"{\n"}
        {"  "}<HttpToken type="json-key">{'"txSignature"'}</HttpToken>{": "}<HttpToken type="json-str">{`"${shortTx}"`}</HttpToken>{",\n"}
        {"  "}<HttpToken type="json-key">{'"slot"'}</HttpToken>{": "}<HttpToken type="json-num">{`${data.slot}`}</HttpToken>{",\n"}
        {"  "}<HttpToken type="json-key">{'"blockTime"'}</HttpToken>{": "}<HttpToken type="json-num">{`${data.blockTime}`}</HttpToken>{",\n"}
        {"  "}<HttpToken type="json-key">{'"confirmationStatus"'}</HttpToken>{": "}<HttpToken type="json-str">{'"confirmed"'}</HttpToken>{",\n"}
        {"  "}<HttpToken type="json-key">{'"fee"'}</HttpToken>{": "}<HttpToken type="json-num">{"5000"}</HttpToken>{" "}<HttpToken type="comment">{"// lamports"}</HttpToken>{",\n"}
        {"  "}<HttpToken type="json-key">{'"isRealTx"'}</HttpToken>{": "}<HttpToken type="json-val">{data.isRealTx ? "true" : "false"}</HttpToken>{",\n"}
        {"  "}<HttpToken type="json-key">{'"logs"'}</HttpToken>{": [\n"}
        {"    "}<HttpToken type="json-str">{'"Program 11111111111111111111111111111111 invoke [1]"'}</HttpToken>{",\n"}
        {"    "}<HttpToken type="json-str">{`"Program log: nonce consumed ${data.nonce.slice(0, 8)}…"`}</HttpToken>{",\n"}
        {"    "}<HttpToken type="json-str">{`"Program log: transfer ${data.amountRaw} lamports settled"`}</HttpToken>{",\n"}
        {"    "}<HttpToken type="json-str">{'"Program 11111111111111111111111111111111 success"'}</HttpToken>{"\n  ]\n}"}
      </CodeBlock>
    );
  }

  if (step === 5) {
    return (
      <CodeBlock>
        <HttpToken type="ok">{"HTTP/1.1 200 OK"}</HttpToken>{"\n"}
        <HttpToken type="header-key">{"X-Astro-Receipt"}</HttpToken>{": "}<HttpToken type="header-val">{data.receiptId}</HttpToken>{"\n"}
        <HttpToken type="header-key">{"Content-Type"}</HttpToken>{": "}<HttpToken type="header-val">{"application/json"}</HttpToken>{"\n\n"}
        <HttpToken type="json-str">{data.responseBody}</HttpToken>{"\n\n"}
        <HttpToken type="comment">{"// Receipt verifiable from any Solana RPC:"}</HttpToken>{"\n"}
        <HttpToken type="comment">{"// verifyReceipt(receipt, { rpc: \"https://api.mainnet-beta.solana.com\" })"}</HttpToken>
      </CodeBlock>
    );
  }

  return null;
}

const STEP_LABELS = ["HTTP Request", "402 Response", "Signed Intent", "Verifier Output", "Settlement Log", "200 Response"];

async function sendSolanaPayment(resource: ApiResource, walletAddress: string): Promise<string> {
  const win = window as unknown as Record<string, unknown>;
  const provider = (win.phantom as Record<string, unknown>)?.solana ?? win.solana;
  if (!provider || typeof (provider as Record<string, unknown>).signAndSendTransaction !== "function") {
    throw new Error("No Solana wallet found. Install Phantom or Backpack.");
  }
  const solProvider = provider as { signAndSendTransaction: (tx: Transaction) => Promise<{ signature: string }> };

  const connection = new Connection(SOLANA_RPC, "confirmed");
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

  const lamports = Math.max(1000, resource.price_lamports);
  const transaction = new Transaction({
    recentBlockhash: blockhash,
    feePayer: new PublicKey(walletAddress),
  }).add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(walletAddress),
      toPubkey: new PublicKey(walletAddress),
      lamports,
    })
  );

  const { signature } = await solProvider.signAndSendTransaction(transaction);

  await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight }, "confirmed");
  return signature;
}

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
  const [walletError, setWalletError] = useState<string | null>(null);
  const [walletConfirming, setWalletConfirming] = useState(false);
  const cancelRef = useRef(false);
  const resolveWalletRef = useRef<((sig: string | null) => void) | null>(null);

  const { wallets } = useWallets();
  const solanaWallet = wallets.find((w) =>
    (w as Record<string, unknown>).chainType === "solana" ||
    w.walletClientType?.toLowerCase().includes("solana") ||
    w.walletClientType === "phantom" ||
    w.walletClientType === "solflare"
  );
  const walletAddress = solanaWallet?.address ?? null;

  const win = typeof window !== "undefined" ? window as unknown as Record<string, unknown> : {};
  const hasExternalWallet = Boolean((win.phantom as Record<string, unknown>)?.solana ?? win.solana);
  const canDoRealTx = (hasExternalWallet || Boolean(walletAddress)) && Boolean(walletAddress ?? (win.phantom as Record<string, unknown>)?.solana ?? win.solana);

  useEffect(() => {
    api.getResources().then((rs) => {
      setResources(rs);
      if (rs.length > 0) setSelectedId(rs[0].id);
    });
  }, []);

  const selectedResource = resources.find((r) => r.id === selectedId) ?? null;

  const confirmWalletPayment = useCallback(async (data: SimData) => {
    if (!walletAddress) {
      resolveWalletRef.current?.(null);
      return;
    }
    setWalletError(null);
    setWalletConfirming(true);
    try {
      const sig = await sendSolanaPayment(data.resource, walletAddress);
      resolveWalletRef.current?.(sig);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setWalletError(msg);
      resolveWalletRef.current?.(null);
    } finally {
      setWalletConfirming(false);
    }
  }, [walletAddress]);

  const skipRealTx = useCallback(() => {
    resolveWalletRef.current?.(null);
  }, []);

  const runSimulation = useCallback(async () => {
    if (!selectedResource) return;
    cancelRef.current = false;
    setWalletError(null);

    const partialData = buildSimData(selectedResource, walletAddress, undefined, false);
    setSimData(partialData);
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

      if (i === 4) {
        if (canDoRealTx && selectedResource.price_token === "SOL") {
          setPhase("waiting_wallet");
          const sig = await new Promise<string | null>((resolve) => {
            resolveWalletRef.current = resolve;
          });
          if (cancelRef.current) return;
          setPhase("running");

          if (sig) {
            const realData = buildSimData(selectedResource, walletAddress, sig, true);
            setSimData(realData);
            newStatuses[i] = "done";
            newTimes[i] = 1400;
            runningTotal += 1400;
            setStepStatuses([...newStatuses]);
            setStepTimes([...newTimes]);
            setTotalTime(runningTotal);

            try {
              const payment = await api.createPayment({
                resource_id: realData.resource.id,
                resource_name: realData.resource.name,
                amount_lamports: realData.amountRaw,
                token: realData.resource.price_token,
                payer_wallet: realData.payerWallet,
                tx_signature: sig,
                status: "settled",
              });
              setCreatedPaymentId(payment.id ?? null);
            } catch {}
            continue;
          }
        }

        await new Promise((r) => setTimeout(r, 1400));
        if (cancelRef.current) return;

        try {
          const payment = await api.createPayment({
            resource_id: partialData.resource.id,
            resource_name: partialData.resource.name,
            amount_lamports: partialData.amountRaw,
            token: partialData.resource.price_token,
            payer_wallet: partialData.payerWallet,
            tx_signature: partialData.txSignature,
            status: "settled",
          });
          setCreatedPaymentId(payment.id ?? null);
        } catch {}

        newStatuses[i] = "done";
        newTimes[i] = 1400;
        runningTotal += 1400;
        setStepStatuses([...newStatuses]);
        setStepTimes([...newTimes]);
        setTotalTime(runningTotal);
        continue;
      }

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

    setPhase("complete");
  }, [selectedResource, walletAddress, canDoRealTx]);

  const reset = () => {
    cancelRef.current = true;
    resolveWalletRef.current?.(null);
    resolveWalletRef.current = null;
    setPhase("idle");
    setCurrentStep(-1);
    setSimData(null);
    setCreatedPaymentId(null);
    setStepStatuses(STEPS.map(() => "pending"));
    setStepTimes(STEPS.map(() => 0));
    setTotalTime(0);
    setViewingStep(0);
    setWalletError(null);
  };

  const isRealTxMode = canDoRealTx && selectedResource?.price_token === "SOL";

  return (
    <div className="flex flex-col h-full bg-background text-foreground">

      <div className="border-b border-border px-6 py-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[16px] font-medium">Handshake Playground</h1>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">
              {isRealTxMode
                ? "Live mode — settlement step will trigger a real Solana transaction from your wallet."
                : "Step through the x402-inspired payment request lifecycle end-to-end on Solana."}
            </p>
          </div>

          {phase === "complete" && createdPaymentId && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-accent/20 bg-accent/8 text-[12px] text-accent font-mono flex-shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
              {simData?.isRealTx ? "On-chain settlement" : "Settlement recorded"} · {createdPaymentId}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <div className="flex-1 max-w-xs">
            <label className="block text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground/60 mb-1.5">Resource</label>
            <div className="relative">
              <select
                value={selectedId}
                onChange={(e) => { setSelectedId(e.target.value); if (phase !== "idle") reset(); }}
                disabled={phase === "running" || phase === "waiting_wallet"}
                className="w-full h-8 pl-3 pr-8 rounded-md border border-border bg-surface/40 text-[12.5px] text-foreground appearance-none focus:outline-none focus:border-accent/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resources.length === 0 && <option value="">No resources — add one first</option>}
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>{r.name} — {r.endpoint}</option>
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
              <span className={`text-[10px] font-mono uppercase tracking-[0.12em] px-2 py-0.5 rounded border ${selectedResource.status === "active" ? "text-accent bg-accent/10 border-accent/20" : "text-muted-foreground bg-surface/20 border-border"}`}>
                {selectedResource.status}
              </span>
              {isRealTxMode && (
                <>
                  <span className="text-muted-foreground/30 mx-1">·</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-accent/30 bg-accent/10 text-accent uppercase tracking-[0.12em]">live</span>
                </>
              )}
            </div>
          )}

          <div className="ml-auto mt-5 flex items-center gap-2">
            {phase !== "idle" && (
              <button onClick={reset} className="h-8 px-3 rounded-md border border-border text-[12px] text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors">
                Reset
              </button>
            )}
            <button
              onClick={phase === "idle" || phase === "complete" ? runSimulation : undefined}
              disabled={phase === "running" || phase === "waiting_wallet" || !selectedResource || resources.length === 0}
              className={`h-8 px-4 rounded-md text-[12.5px] font-medium transition-all flex items-center gap-2 ${
                phase === "running" || phase === "waiting_wallet"
                  ? "bg-accent/20 text-accent border border-accent/30 cursor-not-allowed"
                  : "bg-accent text-background hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {phase === "running" ? (
                <><span className="h-2 w-2 rounded-full bg-accent animate-pulse flex-shrink-0" />Running…</>
              ) : phase === "waiting_wallet" ? (
                <><span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />Waiting for wallet…</>
              ) : phase === "complete" ? (
                "Run again"
              ) : (
                isRealTxMode ? "Run live payment" : "Run simulation"
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        <div className="w-72 flex-shrink-0 border-r border-border overflow-y-auto p-4 space-y-0">
          {STEPS.map((step, i) => {
            const status = stepStatuses[i];
            const isViewing = viewingStep === i;
            const hasData = simData !== null && (status === "done" || status === "active");
            const ms = stepTimes[i];
            const isWaitingHere = i === 4 && phase === "waiting_wallet";

            return (
              <div key={step.id} className="relative">
                {i < STEPS.length - 1 && (
                  <div className={`absolute left-[18px] top-[36px] w-px h-[calc(100%-4px)] transition-colors duration-500 ${
                    stepStatuses[i] === "done" ? "bg-border" : "bg-border/30"
                  }`} />
                )}

                <button
                  onClick={() => hasData && setViewingStep(i)}
                  disabled={!hasData && !isWaitingHere}
                  className={`relative w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-all ${
                    hasData || isWaitingHere ? "cursor-pointer hover:bg-white/4" : "cursor-default"
                  } ${isViewing && (hasData || isWaitingHere) ? "bg-white/5" : ""}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {status === "pending" && !isWaitingHere && (
                      <div className="h-5 w-5 rounded-full border border-border bg-surface/20 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />
                      </div>
                    )}
                    {(status === "active" || isWaitingHere) && (
                      <div className={`h-5 w-5 rounded-full border ${isWaitingHere ? "border-amber-400/40 bg-amber-400/10" : `${step.color.replace("text-", "border-")}/40 bg-surface/40`} flex items-center justify-center`}>
                        <div className={`h-2 w-2 rounded-full ${isWaitingHere ? "bg-amber-400" : step.dot} animate-pulse`} />
                      </div>
                    )}
                    {status === "done" && (
                      <div className={`h-5 w-5 rounded-full border ${step.color.replace("text-", "border-")}/40 flex items-center justify-center`}
                        style={{ background: "rgba(var(--accent-rgb, 14 165 233), 0.08)" }}>
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" className={step.color}>
                          <path d="M1.5 4.5l2 2 3.5-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`text-[12.5px] font-medium leading-tight ${
                      status === "done" ? step.color :
                      isWaitingHere ? "text-amber-400" :
                      status === "active" ? step.color :
                      "text-muted-foreground/40"
                    }`}>
                      {step.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground/40 leading-tight mt-0.5 line-clamp-2">
                      {isWaitingHere ? "Waiting for wallet signature…" : step.desc}
                    </div>
                    {ms > 0 && (
                      <div className={`text-[10px] font-mono mt-1 ${step.color} opacity-60`}>{ms}ms</div>
                    )}
                  </div>
                </button>
              </div>
            );
          })}

          {phase === "complete" && simData && (
            <div className="mt-4 pt-4 border-t border-border/30">
              <div className="text-[10px] font-mono uppercase tracking-[0.14em] text-muted-foreground/40 mb-2">Total</div>
              <div className="text-[13px] font-mono text-foreground">{totalTime}ms</div>
              {simData.isRealTx && (
                <a
                  href={`https://solscan.io/tx/${simData.txSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 mt-3 text-[11px] font-mono text-accent hover:text-accent/80 transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5.5 1.5H8.5V4.5"/><path d="M8.5 1.5L4 6"/><path d="M4.5 2.5H2A.5.5 0 0 0 1.5 3V8A.5.5 0 0 0 2 8.5H7A.5.5 0 0 0 7.5 8V5.5"/></svg>
                  View on Solscan
                </a>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {phase === "waiting_wallet" && (
            <div className="border-b border-amber-500/20 bg-amber-500/5 px-6 py-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-[13px] font-medium text-amber-400">Settlement step — wallet confirmation required</div>
                <div className="text-[11.5px] text-amber-400/70 mt-0.5">
                  Send {lamportsToDisplay(selectedResource?.price_lamports ?? 0, "SOL")} SOL from{" "}
                  <span className="font-mono">{walletAddress ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-4)}` : "your wallet"}</span>
                  {" "}to confirm settlement on Solana mainnet.
                </div>
                {walletError && (
                  <div className="mt-1.5 text-[11px] text-red-400 font-mono">{walletError}</div>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={skipRealTx}
                  className="h-8 px-3 rounded-md border border-border text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  Use simulation
                </button>
                <button
                  onClick={() => simData && confirmWalletPayment(simData)}
                  disabled={walletConfirming}
                  className="h-8 px-4 rounded-md bg-amber-500 text-background text-[12.5px] font-medium hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {walletConfirming ? (
                    <><span className="h-2 w-2 rounded-full bg-background/70 animate-pulse" />Confirming on-chain…</>
                  ) : (
                    "Confirm with wallet"
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="flex border-b border-border flex-shrink-0 overflow-x-auto">
            {STEP_LABELS.map((label, i) => {
              const status = stepStatuses[i];
              const isWaitingHere = i === 4 && phase === "waiting_wallet";
              return (
                <button
                  key={i}
                  onClick={() => {
                    const hasData = simData !== null && (status === "done" || status === "active");
                    if (hasData || isWaitingHere) setViewingStep(i);
                  }}
                  className={`px-4 py-2.5 text-[11.5px] font-mono whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                    viewingStep === i
                      ? `border-accent ${isWaitingHere ? "text-amber-400" : "text-accent"}`
                      : status === "done"
                        ? "border-transparent text-muted-foreground/60 hover:text-muted-foreground"
                        : "border-transparent text-muted-foreground/30 cursor-default"
                  }`}
                >
                  {label}
                  {status === "done" && simData?.isRealTx && i === 4 && (
                    <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded bg-accent/20 text-accent">live</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {simData ? (
              <StepPayload step={viewingStep} data={simData} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="h-14 w-14 rounded-2xl border border-border bg-surface/40 flex items-center justify-center mb-5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-muted-foreground/40">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <p className="text-[14px] text-muted-foreground/50 font-medium mb-1.5">
                  {resources.length === 0 ? "No resources yet" : "Ready to run"}
                </p>
                <p className="text-[12px] text-muted-foreground/35 max-w-xs">
                  {resources.length === 0
                    ? "Add a resource first, then run the payment flow."
                    : isRealTxMode
                      ? "Click Run live payment — the settlement step will prompt your Solana wallet for a real on-chain transaction."
                      : "Click Run simulation to step through the full x402 payment lifecycle."}
                </p>
                {!hasExternalWallet && resources.length > 0 && (
                  <div className="mt-4 px-4 py-3 rounded-lg border border-border/40 bg-surface/20 text-[11.5px] text-muted-foreground/60 max-w-xs">
                    Install <span className="text-foreground">Phantom</span> or <span className="text-foreground">Backpack</span> to enable live on-chain settlement. Currently running in simulation mode.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
