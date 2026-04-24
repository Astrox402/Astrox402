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

**Astro** is a product and protocol concept for the programmable internet, where APIs, agents, and digital resources can expose pricing, authorization, settlement, and receipt verification directly inside the request lifecycle.

This repository combines three layers in one codebase:

1. **Marketing site** for Astro's positioning and product narrative
2. **Documentation system** for protocol concepts, architecture, and handshake flows
3. **Authenticated console** for managing resources, API keys, payments, and developer workflows

This is more than a landing page. It is a working prototype of a payment-native access layer.

---

## Core thesis

Traditional internet monetization usually depends on separate billing systems, user accounts, delayed settlement, and workflows designed for humans rather than software.

Astro explores a different model: access itself becomes programmable.

A request can be:

- discovered
- quoted
- authorized
- paid
- verified
- settled
- receipted

All within one coherent flow.

This model is well-suited for:

- paid AI inference endpoints
- monetized agent tools
- premium datasets
- one-shot compute or transformation APIs
- machine-to-machine commerce
- programmable developer platforms

---

## What this repository includes

### Product surfaces

- `/` , marketing homepage with product narrative, protocol framing, ecosystem signaling, and conversion paths
- `/docs/*` , structured documentation for concepts, quickstart, handshake, receipts, security, pricing, architecture, and FAQ
- `/dashboard/*` , authenticated console for resource operations and developer workflows
- `/protocol` , high-level explanation of the protocol model
- `/specification` , wire-spec style presentation of quote, intent, and receipt semantics
- `/console`, `/pricing`, `/examples`, `/sdks`, `/security`, `/status`, and additional ecosystem pages

### Dashboard capabilities

- authenticate with **Privy**
- support **email, Google, GitHub, and wallet login**
- create and manage monetized resources
- inspect payments and settlement-oriented activity
- retrieve or provision API keys
- view aggregate platform statistics
- configure profile, wallet, and environment settings
- run a **handshake playground** that simulates the end-to-end paid request lifecycle

### Backend capabilities

- lightweight application-side API routes
- PostgreSQL-backed resources, payments, and API key records
- user scoping through `X-User-Id`
- typed frontend API client
- local auth persistence bridge for route guards

---

## How it works

### 1. Product flow

```text
Visitor lands on Astro
        |
        v
Reads product and protocol material
        |
        v
Authenticates with Privy
        |
        v
Enters dashboard
        |
        +--> creates a resource
        |
        +--> retrieves an API key
        |
        +--> reviews payments and stats
        |
        +--> runs the handshake playground
```

### 2. Payment-native request flow

```text
Client Request
     |
     v
Protected Resource
     |
     +--> payment required
             |
             v
       HTTP 402-style Quote
             |
             v
      Client signs intent
             |
             v
      Server verifies quote binding
             |
             v
      Solana settlement
             |
             v
      Receipt + fulfilled response
```

### 3. Current application architecture

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

### 4. Authentication flow

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

| Area | Current scope |
|---|---|
| Landing | Hero, manifesto, use-case framing, dashboard preview, docs preview, protocol narrative |
| Docs | Nested routes for concepts, architecture, quickstart, handshake, receipts, pricing, security, clients, and FAQ |
| Auth | Privy-based authentication with social and wallet entry points |
| Resource management | Create, list, update, delete, and inspect resources |
| Payments | Payment history views and settlement-oriented presentation |
| Developer tooling | API key retrieval, onboarding flows, and protocol framing |
| Playground | Guided handshake simulator with timeline and payload viewer |
| Data layer | PostgreSQL-backed resources, stats, and API key retrieval |
| Visual system | Motion-heavy, polished dark-mode interface with protocol branding |

---

## User-facing experience

### Landing

The homepage combines:

- product positioning
- protocol storytelling
- animated payment flow visuals
- ecosystem trust signaling
- dashboard previews
- documentation previews
- manifesto-driven messaging

### Documentation

The docs experience is organized around developer understanding rather than pure marketing copy. It covers:

- protocol concepts
- handshake flows
- architecture
- pricing logic
- receipts
- error framing
- security posture
- client and serving patterns

### Console

The dashboard acts as an operator control plane for monetized resources:

- overview metrics
- resource lifecycle management
- payment activity
- API key management
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
- user scoping through `X-User-Id`

### Infrastructure-oriented pieces

- **Cloudflare Vite plugin**
- **Wrangler configuration**
- Vite-based runtime with API middleware handling

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

The currently visible backend routes in the codebase are:

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

All API routes are scoped with:

- `X-User-Id: <privy-user-id>`

---

## Important implementation note

There is a small but important docs-to-code gap in the current repository state:

- the frontend API client exposes `createPayment()`
- the visible backend routes in `server/routes.ts` include `GET /api/payments`, but not `POST /api/payments`

That makes payment persistence an obvious next implementation step if the goal is full alignment between the playground flow and the backend API surface.

---

## Authentication and identity lifecycle

1. A user opens the site
2. The user starts sign-in
3. Privy opens the authentication modal
4. The user authenticates through email, Google, GitHub, or wallet
5. `buildUserFromPrivy()` normalizes the application user model
6. User state is persisted locally for route protection
7. The dashboard initializes API identity with `setApiUserId(user.id)`
8. Backend calls are scoped to that authenticated user

---

## Integration stack

This project sits at the intersection of the following technologies:

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

Most internet monetization systems still assume:

- human-first checkout flows
- accounts before access
- external billing layers
- delayed reconciliation
- weak machine-to-machine economics

Astro explores the opposite:

- software-native payment flows
- request-bound access control
- cryptographic payment intent verification
- chain-verifiable settlement
- protocol-level monetization primitives

This makes Astro closer to a **financial transport layer for digital access** than a conventional SaaS dashboard.

---

## Local development

### Requirements

- Node.js 22+
- pnpm recommended
- PostgreSQL
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

### Start development server

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

## Inferred data model

The current codebase implies three primary entities:

- `resources`
- `api_keys`
- `payments`

The field model appears to include resource identity, endpoint metadata, pricing configuration, token and network selection, request counts, revenue totals, and timestamps.

---

## Logical next steps

The highest-leverage next improvements are likely:

- implement `POST /api/payments`
- connect playground settlement simulation to real payment persistence
- add receipt verification views
- expose real quote and intent generation endpoints
- add webhook and provider callback support
- introduce per-resource usage analytics
- add multi-team or workspace support
- ship concrete SDK examples for providers and consumers
- support clearer devnet and mainnet switching
- generate formal protocol reference artifacts from source

---

## Project links

- **Repository:** <https://github.com/jennitsme/programmable-internet>
- **Issues:** <https://github.com/jennitsme/programmable-internet/issues>
- **Pull Requests:** <https://github.com/jennitsme/programmable-internet/pulls>
- **Discussions:** <https://github.com/jennitsme/programmable-internet/discussions>

If official public channels exist, this section can be extended with:

- **Website:** `https://your-domain.com`
- **X / Twitter:** `https://x.com/yourhandle`
- **Docs:** `https://your-docs-domain.com`
- **Discord:** `https://discord.gg/your-community`
- **Telegram:** `https://t.me/yourcommunity`

---

## One-line positioning

**Astro is a payment-native protocol and console for turning APIs, agents, and digital resources into programmable economic primitives.**

---

## Contributing

When contributing to this repository:

1. keep protocol language consistent
2. keep documentation aligned with the implementation
3. prefer typed contracts over ad-hoc payloads
4. treat the README as both product narrative and technical truth source

---

## License

Add a license file if this repository is intended to be reusable in public or commercial contexts.
