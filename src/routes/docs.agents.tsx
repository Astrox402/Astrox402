import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, Code, Callout, PageFooterNav, Mono, Params } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/agents")({
  head: () => ({
    meta: [
      { title: "Agent commerce — Astro Docs" },
      { name: "description", content: "Build autonomous agents that pay for the APIs they consume. Identities, budgets, scope allowlists, approval policies, and the agent SDK." },
      { property: "og:title", content: "Agent commerce — Astro Docs" },
      { property: "og:description", content: "Autonomous machine commerce: agents that pay for what they consume, with provable spend boundaries." },
    ],
  }),
  component: AgentsPage,
});

const TOC = [
  { id: "why", label: "Why agents pay" },
  { id: "model", label: "Identity model" },
  { id: "budgets", label: "Budgets" },
  { id: "scope", label: "Scope allowlists" },
  { id: "invoke", label: "Invoking endpoints" },
  { id: "approvals", label: "Human approvals" },
  { id: "patterns", label: "Patterns" },
  { id: "audit", label: "Auditing agents" },
];

function AgentsPage() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Clients"
        title="Agent commerce"
        intro="An autonomous agent is just a program with a wallet and a policy. Astro gives every agent a verifiable identity, an enforceable budget, and a public ledger of every call it has ever paid for — so machine commerce stops being a trust problem."
      />

      <DocSection id="why" title="Why agents pay">
        <p>
          The classic API stack assumes a human in the loop: a developer obtains an API key, configures it in their app, and a billing team handles disputes. Once you remove the human — once a model is autonomously orchestrating tools, deciding which APIs to call, and acting in real time — the assumptions break. API keys leak, budgets overrun silently, and there is no clean way to reconcile what an agent actually did against what it was authorized to do.
        </p>
        <p>
          Astro replaces the API-key model with a payment-native one. An agent does not have credentials; it has a wallet, a budget, and a scope. It cannot exceed its budget because the SDK refuses to sign past it. It cannot call outside its scope because both the client and the server enforce the allowlist. And every call it makes leaves a public, verifiable trace.
        </p>
      </DocSection>

      <DocSection id="model" title="Identity model">
        <p>
          An agent identity is a cryptographic key — typically held in an MPC service, an HSM, or a KMS — that signs off-chain signing intents on the agent's behalf. The same identity works across every Astro endpoint and every supported chain. There is no per-provider registration, no key exchange, and no rotation ceremony beyond the standard wallet rotation any operator already runs.
        </p>
        <Code lang="ts" code={`import { astro } from "@astro/sdk";

const agent = astro.agent({
  identity: process.env.AGENT_KEY,    // signer: KMS, MPC, or local
  label:    "research-bot-v3",        // for receipts and dashboards
});`} />
        <Callout tone="muted">
          Identities are <strong>recoverable but not transferable.</strong> Lose the key and the agent stops; rotate it and the new key inherits the agent's history through the operator's onchain rotation record.
        </Callout>
      </DocSection>

      <DocSection id="budgets" title="Budgets">
        <p>
          Budgets are first-class. Every agent constructor accepts a spend cap with a window — per-minute, per-hour, per-day, or per-call. The SDK enforces the cap locally before signing; the server enforces it again at settlement. An agent that hits its budget raises a typed <Mono>BudgetExceeded</Mono> error and refuses to continue until the window resets or the budget is updated.
        </p>
        <Code lang="ts" code={`const agent = astro.agent({
  identity: process.env.AGENT_KEY,
  budget: {
    perCall: "0.05 USDC",
    perHour: "1 USDC",
    perDay:  "10 USDC",
  },
});`} />
        <p>
          For multi-tenant agent systems (one runtime serving many users), budgets can be scoped per-principal — each user's calls are accounted against their own cap, with the operator's overall budget acting as a global ceiling.
        </p>
      </DocSection>

      <DocSection id="scope" title="Scope allowlists">
        <p>
          Scope allowlists are the agent's permission system. They use the same scope hierarchy as the resources themselves and support glob matching, denylists, and explicit overrides.
        </p>
        <Code lang="ts" code={`allow: ["inference.*", "search.web", "data.market.l2"],
deny:  ["*.admin", "inference.fine-tune"],`} />
        <p>
          The deny list always takes precedence. An agent that attempts to call a denied scope receives a <Mono>AstroPolicyError</Mono> at the SDK boundary — the call never reaches the network, no quote is requested, and no signature is produced. The provider never even sees the attempt.
        </p>
      </DocSection>

      <DocSection id="invoke" title="Invoking endpoints">
        <p>The agent client exposes a high-level <Mono>invoke()</Mono> method that wraps the underlying fetch with budget and scope checks:</p>
        <Code lang="ts" code={`const result = await agent.invoke("search.web", {
  q:      "x402 protocol specification",
  limit:  10,
});

// result is the parsed response body
// agent.lastReceipt holds the verified onchain receipt`} />
        <p>For lower-level control, the agent also exposes a fetch-style API identical to <Mono>astroClient</Mono>, including streaming responses, custom headers, and abort signals.</p>
      </DocSection>

      <DocSection id="approvals" title="Human approvals">
        <p>For sensitive flows — large transfers, irreversible actions, calls outside the agent's normal pattern — attach an approval callback. The agent pauses before signing and waits for confirmation, with a configurable timeout.</p>
        <Code lang="ts" code={`const agent = astro.agent({
  identity: process.env.AGENT_KEY,
  budget:   "10 USDC / day",
  approve:  async (quote) => {
    if (quote.amountUsd > 1) {
      return await ops.approve(quote);   // Slack, PagerDuty, etc.
    }
    return true;
  },
});`} />
      </DocSection>

      <DocSection id="patterns" title="Patterns">
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Tool-using LLM:</strong> the agent identity is the model runtime; budgets cap experiment cost; receipts attribute spend per conversation.</li>
          <li><strong>Multi-agent swarm:</strong> each worker has its own identity and budget; an orchestrator agent holds a higher-level budget and delegates.</li>
          <li><strong>Marketplace agent:</strong> a buyer agent compares quotes from competing endpoints and routes to the best price under a quality threshold.</li>
          <li><strong>Background worker:</strong> a cron-driven agent settles routine calls (data refreshes, indexing, reports) under a fixed daily budget.</li>
        </ul>
      </DocSection>

      <DocSection id="audit" title="Auditing agents">
        <p>
          Because every agent call produces a receipt, agent activity is fully reconstructable from the chain. The Astro dashboard exposes a per-agent timeline with spend, scope distribution, and counterparty breakdown. The reconciliation API supports the same filters programmatically — point it at an agent identity and get the full history, with every call's resource, amount, and onchain proof.
        </p>
      </DocSection>

      <PageFooterNav prev={{ to: "/docs/clients", label: "SDK clients" }} next={{ to: "/docs/faq", label: "FAQ" }} />
    </DocsLayout>
  );
}
