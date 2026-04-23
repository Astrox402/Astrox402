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
- **Package Manager**: pnpm (pnpm-lock.yaml — do NOT use npm install, it corrupts node_modules)
- **Auth**: Privy (`@privy-io/react-auth` v3.22.1) — email, Google, GitHub, Solana wallets
- **Database**: PostgreSQL (Replit managed, accessed via `DATABASE_URL` env var)

## Project Structure

- `src/routes/` — Application pages (TanStack Router file-based routing)
  - `__root.tsx` — Root layout
  - `index.tsx` — Main landing page
  - `sign-in.tsx` — Login page (Privy `useLogin` modal trigger)
  - `dashboard.tsx` — Dashboard layout (sidebar + topbar); calls `resourceStore.setUserId()` on auth
  - `dashboard.index.tsx` — Dashboard overview: real stats + payments from `/api/stats` + `/api/payments`
  - `dashboard.resources.tsx` — Resources layout (Outlet)
  - `dashboard.resources.index.tsx` — Resources list with filter tabs
  - `dashboard.resources.new.tsx` — Create resource form (4-section, inline validation)
  - `dashboard.resources.$id.tsx` — Resource layout (Outlet)
  - `dashboard.resources.$id.index.tsx` — Resource detail (config, logs, settlement events, lifecycle controls)
  - `dashboard.resources.$id.edit.tsx` — Edit resource form
  - `dashboard.payments.tsx` — Real payment history from `/api/payments`
  - `dashboard.developer.tsx` — Real API key from `/api/api-keys` + SDK snippets
  - `dashboard.settings.tsx` — Real wallet (Privy `useWallets()`) + live SOL balance from Solana RPC
  - `docs.tsx` + `docs/` — Documentation section with nested routes
- `src/components/meridian/` — Landing page feature components
  - `Nav.tsx` — Top nav; uses `usePrivy()` to show "Dashboard" badge when authenticated
  - `Solana.tsx` — Animated settlement mesh (SVG animateMotion)
  - `FlowDiagram.tsx` — Animated 4-phase 402 protocol flow (Framer Motion)
- `src/lib/api.ts` — Frontend API client (`setApiUserId`, typed interfaces, `api.*` helpers, `lamportsToDisplay`, `timeAgo`)
- `src/lib/resourceStore.ts` — PostgreSQL-backed resource store (fetches from `/api/resources`); supports add(), update(), getById(); Privy user ID set via `setUserId()`
- `src/lib/auth.ts` — Privy auth bridge: `buildUserFromPrivy()` helper + localStorage persistence for TanStack Router `beforeLoad` checks
- `src/components/ui/` — Reusable Shadcn UI components
- `src/router.tsx` — Router configuration
- `src/routeTree.gen.ts` — Auto-generated route tree (do not edit manually)
- `src/styles.css` — Global styles (Tailwind)

## Backend API

All API routes are served as a Vite dev-server middleware plugin (defined inline in `vite.config.ts`), using `psql` via `child_process.execFileSync` to query PostgreSQL. No separate Express/Node server needed.

### API Routes (all require `X-User-Id` header = Privy user ID)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/resources` | List user's resources |
| POST | `/api/resources` | Create or upsert resource |
| PATCH | `/api/resources/:id` | Update resource fields |
| DELETE | `/api/resources/:id` | Delete resource |
| GET | `/api/api-keys` | Get (or auto-create) user's API key |
| GET | `/api/payments` | List user's payments (last 100) |
| GET | `/api/stats` | Aggregate stats (resource + payment counts/totals) |

### Database Schema

- `resources` — id, user_id, name, endpoint, description, price_lamports, price_token, status, category, network, requests, revenue_lamports, created_at, updated_at, metadata (JSONB)
- `api_keys` — id, user_id, key_value, created_at, last_used_at
- `payments` — id, user_id, resource_id, resource_name, amount_lamports, token, payer_wallet, tx_signature, status, created_at

## Auth Flow (Privy)

1. User visits landing page → clicks "Sign in" in nav
2. `/sign-in` — calls Privy `login()` to open the Privy modal (email, Google, GitHub, Phantom)
3. On success, `buildUserFromPrivy()` persists user to localStorage and redirects to `/dashboard`
4. `dashboard.tsx` calls `resourceStore.setUserId(user.id)` + `setApiUserId(user.id)` to wire up DB calls
5. All `/dashboard/*` routes use `beforeLoad` (localStorage check) + `usePrivy()` runtime guard
6. Sign out calls Privy `useLogout({ onSuccess })`, clears localStorage, returns to `/`

## Privy Configuration

- **App ID**: stored as `VITE_PRIVY_APP_ID` env var (value: `cmob69m6600iz0cjmil0ywhmb`)
- **App Secret**: NOT used (frontend SPA only)
- **Login methods**: email, google, github, wallet
- **Embedded wallets**: Solana, created on login for users without wallets
- **Appearance**: dark theme, cyan accent (`#22d3ee`), wallets: Phantom, Solflare, Backpack
- **Note**: `toSolanaWalletConnectors` from `@privy-io/react-auth/solana` is NOT used (requires `@solana-program/memo` peer dep — not installed)

## Known Issues / Notes

- **ALWAYS use `pnpm install`** — never `npm install`. Previous npm attempts corrupted many packages (ENOTEMPTY errors). pnpm restores everything correctly in seconds.
- `@wagmi/connectors` (Privy dependency) bundles its own React — fixed via `resolve.alias` in `vite.config.ts` forcing all React imports to root `node_modules/react`
- Vite watcher configured to ignore pnpm store and `.cache` dirs to avoid ENOSPC errors
- Privy iframe warning in dev ("Privy iframe failed to load") is non-critical; affects login modal in Replit preview but auth works in production. Add Replit dev domain to Privy dashboard Allowed Domains to fix.
- If packages get corrupted again: `pnpm install && rm -rf node_modules/.vite node_modules/.cache` then restart the workflow.

## Development

- Dev server runs on `0.0.0.0:5000`
- Start with: `pnpm run dev` (or `npm run dev` — both work for running, but install via pnpm only)
- Build with: `pnpm run build`

## Deployment

- Configured as a static site deployment
- Build command: `pnpm run build`
- Public directory: `dist/client`
