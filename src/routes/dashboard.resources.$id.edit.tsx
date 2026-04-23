import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { resourceStore, useResource, type ResourceType, type PricingModel, type Visibility, type Environment, type ResourceStatus } from "@/lib/resourceStore";

export const Route = createFileRoute("/dashboard/resources/$id/edit")({
  component: EditResourcePage,
});

const RESOURCE_TYPES: { label: ResourceType; icon: string }[] = [
  { label: "API Endpoint",                icon: "⬡" },
  { label: "Agent Capability",            icon: "◈" },
  { label: "Tool Action",                 icon: "⬟" },
  { label: "Dataset Access",              icon: "▣" },
  { label: "Content / Digital Asset",     icon: "◉" },
  { label: "Webhook / Automation Action", icon: "◎" },
];

const METHODS  = ["GET", "POST", "PUT", "PATCH", "DELETE", "INVOKE"] as const;
const ENVS     = ["Development", "Staging", "Production"] as const;
const ASSETS   = ["USDC", "SOL"] as const;
const PRICING_MODELS: { value: PricingModel; label: string; desc: string }[] = [
  { value: "fixed per request",   label: "Per request",   desc: "Charge each time the endpoint is called." },
  { value: "fixed per execution", label: "Per execution", desc: "Charge each time the capability runs."    },
  { value: "fixed per access",    label: "Per access",    desc: "One payment grants time-bounded access."  },
];
const VISIBILITIES: { value: Visibility; label: string; desc: string }[] = [
  { value: "public",  label: "Public",  desc: "Listed in catalog. Anyone can pay and access." },
  { value: "gated",   label: "Gated",   desc: "Requires payment + allowlisted callers."       },
  { value: "private", label: "Private", desc: "Not listed. Only direct URL callers."          },
];

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function Input({ value, onChange, placeholder, error, type = "text" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; error?: string; type?: string;
}) {
  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-10 rounded-lg border px-3 text-[13px] font-mono text-foreground placeholder:text-muted-foreground/40 bg-background/60 focus:outline-none transition-colors ${
          error ? "border-red-500/60 focus:border-red-500/80" : "border-border focus:border-accent/50 focus:ring-1 focus:ring-accent/15"
        }`}
      />
      {error && <p className="mt-1.5 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

function Section({ n, title, desc, children }: { n: number; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-background/30">
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 h-6 w-6 rounded-full bg-accent/10 border border-accent/20 text-[11px] font-mono text-accent flex items-center justify-center">{n}</span>
          <div>
            <div className="text-[13px] font-medium">{title}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

function EditResourcePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const r = useResource(id);

  const [name,         setName]         = useState(r?.name         ?? "");
  const [type,         setType]         = useState<ResourceType>(r?.type ?? "API Endpoint");
  const [description,  setDescription]  = useState(r?.description  ?? "");
  const [url,          setUrl]          = useState(r?.url          ?? "");
  const [method,       setMethod]       = useState(r?.method       ?? "POST");
  const [version,      setVersion]      = useState(r?.version      ?? "");
  const [environment,  setEnvironment]  = useState<Environment>(r?.environment ?? "Production");
  const [pricingModel, setPricingModel] = useState<PricingModel>(r?.pricingModel ?? "fixed per request");
  const [amount,       setAmount]       = useState(r?.amount       ?? "");
  const [asset,        setAsset]        = useState<"USDC"|"SOL">(r?.asset ?? "USDC");
  const [visibility,   setVisibility]   = useState<Visibility>(r?.visibility ?? "public");
  const [status,       setStatus]       = useState<ResourceStatus>(r?.status ?? "draft");
  const [errors,       setErrors]       = useState<Record<string, string>>({});
  const [saving,       setSaving]       = useState(false);

  if (!r) {
    return (
      <div className="p-6 max-w-[900px]">
        <Link to="/dashboard/resources" className="text-[12px] font-mono text-muted-foreground hover:text-foreground transition-colors">← Resources</Link>
        <div className="mt-12 text-center text-[13px] text-muted-foreground">Resource not found.</div>
      </div>
    );
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim())   e.name   = "Name is required.";
    if (!url.trim())    e.url    = "Endpoint URL is required.";
    if (!amount.trim() || isNaN(Number(amount))) e.amount = "A valid amount is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    resourceStore.update(id, {
      name: name.trim(),
      type, description: description.trim(),
      url: url.trim(), method, version: version.trim(),
      environment, pricingModel, amount: amount.trim(),
      asset, visibility, status,
      lastActivity: "just now",
    });
    setSaving(false);
    navigate({ to: "/dashboard/resources/$id", params: { id } });
  }

  return (
    <form onSubmit={handleSave} className="p-6 space-y-5 max-w-[760px]">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] font-mono text-muted-foreground">
        <Link to="/dashboard/resources" className="hover:text-foreground transition-colors">Resources</Link>
        <span className="text-muted-foreground/30">/</span>
        <Link to="/dashboard/resources/$id" params={{ id }} className="hover:text-foreground transition-colors">{r.name}</Link>
        <span className="text-muted-foreground/30">/</span>
        <span className="text-foreground">Edit</span>
      </div>

      <div>
        <h1 className="text-xl font-semibold">Edit resource</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Update the configuration for this monetized resource.</p>
      </div>

      {/* Section 1 */}
      <Section n={1} title="Basic information" desc="Update the name, type, and description.">
        <div>
          <FieldLabel required>Resource name</FieldLabel>
          <Input value={name} onChange={(v) => { setName(v); if (errors.name) setErrors((e) => ({ ...e, name: "" })); }} placeholder="e.g. My Inference API" error={errors.name} />
        </div>

        <div>
          <FieldLabel required>Resource type</FieldLabel>
          <div className="grid grid-cols-3 gap-2.5">
            {RESOURCE_TYPES.map((rt) => (
              <button key={rt.label} type="button" onClick={() => setType(rt.label)}
                className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
                  type === rt.label
                    ? "border-accent/60 bg-accent/8 text-foreground"
                    : "border-border bg-background/40 text-muted-foreground hover:border-border/80 hover:text-foreground"
                }`}>
                <span className="text-[16px] flex-shrink-0">{rt.icon}</span>
                <span className="text-[11px] font-medium leading-tight">{rt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Description</FieldLabel>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief description of what this resource does and who it's for."
            rows={3}
            className="w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/15 transition-colors resize-none" />
        </div>
      </Section>

      {/* Section 2 */}
      <Section n={2} title="Access details" desc="Where and how this resource is invoked.">
        <div>
          <FieldLabel required>Endpoint URL or resource identifier</FieldLabel>
          <Input value={url} onChange={(v) => { setUrl(v); if (errors.url) setErrors((e) => ({ ...e, url: "" })); }} placeholder="https://api.yourapp.com/v1/endpoint" error={errors.url} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Method / invocation type</FieldLabel>
            <div className="flex gap-1.5 flex-wrap">
              {METHODS.map((m) => (
                <button key={m} type="button" onClick={() => setMethod(m)}
                  className={`h-8 px-3 rounded-md border text-[11px] font-mono transition-colors ${
                    method === m ? "border-accent/60 bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                  }`}>{m}</button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Version</FieldLabel>
            <Input value={version} onChange={setVersion} placeholder="v1" />
          </div>
        </div>

        <div>
          <FieldLabel>Environment</FieldLabel>
          <div className="flex gap-2">
            {ENVS.map((env) => (
              <button key={env} type="button" onClick={() => setEnvironment(env)}
                className={`h-8 px-4 rounded-lg border text-[12px] font-mono transition-colors ${
                  environment === env ? "border-accent/60 bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                }`}>{env}</button>
            ))}
          </div>
        </div>
      </Section>

      {/* Section 3 */}
      <Section n={3} title="Payment configuration" desc="How callers pay to access this resource.">
        <div>
          <FieldLabel>Pricing model</FieldLabel>
          <div className="grid grid-cols-3 gap-2.5">
            {PRICING_MODELS.map((pm) => (
              <button key={pm.value} type="button" onClick={() => setPricingModel(pm.value)}
                className={`p-3.5 rounded-lg border text-left transition-all ${
                  pricingModel === pm.value
                    ? "border-accent/60 bg-accent/8 text-foreground"
                    : "border-border bg-background/40 text-muted-foreground hover:border-border/80 hover:text-foreground"
                }`}>
                <div className="text-[12px] font-medium mb-1">{pm.label}</div>
                <div className="text-[10px] leading-snug opacity-70">{pm.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Amount</FieldLabel>
            <Input value={amount} onChange={(v) => { setAmount(v); if (errors.amount) setErrors((e) => ({ ...e, amount: "" })); }} placeholder="0.002" type="text" error={errors.amount} />
          </div>
          <div>
            <FieldLabel>Asset</FieldLabel>
            <div className="flex gap-2">
              {ASSETS.map((a) => (
                <button key={a} type="button" onClick={() => setAsset(a)}
                  className={`h-10 px-5 rounded-lg border text-[13px] font-mono font-medium transition-colors ${
                    asset === a ? "border-accent/60 bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                  }`}>{a}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground/70 bg-background/40 border border-border/50 rounded-lg px-3 py-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0"/>
          Payment rail: Solana · SPL tokens · ~400ms finality
        </div>

        {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
          <div className="text-[11px] font-mono text-muted-foreground/80 bg-accent/4 border border-accent/10 rounded-lg px-3 py-2.5">
            Each caller pays <span className="text-accent">{amount} {asset}</span> · settled on Solana · ~400ms
          </div>
        )}
      </Section>

      {/* Section 4 */}
      <Section n={4} title="Access policy" desc="Who can access this resource and how.">
        <div>
          <FieldLabel>Visibility</FieldLabel>
          <div className="grid grid-cols-3 gap-2.5">
            {VISIBILITIES.map((v) => (
              <button key={v.value} type="button" onClick={() => setVisibility(v.value)}
                className={`p-3.5 rounded-lg border text-left transition-all ${
                  visibility === v.value
                    ? "border-accent/60 bg-accent/8 text-foreground"
                    : "border-border bg-background/40 text-muted-foreground hover:border-border/80 hover:text-foreground"
                }`}>
                <div className="text-[12px] font-medium mb-1">{v.label}</div>
                <div className="text-[10px] leading-snug opacity-70">{v.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 opacity-50">
          {[
            { label: "Rate limit",           placeholder: "e.g. 100 req / min"          },
            { label: "Payment verification", placeholder: "Ed25519 signature (default)" },
            { label: "Settlement mode",      placeholder: "Instant · on-chain (default)" },
          ].map((f) => (
            <div key={f.label}>
              <FieldLabel>{f.label}</FieldLabel>
              <input disabled placeholder={f.placeholder}
                className="w-full h-10 rounded-lg border border-border bg-background/40 px-3 text-[13px] text-muted-foreground/50 placeholder:text-muted-foreground/30 cursor-not-allowed" />
              <p className="mt-1.5 text-[11px] text-muted-foreground/50">Coming soon</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Footer */}
      <div className="sticky bottom-0 -mx-6 px-6 py-4 border-t border-border bg-background/95 backdrop-blur flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-muted-foreground">Status:</span>
          {(["draft", "active", "paused"] as ResourceStatus[]).map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)}
              className={`h-7 px-3 rounded-md border text-[11px] font-mono capitalize transition-colors ${
                status === s
                  ? s === "active" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : s === "paused" ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                  : "border-border bg-white/5 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >{s}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard/resources/$id" params={{ id }}
            className="h-9 px-4 rounded-lg border border-border text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 h-9 px-5 rounded-lg bg-accent text-background text-[13px] font-medium hover:bg-accent/90 disabled:opacity-60 transition-colors">
            {saving ? (
              <>
                <svg className="animate-spin" width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6.5" cy="6.5" r="5" strokeOpacity=".3"/><path d="M6.5 1.5a5 5 0 0 1 5 5"/></svg>
                Saving…
              </>
            ) : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
}
