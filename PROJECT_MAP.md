# PROJECT_MAP

## What this repo is
**Bridge** — English web product for Lebanon: paste a product link, get an all-in USD quote, pay with Whish/COD/OMT/card, track delivery. Logistics partnered (UAE/US/TR/CN rate cards).

## Status
- Branch: `cursor/bridge-build-a9ff`
- **Phases 0–6 implemented in code** (sandbox payments / WhatsApp logged as notification rows; real merchant + MV3 store release still external)
- Plan docs: `docs/bridge/`

## Run
```bash
pnpm install
pnpm db:generate && pnpm db:push && pnpm db:seed
pnpm dev
```
- http://localhost:3000
- OTP: `246810`
- Customer: `+96170123456`
- Admin: `admin@bridge.lb`
- Partner keys: `partner-demo-key`, `partner-us-demo-key`
- Promo: `BRIDGE10`

## Code map
| Path | Role |
|---|---|
| `apps/web` | Marketing, customer app, admin, partner, APIs |
| `apps/extension` | Bookmarklet notes (MV3 later) |
| `packages/db` | Prisma schema (full domain) |
| `packages/pricing` | Quote/margin engine |
| `packages/parsers` | URL/manual parse |
| `docs/bridge/` | Product plan |

## Phase coverage (shipped in app)
- **0–1** Quote → pay → orders → admin buy queue
- **2** Claims, tickets, bans, COD risk/areas, promos, addresses, invoices, weight adjust, recon, hub photos
- **3** Diaspora pay links, suite ship-for-me, storage fees, card sandbox
- **4** Partner portal batches/manifests/export, multi-hub partners, SLA lists in admin ops
- **5** Catalog, bookmarklet extension, referrals, abandoned nudges, blog, reviews, essentials lists
- **6** TR/CN hubs, analytics endpoint, PWA manifest, multi-partner keys

## Still external / live-only
- Real Whish + Tap merchant credentials
- Real WhatsApp Business API (sandbox logs to `NotificationLog`)
- Chrome Web Store MV3 package
- Postgres/Redis/Nest workers in production infra
