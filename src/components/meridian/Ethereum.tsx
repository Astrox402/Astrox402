import { SectionHeader } from "./Section";

export function Ethereum() {
  return (
    <section id="ethereum" className="relative py-32 border-t border-border overflow-hidden">
      <div className="absolute -right-40 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-accent/8 blur-[140px] pointer-events-none" />
      <div className="relative mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <SectionHeader
            eyebrow="Settlement"
            title={<>Built on <span className="font-serif italic">Ethereum</span> — for reasons of substance, not signal.</>}
            intro="We chose Ethereum because the payment-native web needs neutral, programmable, composable settlement. Not a tribe. Infrastructure."
          />
          <ul className="mt-10 space-y-5">
            {[
              ["Credible neutrality", "A settlement layer no single party controls."],
              ["Programmable money", "Logic-defined value flows, not static rails."],
              ["Composable ecosystem", "Identity, stablecoins, accounts, intents — already there."],
              ["Open foundation", "Coordinated economics without a closed gatekeeper."],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-4">
                <div className="mt-1.5 h-1 w-6 bg-accent flex-shrink-0" />
                <div>
                  <div className="text-[15px] font-medium">{t}</div>
                  <div className="text-[13.5px] text-muted-foreground mt-0.5">{d}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="aspect-square rounded-2xl border border-border bg-surface/40 p-10 relative overflow-hidden">
            <svg viewBox="0 0 400 400" className="w-full h-full">
              <defs>
                <radialGradient id="rg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="oklch(0.78 0.13 195)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="oklch(0.78 0.13 195)" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="200" cy="200" r="180" fill="url(#rg)" />
              {[40, 80, 120, 160].map((r) => (
                <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="oklch(1 0 0 / 0.08)" />
              ))}
              {[0, 60, 120, 180, 240, 300].map((a) => {
                const rad = (a * Math.PI) / 180;
                return <line key={a} x1="200" y1="200" x2={200 + 180 * Math.cos(rad)} y2={200 + 180 * Math.sin(rad)} stroke="oklch(1 0 0 / 0.06)" />;
              })}
              {[
                [200, 60], [340, 140], [340, 260], [200, 340], [60, 260], [60, 140],
              ].map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r="4" fill="oklch(0.78 0.13 195)" />
                  <circle cx={x} cy={y} r="10" fill="none" stroke="oklch(0.78 0.13 195 / 0.3)" />
                </g>
              ))}
              <g transform="translate(200,200)">
                <rect x="-22" y="-22" width="44" height="44" fill="none" stroke="oklch(0.97 0.005 250)" strokeWidth="1" transform="rotate(45)" />
                <rect x="-12" y="-12" width="24" height="24" fill="oklch(0.78 0.13 195)" transform="rotate(45)" />
              </g>
            </svg>
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <span>Settlement mesh</span>
              <span className="text-accent">L1 + L2</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
