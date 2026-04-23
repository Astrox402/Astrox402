# Astro

A marketing landing page and technical documentation site for the Astro protocol — a payment-native protocol layer for the internet that makes APIs, agents, and digital resources monetizable via programmable access and settlement on Solana.

## Tech Stack

- **Framework**: React 19 + TanStack Start (SSR-capable full-stack React framework)
- **Routing**: TanStack Router (file-based routing in `src/routes/`)
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (Radix UI primitives) in `src/components/ui/`
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Language**: TypeScript
- **Build Tool**: Vite 7
- **Package Manager**: npm

## Project Structure

- `src/routes/` — Application pages (TanStack Router file-based routing)
  - `__root.tsx` — Root layout with HTML shell
  - `index.tsx` — Main landing page
  - `docs.tsx` + `docs/` — Documentation section with nested routes
- `src/components/meridian/` — Feature-specific landing page components
- `src/components/ui/` — Reusable Shadcn UI components
- `src/router.tsx` — Router configuration
- `src/routeTree.gen.ts` — Auto-generated route tree (do not edit manually)
- `src/styles.css` — Global styles (Tailwind)

## Development

- Dev server runs on `0.0.0.0:5000`
- Start with: `npm run dev`
- Build with: `npm run build`

## Deployment

- Configured as a static site deployment
- Build command: `npm run build`
- Public directory: `dist/client`
