# PROJECT_MAP

## What this repo is
**Bridge** — English-language web product for Lebanon that lets people (and diaspora paying for family) buy from abroad, pay locally (Whish / COD / OMT), and get door delivery. Logistics is partnered (UAE-first); Bridge owns UX, quotes, payments, tracking, and customer trust.

## Status
- DemoApp macOS template removed (branch `cursor/clear-demo-app-a9ff`).
- Full build plan landed on `cursor/bridge-full-plan-a9ff` (this work).
- **No application code yet** — plan only.

## Doc index (read in order)
| File | Contents |
|---|---|
| `docs/bridge/00-VISION.md` | Problem, positioning, brand, success metrics |
| `docs/bridge/01-MARKET-AND-POSITIONING.md` | Competitors, gaps, why Bridge wins |
| `docs/bridge/02-PERSONAS-AND-JOURNEYS.md` | Users, partners, ops; end-to-end journeys |
| `docs/bridge/03-FULL-FEATURE-CATALOG.md` | Every feature surface (customer → admin → partner) |
| `docs/bridge/04-INFORMATION-ARCHITECTURE.md` | Sitemap, nav, screens |
| `docs/bridge/05-ORDER-STATE-MACHINE.md` | Order lifecycle, edge cases, SLAs |
| `docs/bridge/06-PRICING-AND-MARGINS.md` | Quote engine, fees, margin rules |
| `docs/bridge/07-PAYMENTS.md` | Whish, COD, OMT, diaspora card, reconciliation |
| `docs/bridge/08-LOGISTICS-PARTNER-PROTOCOL.md` | Partner API/ops contract, hubs, customs |
| `docs/bridge/09-SYSTEM-ARCHITECTURE.md` | Services, stack, data model, infra |
| `docs/bridge/10-SECURITY-COMPLIANCE-RISK.md` | Fraud, KYC, banned goods, legal |
| `docs/bridge/11-AUTOMATION-AND-OPS.md` | What auto vs human; staffing for low weekly hours |
| `docs/bridge/12-BUILD-PHASES.md` | Full scope build order (not “MVP-only”) |
| `docs/bridge/13-LAUNCH-AND-GROWTH.md` | Soft launch, marketing, support playbooks |
| `docs/bridge/14-OPEN-DECISIONS.md` | Decisions that still need a human call |
| `docs/bridge/15-API-SURFACE.md` | Full HTTP API target |
| `docs/bridge/16-NOTIFICATION-TEMPLATES.md` | WhatsApp/email/ops copy |
| `docs/bridge/17-TEST-PLAN.md` | Unit/integration/E2E/UAT |

## Intended stack (planned)
- Web: Next.js (App Router) + TypeScript
- API/DB: NestJS or Next route handlers + PostgreSQL + Redis
- Admin: same monorepo `/admin`
- Partner portal: `/partner`
- Jobs: queue (BullMQ) for quotes, buys, notifications
- Payments: Whish merchant + COD + OMT reference flow
- Hosting: Vercel (web) + managed Postgres + worker

## Next agent actions
1. Lock open decisions in `14-OPEN-DECISIONS.md` with the founder.
2. Scaffold monorepo per `09-SYSTEM-ARCHITECTURE.md` and `12-BUILD-PHASES.md` Phase 0–1.
3. Do not reintroduce DemoApp.
