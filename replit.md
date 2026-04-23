# Astro x402

A marketing landing page, technical documentation site, and authenticated control-plane dashboard for the Astro protocol — a payment-native protocol layer that makes APIs, agents, and digital resources monetizable via HTTP 402 with settlement on Solana.

## Tech Stack

- **Framework**: React 19 + TanStack Router (SPA on Vite 7)
- **Routing**: TanStack Router (file-based routing in `src/routes/`)
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (Radix UI primitives) in `src/components/ui/`
- **Animations**: Framer Motion
- **Language**: TypeScript
- **Build Tool**: Vite 7
- **Package Manager**: npm
- **Auth**: Privy (`@privy-io/react-auth` v3.22.1) — email, Google, GitHub, Solana wallets

## Project Structure

- `src/routes/` — Application pages (TanStack Router file-based routing)
  - `__root.tsx` — Root layout
  - `index.tsx` — Main landing page
  - `sign-in.tsx` — Login page (Privy `useLogin` modal trigger)
  - `dashboard.tsx` — Dashboard layout (sidebar + topbar); auth-guarded via `beforeLoad` + `usePrivy()`
  - `dashboard.index.tsx` — Dashboard overview (stats, chart, activity, resource table)
  - `dashboard.resources.tsx` — Resources layout (Outlet)
  - `dashboard.resources.index.tsx` — Resources list with filter tabs
  - `dashboard.resources.new.tsx` — Create resource form (4-section, inline validation)
  - `dashboard.resources.$id.tsx` — Resource layout (Outlet)
  - `dashboard.resources.$id.index.tsx` — Resource detail (config, logs, settlement events, lifecycle controls)
  - `dashboard.resources.$id.edit.tsx` — Edit resource form
  - `dashboard.payments.tsx` — Payment history with filter tabs
  - `dashboard.developer.tsx` — API keys, SDK snippets, x402 flow, webhook config
  - `dashboard.settings.tsx` — Profile, wallet, network, team sections
  - `docs.tsx` + `docs/` — Documentation section with nested routes
- `src/components/meridian/` — Landing page feature components
  - `Nav.tsx` — Top nav; uses `usePrivy()` to show "Dashboard" badge when authenticated
  - `Solana.tsx` — Animated settlement mesh (SVG animateMotion)
  - `FlowDiagram.tsx` — Animated 4-phase 402 protocol flow (Framer Motion)
- `src/lib/auth.ts` — Privy auth bridge: `buildUserFromPrivy()` helper + localStorage persistence for TanStack Router `beforeLoad` checks
- `src/lib/resourceStore.ts` — Shared resource store (useSyncExternalStore + localStorage); supports add(), update(), getById()
- `src/components/ui/` — Reusable Shadcn UI components
- `src/router.tsx` — Router configuration
- `src/routeTree.gen.ts` — Auto-generated route tree (do not edit manually)
- `src/styles.css` — Global styles (Tailwind)

## Auth Flow (Privy)

1. User visits landing page → clicks "Sign in" in nav
2. `/sign-in` — calls Privy `login()` to open the Privy modal (email, Google, GitHub, Phantom)
3. On success, `buildUserFromPrivy()` persists user to localStorage and redirects to `/dashboard`
4. All `/dashboard/*` routes use `beforeLoad` (localStorage check) + `usePrivy()` runtime guard
5. Sign out calls Privy `useLogout({ onSuccess })`, clears localStorage, returns to `/`

## Privy Configuration

- **App ID**: stored as `VITE_PRIVY_APP_ID` env var (value: `cmob69m6600iz0cjmil0ywhmb`)
- **App Secret**: NOT used (frontend SPA only)
- **Login methods**: email, google, github, wallet
- **Embedded wallets**: Solana, created on login for users without wallets
- **Appearance**: dark theme, cyan accent (`#22d3ee`), wallets: Phantom, Solflare, Backpack
- **Note**: `toSolanaWalletConnectors` from `@privy-io/react-auth/solana` is NOT used (requires `@solana-program/memo` peer dep — not installed)

## Known Issues / Notes

- `react-aria@3.48.0` manually extracted via tarball into `node_modules/react-aria/` (npm install fails with ENOTEMPTY)
- `@wagmi/connectors` (Privy dependency) bundles its own React — fixed via `resolve.alias` in `vite.config.ts` forcing all React imports to root `node_modules/react`
- Vite watcher configured to ignore pnpm store and `.cache` dirs to avoid ENOSPC errors
- Privy iframe warning in dev ("Privy iframe failed to load") is non-critical; affects login modal in Replit preview but auth works in production. Add Replit dev domain to Privy dashboard Allowed Domains to fix.

## Development

- Dev server runs on `0.0.0.0:5000`
- Start with: `npm run dev`
- Build with: `npm run build`

## Deployment

- Configured as a static site deployment
- Build command: `npm run build`
- Public directory: `dist/client`
