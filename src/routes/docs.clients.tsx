import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, Code, Params, PageFooterNav, Mono, Callout } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/clients")({
  head: () => ({
    meta: [
      { title: "SDK clients — Meridian Docs" },
      { name: "description", content: "Call Meridian endpoints from apps, agents, and infrastructure. Wallet config, spend limits, scope allowlists, and the agent SDK." },
      { property: "og:title", content: "SDK clients — Meridian Docs" },
      { property: "og:description", content: "Calling Meridian endpoints from apps and agents — wallets, spend limits, and machine commerce." },
    ],
  }),
  component: ClientsPage,
});

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "fetch", label: "Web client" },
  { id: "agent", label: "Agent client" },
  { id: "limits", label: "Spend limits" },
  { id: "policies", label: "Approval policies" },
  { id: "errors", label: "Errors & retries" },
  { id: "languages", label: "Languages" },
];

function ClientsPage() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Clients"
        title="SDK clients"
        intro="The client SDKs handle the 402 handshake transparently — signing intents, retrying, and surfacing receipts. Use them from web apps, backends, or autonomous agents."
      />

      <DocSection id="overview" title="Overview">
        <p>All clients share the same surface area: a fetch-style call that resolves to a typed response with an attached receipt. The differences are in <strong>identity</strong> (wallet vs. agent key) and <strong>policy</strong> (interactive vs. autonomous).</p>
      </DocSection>

      <DocSection id="fetch" title="Web client">
        <p>For human-in-the-loop applications, use a wallet-backed client.</p>
        <Code lang="ts" code={`import { meridianClient } from "@meridian/sdk";

const client = meridianClient({
  wallet:   signer,
  maxSpend: "1 USDC / hour",
});

const res = await client.fetch("/v1/infer", {
  method: "POST",
  body:   JSON.stringify({ prompt: "hello" }),
});

const data    = await res.json();
const receipt = res.receipt;        // attached automatically`} />
      </DocSection>

      <DocSection id="agent" title="Agent client">
        <p>For autonomous agents, use the <Mono>agent</Mono> client. It binds an identity, a budget, and a scope allowlist into a self-contained executor.</p>
        <Code lang="ts" code={`const agent = meridian.agent({
  identity: process.env.AGENT_KEY,
  budget:   "5 USDC / day",
  allow:    ["inference.*", "search.web", "data.market"],
});

const result = await agent.invoke("search.web", { q: "x402 spec" });`} />
        <Callout>
          The agent client never escalates beyond its declared scope or budget. Exceeding either limit raises a typed error before any settlement attempt.
        </Callout>
      </DocSection>

      <DocSection id="limits" title="Spend limits">
        <p>All client constructors accept a spend cap. Limits are evaluated locally before signing and enforced server-side at settlement.</p>
        <Params rows={[
          ["maxSpend", "string", "Total spend per window, e.g. '1 USDC / hour'."],
          ["perCallMax", "string", "Hard cap per single call."],
          ["allow", "string[]", "Scope allowlist with glob support."],
          ["deny", "string[]", "Scope denylist; takes precedence over allow."],
        ]} />
      </DocSection>

      <DocSection id="policies" title="Approval policies">
        <p>For sensitive flows, attach an approval callback. The client pauses before signing and waits for confirmation.</p>
        <Code lang="ts" code={`const client = meridianClient({
  wallet: signer,
  approve: async (quote) => {
    if (quote.amountUsd > 0.5) return await ui.confirm(quote);
    return true;
  },
});`} />
      </DocSection>

      <DocSection id="errors" title="Errors & retries">
        <Params rows={[
          ["402", "Payment required. Handled automatically."],
          ["409", "Quote expired — client retries with a fresh quote."],
          ["422", "Settlement rejected. Inspect receipt.error."],
          ["429", "Rate limited at the resource level."],
          ["LimitExceeded", "Spend or scope policy denied the call locally."],
        ]} />
      </DocSection>

      <DocSection id="languages" title="Languages">
        <p>First-party clients ship for TypeScript, Python, Go, and Rust. The wire protocol is open — additional clients can be implemented against the published specification.</p>
        <Code lang="bash" code={`# TypeScript
npm install @meridian/sdk

# Python
pip install meridian-sdk

# Go
go get github.com/meridian/sdk-go

# Rust
cargo add meridian-sdk`} />
      </DocSection>

      <PageFooterNav prev={{ to: "/docs/receipts", label: "Receipts & settlement" }} />
    </DocsLayout>
  );
}
