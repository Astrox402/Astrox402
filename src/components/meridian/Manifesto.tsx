export function Manifesto() {
  return (
    <section id="manifesto" className="relative py-40 border-t border-border overflow-hidden">
      <div className="absolute inset-0 grid-bg radial-fade opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[700px] rounded-full bg-accent/8 blur-[140px]" />
      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-accent mb-8">Manifesto</div>
        <p className="text-[clamp(1.75rem,3.6vw,2.85rem)] leading-[1.18] tracking-[-0.02em] font-serif text-foreground/95">
          The internet learned how to <em className="text-accent not-italic font-sans font-normal">distribute</em>. <br />
          It never learned how to <em className="text-accent not-italic font-sans font-normal">price</em>, <em className="text-accent not-italic font-sans font-normal">settle</em>, and <em className="text-accent not-italic font-sans font-normal">coordinate</em> value at the same speed.
        </p>
        <div className="mt-12 max-w-2xl mx-auto space-y-6 text-[16px] leading-relaxed text-muted-foreground">
          <p>
            Software should be able to buy software. Agents should be able to acquire capabilities the moment they need them. Resources should be able to declare their own terms.
          </p>
          <p>
            The next wave of digital business models will not be designed in spreadsheets. They will be <span className="text-foreground">programmed</span>.
          </p>
          <p className="text-foreground">
            Meridian is the protocol layer where that begins.
          </p>
        </div>
      </div>
    </section>
  );
}
