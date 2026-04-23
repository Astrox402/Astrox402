import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { resourceStore, slugify, type ResourceType, type PricingModel, type Visibility, type Environment, type Resource } from "@/lib/resourceStore";

export const Route = createFileRoute("/dashboard/resources/new")({
  component: CreateResourcePage,
});

const RESOURCE_TYPES: { value: ResourceType; icon: React.ReactNode; desc: string }[] = [
  {
    value: "API Endpoint",
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 5.5L1 9l3 3.5M14 5.5L17 9l-3 3.5M10.5 3L7.5 15"/></svg>,
    desc: "A paid HTTP endpoint",
  },
  {
    value: "Agent Capability",
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="9" cy="7" r="4"/><path d="M4 15c0-2.76 2.24-5 5-5s5 2.24 5 5"/><path d="M12 4.5l1.5-1.5M6 4.5L4.5 3"/></svg>,
    desc: "An AI agent action",
  },
  {
    value: "Tool Action",
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M13.5 2.5l2 2-9 9-3 1 1-3 9-9z"/><path d="M11.5 4.5l2 2"/></svg>,
    desc: "A callable tool function",
  },
  {
    value: "Dataset Access",
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><ellipse cx="9" cy="5" rx="6" ry="2.5"/><path d="M3 5v4c0 1.38 2.69 2.5 6 2.5S15 10.38 15 9V5"/><path d="M3 9v4c0 1.38 2.69 2.5 6 2.5S15 14.38 15 13V9"/></svg>,
    desc: "A paid dataset or feed",
  },
  {
    value: "Content / Digital Asset",
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="2" y="2" width="14" height="14" rx="2"/><path d="M6 6h6M6 9h6M6 12h4"/></svg>,
    desc: "File, model, or content",
  },
  {
    value: "Webhook / Automation Action",
    icon: <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 9a6 6 0 0 1 9.9-4.55M15 9a6 6 0 0 1-9.9 4.55"/><path d="M9 6v3l2 2"/></svg>,
    desc: "Triggered automation",
  },
];

const PRICING_MODELS: { value: PricingModel; label: string; desc: string }[] = [
  { value: "fixed per request",   label: "Per request",   desc: "Charge once per HTTP call" },
  { value: "fixed per execution", label: "Per execution", desc: "Charge once per job run" },
  { value: "fixed per access",    label: "Per access",    desc: "Charge per session or download" },
];

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "INVOKE"];
const ENVS: Environment[] = ["Development", "Staging", "Production"];
const VISIBILITIES: { value: Visibility; label: string; desc: string }[] = [
  { value: "public",  label: "Public",  desc: "Discoverable by anyone" },
  { value: "gated",   label: "Gated",   desc: "Pay-walled, link-only" },
  { value: "private", label: "Private", desc: "API key required" },
];

interface FormErrors {
  name?: string;
  type?: string;
  url?: string;
  amount?: string;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
      {children}{required && <span className="text-accent/60 ml-1">*</span>}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = "text", error, className = "" }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; error?: string; className?: string;
}) {
  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-10 rounded-lg border px-3 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors bg-background/60 ${
          error ? "border-red-500/60 focus:border-red-500/80 focus:ring-1 focus:ring-red-500/20" : "border-border focus:border-accent/50 focus:ring-1 focus:ring-accent/15"
        } ${className}`}
      />
      {error && <p className="mt-1.5 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

function Section({ n, title, desc, children }: { n: number; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-[oklch(0.10_0.005_250)] overflow-hidden">
      <div className="flex items-start gap-4 p-5 border-b border-border/60">
        <div className="h-6 w-6 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center text-[11px] font-mono font-bold text-accent flex-shrink-0 mt-0.5">
          {n}
        </div>
        <div>
          <div className="text-[14px] font-medium text-foreground">{title}</div>
          <div className="text-[12px] text-muted-foreground mt-0.5">{desc}</div>
        </div>
      </div>
      <div className="p-5 space-y-5">{children}</div>
    </div>
  );
}

function CreateResourcePage() {
  const navigate = useNavigate();

  const [name, setName]               = useState("");
  const [type, setType]               = useState<ResourceType | "">("");
  const [description, setDescription] = useState("");
  const [url, setUrl]                 = useState("");
  const [method, setMethod]           = useState("POST");
  const [version, setVersion]         = useState("");
  const [env, setEnv]                 = useState<Environment>("Production");
  const [pricingModel, setPricingModel] = useState<PricingModel>("fixed per request");
  const [amount, setAmount]           = useState("");
  const [asset, setAsset]             = useState<"USDC" | "SOL">("USDC");
  const [visibility, setVisibility]   = useState<Visibility>("public");
  const [status, setStatus]           = useState<"draft" | "active">("active");
  const [errors, setErrors]           = useState<FormErrors>({});
  const [submitting, setSubmitting]   = useState(false);

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!name.trim()) e.name = "Resource name is required.";
    if (!type) e.type = "Select a resource type.";
    if (!url.trim()) e.url = "Endpoint URL or identifier is required.";
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      e.amount = "Enter a valid amount greater than 0.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1100));

    const id = `user-${Date.now()}`;
    const resource: Resource = {
      id, name: name.trim(), type: type as ResourceType, description: description.trim(),
      url: url.trim(), method, version: version.trim() || "v1", environment: env,
      pricingModel, amount: Number(amount).toString(), asset, scope: slugify(name.trim()),
      ttl: "60s", visibility, status, network: "Solana",
      requests: 0, revenue: "$0.00", lastActivity: "just now",
      createdAt: new Date().toISOString().slice(0, 10),
      logs: [], payments: [],
    };
    resourceStore.add(resource);
    setSubmitting(false);
    navigate({ to: "/dashboard/resources/$id", params: { id } });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="max-w-[780px] mx-auto p-6 space-y-5">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12px] font-mono text-muted-foreground">
          <Link to="/dashboard/resources" className="hover:text-foreground transition-colors">← Resources</Link>
          <span className="text-muted-foreground/30">/</span>
          <span className="text-foreground">New resource</span>
        </div>

        {/* Page header */}
        <div>
          <h1 className="text-xl font-semibold">Create a monetized resource</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Define a paid endpoint, capability, or digital asset and enable Solana-native settlement.
          </p>
        </div>

        {/* ── Section 1: Basic Information ── */}
        <Section n={1} title="Basic information" desc="Name and classify your resource.">
          <div>
            <FieldLabel required>Resource name</FieldLabel>
            <Input
              value={name}
              onChange={(v) => { setName(v); if (errors.name) setErrors((e) => ({ ...e, name: undefined })); }}
              placeholder="e.g. GPT Inference API"
              error={errors.name}
            />
          </div>

          <div>
            <FieldLabel required>Resource type</FieldLabel>
            {errors.type && <p className="mb-2 text-[11px] text-red-400">{errors.type}</p>}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {RESOURCE_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => { setType(t.value); if (errors.type) setErrors((e) => ({ ...e, type: undefined })); }}
                  className={`flex flex-col gap-2 p-3.5 rounded-lg border text-left transition-all ${
                    type === t.value
                      ? "border-accent/60 bg-accent/8 text-foreground"
                      : "border-border bg-background/40 text-muted-foreground hover:border-border/80 hover:text-foreground hover:bg-white/4"
                  }`}
                >
                  <span className={type === t.value ? "text-accent" : ""}>{t.icon}</span>
                  <div>
                    <div className="text-[12px] font-medium leading-tight">{t.value}</div>
                    <div className="text-[10px] mt-0.5 text-muted-foreground">{t.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of what this resource does and who it's for."
              rows={3}
              className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/15 transition-colors resize-none"
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground/60">Optional. Shown in your resource catalog.</p>
          </div>
        </Section>

        {/* ── Section 2: Access Details ── */}
        <Section n={2} title="Access details" desc="Where and how this resource is invoked.">
          <div>
            <FieldLabel required>Endpoint URL or resource identifier</FieldLabel>
            <Input
              value={url}
              onChange={(v) => { setUrl(v); if (errors.url) setErrors((e) => ({ ...e, url: undefined })); }}
              placeholder="https://api.yourapp.com/v1/endpoint"
              error={errors.url}
            />
            <p className="mt-1.5 text-[11px] text-muted-foreground/60">The URL or identifier callers will pay to access.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Method / invocation type</FieldLabel>
              <div className="flex gap-1.5 flex-wrap">
                {METHODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`h-8 px-3 rounded-md text-[11px] font-mono transition-colors ${
                      method === m
                        ? "bg-accent/15 border border-accent/40 text-accent"
                        : "bg-white/4 border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Version</FieldLabel>
              <Input value={version} onChange={setVersion} placeholder="v1" />
              <p className="mt-1.5 text-[11px] text-muted-foreground/60">Optional.</p>
            </div>
          </div>

          <div>
            <FieldLabel>Environment</FieldLabel>
            <div className="flex gap-2">
              {ENVS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEnv(e)}
                  className={`h-8 px-4 rounded-md text-[12px] transition-colors ${
                    env === e
                      ? "bg-accent/10 border border-accent/30 text-accent font-medium"
                      : "bg-white/4 border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Section 3: Payment Configuration ── */}
        <Section n={3} title="Payment configuration" desc="Set how much callers pay and which asset is used.">
          <div>
            <FieldLabel>Pricing model</FieldLabel>
            <div className="grid grid-cols-3 gap-2.5">
              {PRICING_MODELS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setPricingModel(m.value)}
                  className={`flex flex-col gap-1 p-3.5 rounded-lg border text-left transition-all ${
                    pricingModel === m.value
                      ? "border-accent/50 bg-accent/8 text-foreground"
                      : "border-border bg-background/40 text-muted-foreground hover:border-border/80 hover:bg-white/4 hover:text-foreground"
                  }`}
                >
                  <div className="text-[12px] font-medium">{m.label}</div>
                  <div className="text-[10px] text-muted-foreground">{m.desc}</div>
                </button>
              ))}
              <div className="flex flex-col gap-1 p-3.5 rounded-lg border border-border/40 bg-background/20 opacity-40 cursor-not-allowed">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-medium text-muted-foreground">Usage-based</span>
                  <span className="text-[9px] font-mono border border-border rounded px-1 text-muted-foreground/60">soon</span>
                </div>
                <div className="text-[10px] text-muted-foreground">Metered billing</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Amount</FieldLabel>
              <div className="flex gap-2">
                <Input
                  value={amount}
                  onChange={(v) => { setAmount(v); if (errors.amount) setErrors((e) => ({ ...e, amount: undefined })); }}
                  type="number"
                  placeholder="0.002"
                  error={errors.amount}
                  className="[appearance:textfield]"
                />
                <div className="flex gap-1 flex-shrink-0">
                  {(["USDC", "SOL"] as const).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAsset(a)}
                      className={`h-10 px-3 rounded-lg border text-[12px] font-mono transition-colors ${
                        asset === a
                          ? "bg-accent/15 border-accent/40 text-accent"
                          : "bg-white/4 border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <FieldLabel>Payment rail</FieldLabel>
              <div className="h-10 flex items-center gap-2 px-3 rounded-lg border border-border/50 bg-background/30 text-[12px] font-mono text-muted-foreground cursor-default">
                <span className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"/>
                Solana · SPL tokens
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground/60">Settlement is Solana-native. ~400ms finality.</p>
            </div>
          </div>

          {amount && Number(amount) > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-accent/5 border border-accent/15 text-[12px] font-mono">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-accent flex-shrink-0"><circle cx="7" cy="7" r="6"/><path d="M7 4v3l2 2"/></svg>
              <span className="text-muted-foreground">Each caller pays</span>
              <span className="text-accent font-medium">{amount} {asset}</span>
              <span className="text-muted-foreground">· settled on Solana · ~400ms</span>
            </div>
          )}
        </Section>

        {/* ── Section 4: Access Policy ── */}
        <Section n={4} title="Access policy" desc="Control visibility and verification behavior.">
          <div>
            <FieldLabel>Visibility</FieldLabel>
            <div className="grid grid-cols-3 gap-2.5">
              {VISIBILITIES.map((v) => (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => setVisibility(v.value)}
                  className={`flex flex-col gap-1 p-3.5 rounded-lg border text-left transition-all ${
                    visibility === v.value
                      ? "border-accent/50 bg-accent/8 text-foreground"
                      : "border-border bg-background/40 text-muted-foreground hover:border-border/80 hover:bg-white/4 hover:text-foreground"
                  }`}
                >
                  <div className="text-[12px] font-medium">{v.label}</div>
                  <div className="text-[10px] text-muted-foreground">{v.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 opacity-50">
            {[
              { label: "Rate limit", placeholder: "e.g. 100 req / min" },
              { label: "Payment verification", placeholder: "Ed25519 signature (default)" },
            ].map((f) => (
              <div key={f.label}>
                <FieldLabel>{f.label}</FieldLabel>
                <input
                  disabled
                  placeholder={f.placeholder}
                  className="w-full h-10 rounded-lg border border-border bg-background/40 px-3 text-[13px] text-muted-foreground/50 placeholder:text-muted-foreground/30 cursor-not-allowed"
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground/50">Coming soon</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Footer / Submit bar ── */}
        <div className="sticky bottom-0 -mx-6 px-6 py-4 border-t border-border bg-[oklch(0.08_0.005_250)]/95 backdrop-blur-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-muted-foreground">Publish as:</span>
            <div className="flex items-center gap-1.5">
              {(["draft", "active"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`h-7 px-3 rounded-md text-[11px] font-mono capitalize transition-colors ${
                    status === s
                      ? s === "active"
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                        : "bg-border/40 border border-border text-muted-foreground"
                      : "text-muted-foreground/50 hover:text-muted-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/resources"
              className="h-9 px-4 rounded-lg border border-border text-[13px] text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors flex items-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="h-9 px-5 rounded-lg bg-accent text-background text-[13px] font-medium hover:bg-accent/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Creating…
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.5 1v11M1 6.5h11"/></svg>
                  Create resource
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </form>
  );
}
