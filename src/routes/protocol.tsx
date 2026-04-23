import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/meridian/Nav";
import { Footer } from "@/components/meridian/Footer";

export const Route = createFileRoute("/protocol")({
  component: ProtocolPage,
});

const PILLARS = [
  {
    num: "01",
    title: "The 402 handshake",
    desc: "A caller requests a resource. If access requires payment, the server returns HTTP 402 with a machine-readable price quote signed with the server's key. No separate billing API. No session. Just a standard HTTP response.",
    detail: "Quote → Intent → Settlement → Response — four steps in one request lifecycle.",
  },
  {
    num: "02",
    title: "Cryptographic intents",
    desc: "The caller signs an EIP-712 typed-data intent authorizing a specific payment to a specific resource at a specific price. Signatures are verifiable onchain and off. No private key ever leaves the client.",
    detail: "Standard ECDSA over EIP-712 structured data. Compatible with every Ethereum wallet and MPC service.",
  },
  {
    num: "03",
    title: "Non-custodial settlement",
    desc: "Astro's audited settlement contracts execute atomic token transfers between caller and provider. No escrow. No intermediary. If the transfer fails, the handler never runs. If the handler runs, settlement is final.",
    detail: "Deployed on Ethereum mainnet, Base, Optimism, and Arbitrum. USDC, USDT, and native ETH supported.",
  },
  {
    num: "04",
    title: "Onchain receipts",
    desc: "Every settled call produces a verifiable receipt: a transaction hash, a signed attestation from the server, and a merkle proof anchoring the call to the settlement event. Receipts are public and permanent.",
    detail: "Verifiable by anyone. No trust in Astro required to audit a payment.",
  },
];

const SPECS = [
  ["Wire format", "HTTP/1.1 + HTTP/2", "Standard headers, standard verbs"],
  ["Quote encoding", "JSON + EIP-712", "Machine-readable, signable"],
  ["Signature scheme", "ECDSA over secp256k1", "Same as Ethereum accounts"],
  ["Settlement assets", "ERC-20 + native ETH", "USDC, USDT, ETH"],
  ["Settlement chains", "L1 + L2", "Ethereum, Base, Optimism, Arbitrum"],
  ["Receipt anchoring", "Onchain event log", "Publicly verifiable"],
  ["TTL / replay protection", "Nonce + expiry", "Quotes expire, replays fail"],
  ["Scope system", "String-based capabilities", "Fine-grained per-resource access"],
];

function ProtocolPage() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <Nav />

      <div className="pt-32 pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl mb-20">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent mb-5">Protocol</div>
            <h1 className="text-[clamp(2.5rem,5vw,4rem)] leading-[1.05] tracking-[-0.03em] font-medium text-gradient">
              The payment layer HTTP forgot.
            </h1>
            <p className="mt-6 text-[17px] leading-relaxed text-muted-foreground max-w-2xl">
              Astro is an open protocol built on the long-reserved HTTP 402 status code. It makes access and payment a single, atomic, cryptographically-verified request — with no billing infrastructure required.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link to="/docs" className="inline-flex h-10 items-center px-5 rounded-md bg-foreground text-background text-[13.5px] font-medium hover:bg-foreground/90 transition-colors">
                Read the docs
              </Link>
              <Link to="/docs/handshake" className="inline-flex h-10 items-center px-5 rounded-md border border-border text-[13.5px] text-muted-foreground hover:text-foreground transition-colors">
                The 402 handshake →
              </Link>
            </div>
          </div>

          <div className="border-t border-border pt-20 grid lg:grid-cols-2 gap-6 mb-20">
            {PILLARS.map((p) => (
              <div key={p.num} className="rounded-2xl border border-border bg-surface/30 p-8 hover:border-accent/30 transition-colors">
                <div className="text-[11px] font-mono tracking-[0.2em] text-accent mb-5">{p.num}</div>
                <h2 className="text-[20px] font-medium mb-3">{p.title}</h2>
                <p className="text-[14px] leading-relaxed text-muted-foreground mb-4">{p.desc}</p>
                <div className="text-[12.5px] font-mono text-accent/80 border-l border-accent/30 pl-3">{p.detail}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-20 mb-20">
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-8">Specification summary</div>
            <div className="rounded-2xl border border-border overflow-hidden">
              {SPECS.map(([prop, val, note], i) => (
                <div key={prop} className={`grid grid-cols-[220px_220px_1fr] gap-6 px-6 py-4 text-[13.5px] ${i % 2 === 0 ? "bg-surface/20" : ""} border-b border-border last:border-0`}>
                  <div className="font-mono text-accent">{prop}</div>
                  <div className="text-foreground">{val}</div>
                  <div className="text-muted-foreground">{note}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-20">
            <div className="max-w-2xl">
              <h2 className="text-[28px] font-medium mb-4">Open by default.</h2>
              <p className="text-[15px] text-muted-foreground leading-relaxed mb-6">
                The wire spec is public. The contracts are verified onchain. The SDKs are source-available. No part of the protocol is gated behind Astro's hosted services — if you want to implement your own client or verifier, everything you need is documented and auditable.
              </p>
              <div className="flex items-center gap-4 text-[13.5px]">
                <Link to="/docs/concepts" className="text-accent hover:underline">Core concepts →</Link>
                <Link to="/docs/architecture" className="text-muted-foreground hover:text-foreground transition-colors">Architecture →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
