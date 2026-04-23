import { createFileRoute } from "@tanstack/react-router";
import { DocsLayout } from "@/components/meridian/docs/DocsLayout";
import { PageHeader, DocSection, Code, PageFooterNav, Mono, Params, Callout } from "@/components/meridian/docs/primitives";

export const Route = createFileRoute("/docs/errors")({
  head: () => ({
    meta: [
      { title: "Errors & status codes — Astro Docs" },
      { name: "description", content: "Complete reference for HTTP status codes, typed error classes, and structured error payloads emitted by the Astro protocol and SDK." },
      { property: "og:title", content: "Errors & status codes — Astro Docs" },
      { property: "og:description", content: "Status codes, typed errors, retry semantics, and structured payloads for Astro." },
    ],
  }),
  component: ErrorsPage,
});

const TOC = [
  { id: "philosophy", label: "Philosophy" },
  { id: "status", label: "HTTP status codes" },
  { id: "shape", label: "Error payload" },
  { id: "typed", label: "Typed error classes" },
  { id: "retries", label: "Retry semantics" },
  { id: "logging", label: "Logging & observability" },
];

function ErrorsPage() {
  return (
    <DocsLayout onThisPage={TOC}>
      <PageHeader
        eyebrow="Reference"
        title="Errors & status codes"
        intro="Astro errors are structured, typed, and machine-actionable. Every error response follows the same envelope, every typed class extends a common base, and every retryable failure declares its retry policy explicitly."
      />

      <DocSection id="philosophy" title="Philosophy">
        <p>
          Most billing and authorization systems return opaque strings on failure (<Mono>"insufficient_funds"</Mono>, <Mono>"unauthorized"</Mono>) that callers parse with regex. Astro treats this as a protocol-level mistake. Every error carries a stable code, a human-readable message, a typed class on the SDK side, and — when relevant — the underlying onchain transaction hash for forensic analysis.
        </p>
        <Callout>
          The rule of thumb: <strong>no caller should ever need to read an error message to decide what to do.</strong> The code and class are the contract; the message is for humans.
        </Callout>
      </DocSection>

      <DocSection id="status" title="HTTP status codes">
        <Params rows={[
          ["402", "Payment Required", "Initial response carrying the quote. Handled automatically by the SDK."],
          ["200", "OK", "Handler ran; response carries a receipt header."],
          ["409", "Conflict", "Quote expired or nonce already consumed. SDK retries with fresh quote."],
          ["422", "Unprocessable", "Intent failed verification (bad signature, wrong amount, scope mismatch)."],
          ["429", "Too Many Requests", "Resource-level rate limit. Honor the Retry-After header."],
          ["451", "Unavailable", "Resource is restricted by policy (geo, scope denylist)."],
          ["503", "Service Unavailable", "Settlement chain is congested or unreachable. Retry on a different chain if declared."],
        ]} />
      </DocSection>

      <DocSection id="shape" title="Error payload">
        <p>All non-200 responses carry a structured JSON body alongside the status code:</p>
        <Code lang="json" code={`{
  "error": {
    "code":    "MERIDIAN_QUOTE_EXPIRED",
    "message": "The quote bound to nonce 0x9f4a… expired at 2025-04-23T10:14:31Z.",
    "type":    "AstroQuoteError",
    "retry":   { "after": 0, "with": "fresh_quote" },
    "context": {
      "resource": "/v1/infer",
      "nonce":    "0x9f4a…2e1c",
      "expired":  1729680871
    }
  }
}`} />
        <p>
          The <Mono>code</Mono> is the stable identifier — never changes between versions. The <Mono>type</Mono> is the SDK class name. The <Mono>retry</Mono> object describes the recommended action; if it's absent, the error is terminal.
        </p>
      </DocSection>

      <DocSection id="typed" title="Typed error classes">
        <Params rows={[
          ["AstroQuoteError", "Price function failed or quote expired."],
          ["AstroIntentError", "Intent signature invalid or doesn't match the quote."],
          ["AstroSettleError", "Onchain settlement reverted or timed out."],
          ["AstroHandlerError", "User handler threw after payment was verified. Refund triggered automatically."],
          ["AstroPolicyError", "Client-side policy (spend cap, scope allowlist) blocked the call before signing."],
          ["AstroNetworkError", "Network failure between caller, server, or chain RPC."],
        ]} />
        <Code lang="ts" code={`import { AstroSettleError } from "@astro/sdk";

try {
  await client.fetch("/v1/infer", { method: "POST" });
} catch (err) {
  if (err instanceof AstroSettleError) {
    // err.txHash, err.chain, err.revertReason all available
    console.error("Onchain settlement failed:", err.revertReason);
  }
}`} />
      </DocSection>

      <DocSection id="retries" title="Retry semantics">
        <p>The client SDKs retry transparently on a fixed set of conditions, with bounded backoff and a configurable ceiling:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>402 → sign + retry once.</strong> No backoff; this is the normal handshake.</li>
          <li><strong>409 → fetch fresh quote, retry once.</strong> No backoff.</li>
          <li><strong>429 → honor Retry-After.</strong> No automatic retry beyond the header value.</li>
          <li><strong>503 → exponential backoff, max 3 attempts.</strong> If the resource declares multiple settlement chains, the SDK rotates.</li>
          <li><strong>422 → no retry.</strong> The intent itself was rejected; retrying with the same input will fail identically.</li>
        </ul>
      </DocSection>

      <DocSection id="logging" title="Logging & observability">
        <p>
          Every error includes a <Mono>traceId</Mono> in its context block. On the server, the same trace ID is attached to your handler's logging context so you can correlate caller-visible errors with internal traces. The Astro dashboard exposes a per-resource error explorer that joins HTTP errors, settlement reverts, and handler failures into a single timeline.
        </p>
      </DocSection>

      <PageFooterNav prev={{ to: "/docs/security", label: "Security model" }} next={{ to: "/docs/clients", label: "SDK clients" }} />
    </DocsLayout>
  );
}
