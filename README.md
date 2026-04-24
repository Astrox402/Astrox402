# Astro, programmable internet for paid APIs, agents, and digital resources

<p align="center">
  <strong>Payment-native control plane for the internet.</strong><br/>
  Price access with HTTP 402 semantics, authenticate users with Privy, manage resources in a dashboard, and simulate the end-to-end payment handshake on Solana.
</p>

<p align="center">
  <a href="https://github.com/jennitsme/programmable-internet/stargazers">
    <img alt="Stars" src="https://img.shields.io/github/stars/jennitsme/programmable-internet?style=for-the-badge" />
  </a>
  <a href="https://github.com/jennitsme/programmable-internet/network/members">
    <img alt="Forks" src="https://img.shields.io/github/forks/jennitsme/programmable-internet?style=for-the-badge" />
  </a>
  <a href="https://github.com/jennitsme/programmable-internet/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/jennitsme/programmable-internet?style=for-the-badge" />
  </a>
  <img alt="React 19" src="https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white" />
  <img alt="TanStack Router" src="https://img.shields.io/badge/TanStack-Router-FF6B00?style=for-the-badge&logo=reactrouter&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="Solana" src="https://img.shields.io/badge/Solana-Payment%20Rail-9945FF?style=for-the-badge&logo=solana&logoColor=white" />
</p>

<p align="center">
  <img alt="Privy" src="https://img.shields.io/badge/Auth-Privy-6C47FF?style=flat-square" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/Data-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/UI-Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img alt="Radix UI" src="https://img.shields.io/badge/Components-Radix%20UI-161618?style=flat-square" />
  <img alt="Framer Motion" src="https://img.shields.io/badge/Motion-Framer-0055FF?style=flat-square&logo=framer&logoColor=white" />
  <img alt="Cloudflare" src="https://img.shields.io/badge/Edge-Cloudflare-F38020?style=flat-square&logo=cloudflare&logoColor=white" />
</p>

---

## Overview

**Astro** is a product and protocol concept for the **programmable internet**: a world where APIs, agents, and digital resources can expose price, payment, authorization, settlement, and receipt verification directly in the request lifecycle.

This repository currently ships three product layers in one codebase:

1. **Marketing site** for the Astro narrative and ecosystem positioning
2. **Developer documentation** for the protocol, concepts, and handshake model
3. **Authenticated dashboard / console** for managing paid resources, API keys, payment activity, settings, and a handshake playground

It is not just a landing page. It is a working full-stack prototype of a payment-native access layer.

---

## Core idea

Instead of treating billing as a separate SaaS system, Astro moves monetization closer to the resource itself.

A request can become:

- discoverable
- quotable
- payable
- verifiable
- settleable
- receiptable

All in one flow.

That unlocks use cases like:

- paid AI inference endpoints
- metered agent tools
- premium datasets
- document transformation APIs
- one-shot workflows
- machine-to-machine payments
- developer-controlled monetized gateways

---

## What this repo includes

### Product surfaces

- `/` , cinematic landing page with product narrative, protocol framing, ecosystem positioning, and CTA flow
- `/docs/*` , documentation system for quickstart, concepts, architecture, handshake, receipts, pricing, security, clients, and FAQ
- `/dashboard/*` , authenticated console for resource operations and developer tooling
- `/protocol` , protocol philosophy and high-level design
- `/specification` , wire-spec style presentation of the quote / intent / receipt model
- `/console`, `/pricing`, `/examples`, `/sdks`, `/security`, `/status`, etc. , additional product and ecosystem pages

### Dashboard capabilities

- sign in with **Privy**
- support for **email, Google, GitHub, and wallet login**
- manage monetized resources
- inspect payments and settlement activity
- retrieve or auto-provision API keys
- view aggregate stats
- configure settings and wallet context
- run a **handshake playground** that simulates the paid request lifecycle step by step

### Backend capabilities

- lightweight API routes served from the app runtime
- PostgreSQL-backed resources, payments, and API key records
- user scoping through `X-User-Id`
- typed frontend API client
- local persistence bridge for auth state used by route guards

---

## How it works

### 1. Product-level flow

```text
Visitor lands on Astro
        |
        v
Reads thesis, docs, and protocol framing
        |
        v
Authenticates with Privy
        |
        v
Enters dashboard
        |
        +--> creates paid resource
        |
        +--> gets API key
        |
        +--> reviews payments / stats
        |
        +--> runs handshake playground
```

### 2. Payment-native request model

```text
Client Request
     |
     v
Protected Resource
     |
     +--> if payment required
             |
             v
       HTTP 402-style Quote
             |
             v
      Client signs intent
             |
             v
      Server verifies binding
             |
             v
      Solana settlement
             |
             v
      Receipt + fulfilled response
```

### 3. Current app architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                         Frontend UI                          │
│  React 19 + TanStack Router + Tailwind + Radix + Motion     │
└──────────────────────────────────────────────────────────────┘
                |                         |
                |                         |
                v                         v
      Marketing / Docs Pages      Authenticated Dashboard
                |                         |
                └──────────────┬──────────┘
                               v
                    Frontend API client (`src/lib/api.ts`)
                               |
                               v
                 API route layer (`server/routes.ts`)
                               |
                               v
                    PostgreSQL / `DATABASE_URL`
                               |
                               v
                     resources / api_keys / payments
```

### 4. Authentication model

```text
Privy login
   |
   +--> email
   +--> Google
   +--> GitHub
   +--> wallet
   |
   v
buildUserFromPrivy()
   |
   v
localStorage session bridge
   |
   v
TanStack route protection for /dashboard/*
   |
   v
setApiUserId(user.id) -> X-User-Id on API calls
```

---

## Feature map

| Area | What exists now |
|---|---|
| Landing | Hero, manifesto, solution framing, use cases, dashboard previews, docs previews |
| Docs | Nested docs routes for concepts, architecture, quickstart, handshake, serve, receipts, pricing, security, clients, FAQ |
| Auth | Privy integration with social + wallet login |
| Resource management | Create, list, edit, delete, and inspect resources |
| Payments | Payment history UI and settlement-oriented presentation |
| Developer tools | API key retrieval, SDK framing, developer onboarding |
| Playground | Guided handshake simulator with visual step timeline and payload viewer |
| Data layer | PostgreSQL-backed resources, stats, and API key retrieval |
| Visual system | High-polish motion, dark theme, branded protocol aesthetic |

---

## Screens and flows

### Landing experience

The homepage combines:

- product positioning
- protocol narrative
- animated payment flow visualization
- ecosystem trust signaling
- dashboard preview
- documentation preview
- manifesto / thesis framing

### Documentation experience

The docs section is structured around developer comprehension, not just marketing copy. It covers:

- protocol concepts
- handshake model
- architecture
- pricing mental model
- errors
- receipts
- security
- clients and serving patterns

### Console experience

The dashboard is designed as an operator control plane for paid resources:

- overview metrics
- resource lifecycle management
- payment activity
- API key and developer settings
- wallet-aware settings
- interactive handshake simulation

---

## Tech stack

### Frontend

- **React 19**
- **TanStack Router**
- **TypeScript**
- **Vite 7**
- **Tailwind CSS v4**
- **Radix UI / shadcn-style component system**
- **Framer Motion**
- **Recharts**

### Auth and identity

- **Privy** via `@privy-io/react-auth`
- login methods: email, Google, GitHub, wallet
- embedded Solana wallets for users without wallets

### Data and backend

- **PostgreSQL**
- custom API route layer in `server/routes.ts`
- user scoping via `X-User-Id`

### Infra and deployment-oriented pieces

- **Cloudflare Vite plugin**
- **Wrangler config** present
- Vite-based runtime with API middleware pattern

---

## Repository structure

```text
.
├── public/
├── server/
│   ├── db.ts
│   └── routes.ts
├── src/
│   ├── components/
│   │   ├── meridian/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── resourceStore.ts
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── docs.*.tsx
│   │   ├── dashboard.*.tsx
│   │   ├── protocol.tsx
│   │   ├── specification.tsx
│   │   └── sign-in.tsx
│   ├── main.tsx
│   ├── router.tsx
│   └── styles.css
├── package.json
├── vite.config.ts
└── wrangler.jsonc
```

---

## API surface

Current backend routes observed in the codebase:

### Resources

- `GET /api/resources`
- `POST /api/resources`
- `PATCH /api/resources/:id`
- `DELETE /api/resources/:id`

### API keys

- `GET /api/api-keys`

### Payments and stats

- `GET /api/payments`
- `GET /api/stats`

### Auth scope

All API routes are scoped by:

- `X-User-Id: <privy-user-id>`

---

## Important implementation note

There is currently a **small docs-vs-code gap** worth knowing:

- the frontend API client includes `createPayment()`
- the backend routes shown in `server/routes.ts` expose `GET /api/payments`, but the visible route set does **not** yet include `POST /api/payments`

So if you are extending this repo, that payment-write path is an obvious next implementation step to fully align the playground and payment history flow.

---

## Authentication and identity flow

1. User opens the site
2. User clicks sign in
3. Privy opens the auth modal
4. User authenticates via email, Google, GitHub, or wallet
5. `buildUserFromPrivy()` normalizes the user model
6. User state is persisted locally for route guards
7. Dashboard bootstraps API identity with `setApiUserId(user.id)`
8. Requests to the backend are scoped to that user

---

## Integration badges

This project conceptually and technically sits at the intersection of the following systems:

- ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
- ![TanStack](https://img.shields.io/badge/TanStack-FF6B00?style=flat-square)
- ![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
- ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
- ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
- ![Privy](https://img.shields.io/badge/Privy-Auth-6C47FF?style=flat-square)
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
- ![Solana](https://img.shields.io/badge/Solana-9945FF?style=flat-square&logo=solana&logoColor=white)
- ![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=flat-square&logo=cloudflare&logoColor=white)
- ![Radix UI](https://img.shields.io/badge/Radix_UI-161618?style=flat-square)
- ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)

---

## Why this project matters

Most internet monetization still assumes:

- human checkout flows
- accounts before access
- external billing systems
- delayed settlement
- weak machine-to-machine economics

Astro explores the opposite:

- software-native payment flows
- request-bound access control
- cryptographic proof of payment intent
- chain-verifiable settlement
- protocol-grade monetization primitives

It is closer to a **financial transport layer for digital access** than a normal SaaS dashboard.

---

## Local development

### Requirements

- Node.js 22+
- pnpm recommended
- PostgreSQL database
- Privy app id

### Install

```bash
pnpm install
```

### Environment

Create an environment file with at least:

```bash
VITE_PRIVY_APP_ID=your_privy_app_id
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### Start dev server

```bash
pnpm run dev
```

### Build

```bash
pnpm run build
```

### Preview

```bash
pnpm run preview
```

---

## Suggested database entities

The current code implies these primary entities:

- `resources`
- `api_keys`
- `payments`

Likely fields include resource identity, endpoint metadata, pricing configuration, network / token selection, request counts, revenue totals, and timestamps.

---

## Roadmap ideas

If you continue building this repo, the highest-leverage next steps are probably:

- implement `POST /api/payments`
- connect playground settlement simulation to real persisted payment writes
- add receipt verification views
- expose real quote / intent payload generation endpoints
- add webhook and provider callback support
- introduce usage analytics per resource
- add multi-team / workspace support
- ship real SDK examples for providers and consumers
- support devnet vs mainnet switching more explicitly
- generate OpenAPI or protocol reference artifacts from source

---

## Social and project links

- **Repository:** <https://github.com/jennitsme/programmable-internet>
- **Issues:** <https://github.com/jennitsme/programmable-internet/issues>
- **Pull Requests:** <https://github.com/jennitsme/programmable-internet/pulls>
- **Discussions:** <https://github.com/jennitsme/programmable-internet/discussions>

If you have official socials, add them here:

- **Website:** `https://your-domain.com`
- **X / Twitter:** `https://x.com/yourhandle`
- **Docs:** `https://your-docs-domain.com`
- **Discord:** `https://discord.gg/your-community`
- **Telegram:** `https://t.me/yourcommunity`

---

## Positioning in one sentence

**Astro is a payment-native protocol and console for turning APIs, agents, and digital resources into first-class programmable economic primitives.**

---

## Contributing

If you contribute to this repo:

1. keep the protocol language consistent
2. keep docs aligned with the actual implementation
3. prefer typed interfaces over ad-hoc payloads
4. treat README as both product narrative and technical truth source

---

## License

Add a license file if you want this repository to be clearly reusable in public contexts.

If you want, I can also help generate:

- a **much more visual README with SVG banners and cards**
- a **Bahasa Indonesia version**
- a **GitHub profile-grade social/footer section with real handles and brand assets**
- a **docs/architecture.md** sourced directly from the codebase
