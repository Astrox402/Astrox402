import { motion } from "framer-motion";
import { FlowDiagram } from "./FlowDiagram";

export function Hero() {
  return (
    <section className="relative pt-40 pb-32 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.18 }}
      >
        <source src="https://res.cloudinary.com/dvfrmhk5z/video/upload/q_auto/f_auto/v1776950209/14544289_1920_1080_24fps_jk8fun.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
      <div className="absolute inset-0 grid-bg radial-fade opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-8"
        >
          <a href="#manifesto" className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface/50 text-[12px] text-muted-foreground hover:text-foreground transition-colors">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-slow" />
            Introducing the payment-native web
            <span className="text-foreground/60 group-hover:translate-x-0.5 transition-transform">→</span>
          </a>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="text-center text-[clamp(2.75rem,7vw,5.75rem)] leading-[0.98] tracking-[-0.035em] font-medium text-gradient max-w-5xl mx-auto"
        >
          Make every API,<br />agent, and digital<br />resource <span className="font-serif italic text-accent font-normal">monetizable</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-8 max-w-2xl mx-auto text-center text-[17px] leading-relaxed text-muted-foreground"
        >
          Astro is a payment-native protocol layer for the internet. Price requests,
          settle access, and let software transact with software — natively, on Solana.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <a href="#waitlist" className="inline-flex h-11 items-center px-5 rounded-md bg-foreground text-background text-[14px] font-medium hover:bg-foreground/90 transition-all hover:-translate-y-px">
            Request early access
          </a>
          <a href="/docs" className="inline-flex h-11 items-center px-5 rounded-md border border-border bg-surface/40 text-[14px] font-medium hover:bg-surface transition-colors">
            Read the protocol →
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="mt-20 relative"
        >
          <FlowDiagram />
        </motion.div>

        <div className="mt-20">
          <p className="text-center text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground/40 mb-8">
            Trusted by builders from
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
            {/* Stripe — official Simple Icons path */}
            <svg viewBox="0 0 24 24" height="18" fill="currentColor" className="text-foreground/40 hover:text-foreground/70 transition-colors" aria-label="Stripe">
              <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.594-7.305h.003z"/>
            </svg>

            {/* Cloudflare — official Simple Icons path */}
            <svg viewBox="0 0 24 24" height="18" fill="currentColor" className="text-foreground/40 hover:text-foreground/70 transition-colors" aria-label="Cloudflare">
              <path d="M16.5088 16.8447c.1475-.5068.0908-.9707-.1553-1.3154-.2246-.3164-.6045-.499-1.0615-.5205l-8.6592-.1123a.1559.1559 0 0 1-.1333-.0713c-.0283-.042-.0351-.0986-.021-.1553.0278-.084.1123-.1484.2036-.1562l8.7359-.1123c1.0351-.0489 2.1601-.8868 2.5537-1.9136l.499-1.3013c.0215-.0561.0293-.1128.0147-.168-.5625-2.5463-2.835-4.4453-5.5499-4.4453-2.5039 0-4.6284 1.6177-5.3876 3.8614-.4927-.3658-1.1187-.5625-1.794-.499-1.2026.119-2.1665 1.083-2.2861 2.2856-.0283.31-.0069.6128.0635.894C1.5683 13.171 0 14.7754 0 16.752c0 .1748.0142.3515.0352.5273.0141.083.0844.1475.1689.1475h15.9814c.0909 0 .1758-.0645.2032-.1553l.12-.4268zm2.7568-5.5634c-.0771 0-.1611 0-.2383.0112-.0566 0-.1054.0415-.127.0976l-.3378 1.1744c-.1475.5068-.0918.9707.1543 1.3164.2256.3164.6055.498 1.0625.5195l1.8437.1133c.0557 0 .1055.0263.1329.0703.0283.043.0351.1074.0214.1562-.0283.084-.1132.1485-.204.1553l-1.921.1123c-1.041.0488-2.1582.8867-2.5527 1.914l-.1406.3585c-.0283.0713.0215.1416.0986.1416h6.5977c.0771 0 .1474-.0489.169-.126.1122-.4082.1757-.837.1757-1.2803 0-2.6025-2.125-4.727-4.7344-4.727"/>
            </svg>

            {/* Anthropic — official Simple Icons path */}
            <svg viewBox="0 0 24 24" height="18" fill="currentColor" className="text-foreground/40 hover:text-foreground/70 transition-colors" aria-label="Anthropic">
              <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z"/>
            </svg>

            {/* Coinbase — official Simple Icons path */}
            <svg viewBox="0 0 24 24" height="18" fill="currentColor" className="text-foreground/40 hover:text-foreground/70 transition-colors" aria-label="Coinbase">
              <path d="M4.844 11.053c-.872 0-1.553.662-1.553 1.548s.664 1.542 1.553 1.542c.889 0 1.564-.667 1.564-1.547 0-.875-.664-1.543-1.564-1.543zm.006 2.452c-.497 0-.86-.386-.86-.904 0-.523.357-.909.854-.909.502 0 .866.392.866.91 0 .517-.364.903-.86.903zm1.749-1.778h.433v2.36h.693V11.11H6.599zm-5.052-.035c.364 0 .653.224.762.558h.734c-.133-.713-.722-1.197-1.49-1.197-.872 0-1.553.662-1.553 1.548 0 .887.664 1.543 1.553 1.543.75 0 1.351-.484 1.484-1.203h-.728a.78.78 0 01-.756.564c-.502 0-.855-.386-.855-.904 0-.523.347-.909.85-.909zm18.215.622l-.508-.075c-.242-.035-.415-.115-.415-.305 0-.207.225-.31.53-.31.336 0 .55.143.595.379h.67c-.075-.599-.537-.95-1.247-.95-.733 0-1.218.375-1.218.904 0 .506.317.8.958.892l.508.075c.249.034.387.132.387.316 0 .236-.242.334-.577.334-.41 0-.641-.167-.676-.42h-.681c.064.581.52.99 1.35.99.757 0 1.26-.346 1.26-.938 0-.53-.364-.806-.936-.892zM7.378 9.885a.429.429 0 00-.444.437c0 .254.19.438.444.438a.429.429 0 00.445-.438.429.429 0 00-.445-.437zm10.167 2.245c0-.645-.392-1.076-1.224-1.076-.785 0-1.224.397-1.31 1.007h.687c.035-.236.22-.432.612-.432.352 0 .525.155.525.345 0 .248-.317.311-.71.351-.531.058-1.19.242-1.19.933 0 .535.4.88 1.034.88.497 0 .809-.207.965-.535.023.293.242.483.548.483h.404v-.616h-.34v-1.34zm-.68.748c0 .397-.347.69-.769.69-.26 0-.48-.11-.48-.34 0-.293.353-.373.676-.408.312-.028.485-.097.572-.23zm-3.679-1.825c-.386 0-.71.162-.94.432V9.856h-.693v4.23h.68v-.391c.232.282.56.449.953.449.832 0 1.461-.656 1.461-1.543 0-.886-.64-1.548-1.46-1.548zm-.103 2.452c-.497 0-.86-.386-.86-.904 0-.517.369-.909.865-.909.503 0 .855.386.855.91 0 .517-.364.903-.86.903zm-3.187-2.452c-.45 0-.745.184-.919.443v-.385H8.29v2.975h.693v-1.617c0-.455.289-.777.716-.777.398 0 .647.282.647.69v1.704h.692v-1.755c0-.748-.386-1.278-1.142-1.278zM24 12.503c0-.851-.624-1.45-1.46-1.45-.89 0-1.542.668-1.542 1.548 0 .927.698 1.543 1.553 1.543.722 0 1.287-.426 1.432-1.03h-.722c-.104.264-.358.414-.699.414-.445 0-.78-.276-.854-.76H24v-.264zm-2.252-.23c.11-.414.422-.615.78-.615.392 0 .693.224.762.615Z"/>
            </svg>

            {/* Vercel — official Simple Icons path */}
            <svg viewBox="0 0 24 24" height="16" fill="currentColor" className="text-foreground/40 hover:text-foreground/70 transition-colors" aria-label="Vercel">
              <path d="m12 1.608 12 20.784H0Z"/>
            </svg>

            {/* a16z — SVG wordmark (no Simple Icons entry exists) */}
            <svg viewBox="0 0 52 20" height="15" fill="currentColor" className="text-foreground/40 hover:text-foreground/70 transition-colors" aria-label="a16z">
              <text x="0" y="16" fontFamily="ui-sans-serif, system-ui, sans-serif" fontSize="18" fontWeight="700" letterSpacing="-0.05em">a16z</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
