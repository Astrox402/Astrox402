import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, Code, Callout, PageFooterNav, Mono } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/security")({
  head: () => ({
    meta: [
      { title: "Security model — Astro Docs" },
      { name: "description", content: "Threat model, replay protection, Ed25519 signature scheme, key management, and audit posture for the Astro payment control plane on Solana." },
      { property: "og:title", content: "Security model — Astro Docs" },
      { property: "og:description", content: "How Astro prevents replay, overpay, key compromise, and silent settlement failures on Solana." },
    ],
  }),
  component: SecurityPage,
});

const TOC = [
  { id: "principles", label: "Principles" },
  { id: "threats", label: "Threat model" },
  { id: "replay", label: "Replay protection" },
  { id: "overpay", label: "Overpay protection" },
  { id: "signatures", label: "Signature scheme" },
  { id: "keys", label: "Key management" },
  { id: "agents", label: "Agent containment" },
  { id: "audits", label: "Security posture & disclosure" },
];

function SecurityPage() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Security"
        title="Security model"
        intro="Astro's security model is built on a small number of strong guarantees: every payment is bound to a single resource, every intent is single-use, and every settlement is publicly verifiable on Solana. This page documents the threat model, the defenses, and the operational posture."
      />

      <DocSection id="principles" title="Principles">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>No implicit trust.</strong> Every authorization is an explicit, signed message bound to specific values.</li>
          <li><strong>No silent failure.</strong> A successful response always carries a verifiable receipt; absence of a receipt is a failure signal.</li>
          <li><strong>No central kill-switch.</strong> Astro cannot revoke your endpoint, freeze your settlements, or block a counterparty.</li>
          <li><strong>No proprietary cryptography.</strong> Ed25519, SPL tokens, and Solana programs — standard primitives throughout.</li>
        </ul>
      </DocSection>

      <DocSection id="threats" title="Threat model">
        <p>
          Astro is designed to defend against an attacker who can observe all network traffic, intercept and replay any HTTP message, and freely interact with any public program on Solana. The attacker is assumed <em>not</em> to have access to the payer's private key — that is the only secret the system relies on.
        </p>
        <p>
          Within that model, the protocol prevents: replay of a captured intent against the same or a different resource; reuse of a quote past its TTL; collusion between a malicious server and a third party to extract a higher-value payment; silent dropping of a settlement transaction; and substitution of a different recipient in the settlement step.
        </p>
        <Callout tone="muted">
          Astro does <strong>not</strong> defend against compromise of the payer's signing key, against handler bugs that disclose data after payment, or against denial-of-service against Solana. These are out of scope and require defenses at the wallet, application, and infrastructure layers respectively.
        </Callout>
      </DocSection>

      <DocSection id="replay" title="Replay protection">
        <p>
          Every quote includes a single-use nonce that is bound to the exact resource, payer, amount, and expiry. Once an intent referencing that nonce is settled, the nonce is consumed in the Solana program's onchain registry — any subsequent attempt to reuse it reverts at the program level, before any value moves.
        </p>
        <p>
          Nonces are issued by the server and never reused, even across resources. They have no value outside their bound context: an intent for resource A cannot be presented to resource B, an intent for amount X cannot be inflated to amount Y, and an intent past its expiry is rejected by both the server and the settlement program.
        </p>
      </DocSection>

      <DocSection id="overpay" title="Overpay protection">
        <p>
          The signed amount in the intent is exact. The settlement program transfers <em>exactly</em> that amount and reverts if asked to transfer more. There is no mechanism — protocol-level, program-level, or SDK-level — by which a server can extract a larger payment than the quote it issued.
        </p>
        <p>
          For two-phase pricing (<Mono>quote</Mono> + <Mono>commit</Mono>), the quote acts as a hard ceiling. The commit step can only settle an amount equal to or less than the quoted ceiling; any remainder is returned to the payer atomically as part of the same transaction.
        </p>
      </DocSection>

      <DocSection id="signatures" title="Signature scheme">
        <p>
          Intents are signed using standard Ed25519 — the same scheme used by Solana accounts. A domain separator binds signatures to the protocol name, version, and Solana cluster, preventing cross-protocol and cross-cluster replay. The structured message format binds the signature to specific named fields, preventing the kind of ambiguous-message attacks that have historically affected untyped <Mono>signMessage</Mono> flows.
        </p>
        <Code lang="ts" code={`// Domain separator (simplified)
{
  name:    "Astro",
  version: "1",
  cluster: "mainnet-beta",
  program: "<settlement-program-address>"
}`} />
        <p>
          Because Ed25519 is native to Solana, every standard Solana wallet — hardware, mobile, browser extension, or backend MPC — can sign intents without any Astro-specific tooling installed.
        </p>
      </DocSection>

      <DocSection id="keys" title="Key management">
        <p>
          The payer's signing key never leaves the wallet. Astro works with hardware wallets, mobile wallets, embedded MPC wallets, and backend key services — anything that can produce an Ed25519 signature over a Solana-compatible message. The SDK never asks for, stores, or transmits a private key.
        </p>
        <p>
          For server-side identities (agents, batch jobs, webhooks), we strongly recommend MPC or HSM-backed keys with scope-restricted policies. The SDK provides first-class hooks for Privy, Turnkey, Squads, and AWS KMS, but any signer that satisfies the Ed25519 signing interface is supported.
        </p>
      </DocSection>

      <DocSection id="agents" title="Agent containment">
        <p>
          Autonomous agents run with a declared budget and scope allowlist. The SDK enforces both <em>before</em> signing — an agent that tries to call a denied scope or exceed its budget never produces a signature, so no value is ever at risk. The server independently enforces the same constraints at settlement, providing defense in depth.
        </p>
        <Code lang="ts" code={`const agent = astro.agent({
  identity: process.env.AGENT_KEY,  // MPC-backed signer
  budget:   "5 USDC / day",
  allow:    ["inference.*", "search.web"],
  deny:     ["*.admin", "*.fine-tune"],
});`} />
        <p>
          Budgets are local-first: the agent's own runtime is the first line of defense, the server is the second, and the Solana program is the third. A misconfigured agent cannot drain a wallet because the server will refuse to settle calls outside the agent's declared scope, and the program will revert any transfer that exceeds the signed amount.
        </p>
      </DocSection>

      <DocSection id="audits" title="Security posture & disclosure">
        <p>
          Astro's settlement programs are designed to be minimal and independently auditable. The program logic is publicly readable on Solana. A formal third-party audit is planned; the status of any completed engagements will be published in the protocol repository when available.
        </p>
        <p>
          Vulnerability disclosure is handled through a public security policy. If you find a potential security issue in the programs, the verifier, or the SDK, please report it through the responsible disclosure channel documented in the repository. Critical and high-severity findings in the settlement programs are in scope for expedited response.
        </p>
      </DocSection>

      <PageFooterNav prev={{ to: "/docs/receipts", label: "Receipts & settlement" }} next={{ to: "/docs/errors", label: "Errors & status codes" }} />
    </DocsLayout>
  );
}
