# PROJECT_MAP

## What this repo is
**Bridge** — English-language web product for Lebanon: paste a product link, get an all-in USD quote, pay with Whish/COD/OMT, track delivery. Logistics partnered (UAE-first).

## Status
- DemoApp removed (`cursor/clear-demo-app-a9ff`)
- Full plan in `docs/bridge/` (`cursor/bridge-full-plan-a9ff`)
- **Application code scaffolded** on `cursor/bridge-build-a9ff` (Phase 0–1 spine working)

## Run locally
```bash
pnpm install
pnpm db:generate && pnpm db:push && pnpm db:seed
pnpm dev
```
Open http://localhost:3000  
Sandbox OTP: `246810`  
Demo customer phone: `+96170123456`  
Admin email: `admin@bridge.lb`  
Partner API key: `partner-demo-key`

## Code map
| Path | Role |
|---|---|
| `apps/web` | Next.js marketing + customer app + admin + partner + API routes |
| `packages/db` | Prisma schema + SQLite client |
| `packages/pricing` | Quote/margin engine (tested) |
| `packages/parsers` | URL/manual product parse |
| `docs/bridge/` | Full product plan |

## Implemented now
- Marketing: home, how-it-works, pricing, pay-for-family, legal stubs
- Auth: phone/email OTP (sandbox)
- Quotes: link parse + manual + all-in USD breakdown
- Checkout: Whish (simulated), COD, OMT intent
- Orders + timeline
- Admin buy queue + status transitions
- Partner event ingestion API + demo UI
- Pricing unit tests

## Still to build (per `docs/bridge/12-BUILD-PHASES.md`)
Phase 2+: claims UI, WhatsApp provider, reconciliation, suite ship-for-me, diaspora card PSP, real Whish merchant, extension, curated catalog, Nest/Redis split when infra available

## Defaults locked
See `docs/bridge/14-OPEN-DECISIONS.md` — defaults accepted for build (Bridge, Nest deferred to Next routes for now, UAE-first, EN-only, margin floor $4/12%).
