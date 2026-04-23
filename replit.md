# Astro x402

A marketing landing page, technical documentation site, and authenticated control-plane dashboard for the Astro protocol — a payment-native protocol layer that makes APIs, agents, and digital resources monetizable via HTTP 402 with settlement on Solana.

## Tech Stack

- **Framework**: React 19 + TanStack Start (SSR-capable full-stack React framework)
- **Routing**: TanStack Router (file-based routing in `src/routes/`)
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (Radix UI primitives) in `src/components/ui/`
- **Animations**: Framer Motion
- **Language**: TypeScript
- **Build Tool**: Vite 7
- **Package Manager**: npm

## Project Structure

- `src/routes/` — Application pages (TanStack Router file-based routing)
  - `__root.tsx` — Root layout
  - `index.tsx` — Main landing page
  - `sign-in.tsx` — Login page (any email + password; localStorage auth)
  - `dashboard.tsx` — Dashboard layout (sidebar + topbar); auth-guarded via `beforeLoad`
  - `dashboard.index.tsx` — Dashboard overview (stats, chart, activity, resource table)
  - `dashboard.resources.tsx` — Resources list with filter tabs
  - `dashboard.resources.$id.tsx` — Resource detail (config, logs, settlement events)
  - `dashboard.payments.tsx` — Payment history with filter tabs
  - `dashboard.developer.tsx` — API keys, SDK snippets, webhook config
  - `dashboard.settings.tsx` — Profile, wallet, network, team sections
  - `docs.tsx` + `docs/` — Documentation section with nested routes
- `src/components/meridian/` — Landing page feature components
  - `Nav.tsx` — Top nav; shows "Dashboard" badge when user is logged in
  - `Solana.tsx` — Animated settlement mesh (SVG animateMotion)
  - `FlowDiagram.tsx` — Animated 4-phase 402 protocol flow (Framer Motion)
- `src/lib/auth.ts` — localStorage-based auth utilities (getUser, signIn, signOut)
- `src/components/ui/` — Reusable Shadcn UI components
- `src/router.tsx` — Router configuration
- `src/routeTree.gen.ts` — Auto-generated route tree (do not edit manually)
- `src/styles.css` — Global styles (Tailwind)

## Auth Flow

1. User visits landing page → clicks "Sign in" in nav
2. `/sign-in` — any email + password accepted; creates a user object in localStorage
3. Redirects to `/dashboard` on success
4. All `/dashboard/*` routes use `beforeLoad` to redirect unauthenticated users to `/sign-in`
5. Sign out clears localStorage and returns to `/`

## Development

- Dev server runs on `0.0.0.0:5000`
- Start with: `npm run dev`
- Build with: `npm run build`

## Deployment

- Configured as a static site deployment
- Build command: `npm run build`
- Public directory: `dist/client`
