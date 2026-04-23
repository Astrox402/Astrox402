import { createFileRoute, Link } from "@tanstack/react-router";
import { PageLayout } from "@/components/meridian/PageLayout";

export const Route = createFileRoute("/security")({
  component: SecurityPage,
});

const THREAT_MODEL = [
  {
    threat: "Quote replay",
    mitigation: "Every quote contains a unique nonce and a TTL. Once a quote is settled, the nonce is permanently invalidated onchain. Expired quotes are rejected before the settlement call is made.",
  },
  {
    threat: "Intent replay",
    mitigation: "Intents commit to a specific quote hash. Because quotes are single-use and expire, a replayed intent will fail at the nonce check in the settlement contract.",
  },
  {
    threat: "Man-in-the-middle price manipulation",
    mitigation: "Quotes are signed with the server's Ethereum key. The client verifies the quote signature before constructing an intent. A modified price field produces an invalid signature and is rejected.",
  },
  {
    threat: "Underpayment",
    mitigation: "The settlement contract verifies that the transferred amount matches the quoted amount exactly. Partial payments revert the transaction.",
  },
  {
    threat: "Handler invocation without payment",
    mitigation: "The server middleware verifies settlement finality before passing the request to the handler. The handler cannot be invoked unless the settlement transaction is confirmed.",
  },
  {
    threat: "Unauthorized scope escalation",
    mitigation: "The scope field is part of the signed quote. A caller cannot claim access to a broader scope than the server quoted. Scope checks happen in the handler context before the business logic runs.",
  },
];

const DISCLOSURES = [
  { date: "Mar 2026", title: "No vulnerabilities found", detail: "Initial protocol audit completed by Trail of Bits. Settlement contracts on Ethereum, Base, and Optimism covered." },
  { date: "Jan 2026", title: "Informational: Gas estimation edge case", detail: "Under extreme network congestion, gas estimates in quote responses could be stale by the time of settlement. Resolved by adding a gas buffer and a client-side retry on gas estimation failure." },
];

function SecurityPage() {
  return (
    <PageLayout
      eyebrow="Security"
      title="Security model & responsible disclosure."
      intro="Astro's security posture is built on cryptographic verifiability, public contracts, and an audited protocol. Here's how it works — and how to report a vulnerability."
    >
      <div className="border-t border-border pt-20 mb-20">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-8">Threat model & mitigations</div>
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="grid grid-cols-[200px_1fr] bg-surface/40 border-b border-border px-5 py-3 text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <div>Threat</div><div>Mitigation</div>
          </div>
          {THREAT_MODEL.map(({ threat, mitigation }) => (
            <div key={threat} className="grid grid-cols-[200px_1fr] gap-6 px-5 py-4 text-[13.5px] border-b border-border last:border-0 hover:bg-surface/20 transition-colors">
              <div className="font-medium">{threat}</div>
              <div className="text-muted-foreground leading-relaxed">{mitigation}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-[13px] text-muted-foreground">
          For the complete threat model, see{" "}
          <Link to="/docs/security" className="text-accent hover:underline">the security model docs →</Link>
        </div>
      </div>

      <div className="border-t border-border pt-20 mb-20">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-8">Audits & disclosures</div>
        <div className="space-y-4">
          {DISCLOSURES.map((d) => (
            <div key={d.title} className="rounded-2xl border border-border bg-surface/20 p-6 flex gap-6">
              <div className="text-[12px] font-mono text-muted-foreground flex-shrink-0 mt-0.5">{d.date}</div>
              <div>
                <div className="text-[15px] font-medium mb-1">{d.title}</div>
                <div className="text-[13.5px] text-muted-foreground leading-relaxed">{d.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-20">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <h2 className="text-[22px] font-medium mb-3">Report a vulnerability.</h2>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-4">
              If you believe you've found a security vulnerability in the Astro protocol, SDKs, contracts, or hosted infrastructure — please disclose it responsibly.
            </p>
            <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
              We respond to all reports within 48 hours. Critical issues are patched and disclosed within 14 days. We credit researchers by name unless they prefer anonymity.
            </p>
            <a href="mailto:security@astro.xyz" className="inline-flex h-10 items-center px-5 rounded-md bg-foreground text-background text-[13.5px] font-medium hover:bg-foreground/90 transition-colors">
              security@astro.xyz →
            </a>
          </div>
          <div className="rounded-2xl border border-border bg-surface/20 p-6">
            <div className="text-[13px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-4">In scope</div>
            <ul className="space-y-2 text-[13.5px] text-muted-foreground">
              {["Settlement contracts (all chains)", "SDK intent signing and verification", "Quote encoding and signature verification", "Astro Console and hosted verifier", "Receipt indexer and API"].map((item) => (
                <li key={item} className="flex gap-2"><span className="text-accent mt-0.5">✓</span>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
