import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/meridian/Nav";
import { Hero } from "@/components/meridian/Hero";
import { Problem } from "@/components/meridian/Problem";
import { Solution } from "@/components/meridian/Solution";
import { HowItWorks } from "@/components/meridian/HowItWorks";
import { UseCases } from "@/components/meridian/UseCases";
import { Ethereum } from "@/components/meridian/Ethereum";
import { Dashboard } from "@/components/meridian/Dashboard";
import { Docs } from "@/components/meridian/Docs";
import { Manifesto } from "@/components/meridian/Manifesto";
import { CTA } from "@/components/meridian/CTA";
import { Footer } from "@/components/meridian/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Astro — Payment-native protocol layer for the internet" },
      { name: "description", content: "Make every API, agent, and digital resource monetizable. Programmable access and settlement, built on Ethereum." },
      { property: "og:title", content: "Astro — Payment-native protocol layer for the internet" },
      { property: "og:description", content: "Programmable access and settlement for APIs, agents, and digital resources. Launching on Ethereum." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <Nav />
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <UseCases />
      <Ethereum />
      <Dashboard />
      <Docs />
      <Manifesto />
      <CTA />
      <Footer />
    </main>
  );
}
