import { createFileRoute } from "@tanstack/react-router";
import { PageLayout } from "@/components/meridian/PageLayout";

export const Route = createFileRoute("/brand")({
  component: BrandPage,
});

const COLORS = [
  { name: "Accent", value: "oklch(0.78 0.13 195)", hex: "#2ECFCF", usage: "Primary brand color. Links, highlights, CTAs." },
  { name: "Background", value: "oklch(0.09 0.01 250)", hex: "#0C0D10", usage: "Page background." },
  { name: "Foreground", value: "oklch(0.97 0.005 250)", hex: "#F4F5F7", usage: "Primary text." },
  { name: "Muted", value: "oklch(0.55 0.02 250)", hex: "#7A7E8A", usage: "Secondary text, captions." },
  { name: "Surface", value: "oklch(0.14 0.01 250)", hex: "#191B20", usage: "Card backgrounds, panels." },
  { name: "Border", value: "oklch(0.22 0.01 250)", hex: "#2A2D35", usage: "Dividers, card borders." },
];

const RULES = [
  ["Do", "Use 'Astro' with a capital M."],
  ["Do", "Use the wordmark on dark backgrounds."],
  ["Do", "Maintain clear space equal to the M-height around the logo."],
  ["Don't", "Abbreviate to 'Mer' or use initialisms like 'MRD'."],
  ["Don't", "Place the logo on busy backgrounds without a backdrop."],
  ["Don't", "Recolor the logo to anything other than white, foreground, or accent."],
  ["Don't", "Stretch, skew, or rotate the wordmark."],
];

function BrandPage() {
  return (
    <PageLayout
      eyebrow="Brand"
      title="Astro brand assets & guidelines."
      intro="Official logos, color palette, typography, and usage guidelines for Astro. Please read the rules before using our brand assets in public."
    >
      <div className="border-t border-border pt-20 mb-20">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-10">Logo</div>
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            { label: "Dark background (preferred)", bg: "bg-background border-border", text: "text-foreground" },
            { label: "Light background", bg: "bg-white border-border", text: "text-gray-900" },
          ].map((variant) => (
            <div key={variant.label} className={`rounded-2xl border ${variant.bg} p-10 flex flex-col items-center gap-6`}>
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-8">
                  <div className={`absolute inset-0 rounded-sm border ${variant.label.includes("Dark") ? "border-accent/60" : "border-teal-500/60"}`} />
                  <div className={`absolute inset-1.5 rounded-[2px] ${variant.label.includes("Dark") ? "bg-accent/80" : "bg-teal-500"}`} />
                </div>
                <span className={`font-medium tracking-tight text-[20px] ${variant.text}`}>Astro</span>
              </div>
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">{variant.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <a href="#" className="inline-flex h-9 items-center gap-2 px-4 rounded-md border border-border text-[13px] text-muted-foreground hover:text-foreground transition-colors">
            ↓ Download logo package (.zip)
          </a>
        </div>
      </div>

      <div className="border-t border-border pt-20 mb-20">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-10">Color palette</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COLORS.map((c) => (
            <div key={c.name} className="rounded-2xl border border-border overflow-hidden">
              <div className="h-20" style={{ backgroundColor: c.hex }} />
              <div className="p-4">
                <div className="text-[14px] font-medium mb-1">{c.name}</div>
                <div className="text-[11px] font-mono text-muted-foreground mb-2">{c.hex}</div>
                <div className="text-[12.5px] text-muted-foreground">{c.usage}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-20 mb-20">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-10">Typography</div>
        <div className="space-y-6">
          {[
            { label: "Display / Headings", font: "Inter, sans-serif", weight: "500", sample: "Payment-native protocol.", size: "text-[3rem]" },
            { label: "Italic accent", font: "Playfair Display, serif", weight: "400 italic", sample: "Ethereum.", size: "text-[3rem] italic font-serif" },
            { label: "Body", font: "Inter, sans-serif", weight: "400", sample: "Astro turns any endpoint into a programmable, monetizable primitive.", size: "text-[17px]" },
            { label: "Mono / Labels", font: "JetBrains Mono, monospace", weight: "400", sample: "X-Payment-Quote · v0.402 · USDC", size: "text-[14px] font-mono" },
          ].map((t) => (
            <div key={t.label} className="rounded-2xl border border-border bg-surface/20 p-7">
              <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-1">{t.label}</div>
              <div className="text-[11px] font-mono text-muted-foreground/60 mb-4">{t.font} · {t.weight}</div>
              <div className={`${t.size} leading-tight text-foreground`}>{t.sample}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border pt-20">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-8">Usage rules</div>
        <div className="rounded-2xl border border-border overflow-hidden">
          {RULES.map(([type, rule], i) => (
            <div key={i} className="flex items-start gap-4 px-5 py-4 text-[13.5px] border-b border-border last:border-0 hover:bg-surface/20 transition-colors">
              <span className={`flex-shrink-0 text-[11px] font-mono uppercase tracking-[0.16em] border rounded px-2 py-0.5 mt-0.5 ${type === "Do" ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10" : "text-red-400 border-red-500/20 bg-red-500/10"}`}>
                {type}
              </span>
              <span className="text-muted-foreground leading-relaxed">{rule}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[13px] text-muted-foreground">
          Questions about brand usage?{" "}
          <a href="/contact" className="text-accent hover:underline">Contact us →</a>
        </p>
      </div>
    </PageLayout>
  );
}
