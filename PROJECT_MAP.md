# PROJECT_MAP

## What this repo is
**Bridge** — English web product for Lebanon: paste a product link / multi-item cart, get an all-in USD quote, pay with Whish/COD/OMT/card, track delivery. Logistics partnered (UAE/US/TR/CN).

## Status
- Branch: `cursor/bridge-build-a9ff`
- Phases 0–6 + catalog gap-fill (cart, wishlist, settings, admin console, MV3, CI)
- Plan docs: `docs/bridge/`

## Run
```bash
pnpm install
pnpm db:generate && pnpm db:push && pnpm db:seed
pnpm dev
```
- http://localhost:3000 · OTP `246810`
- Customer `+96170123456` · Admin `admin@bridge.lb`
- Partner `partner-demo-key` · Promo `BRIDGE10`
- Extension: load unpacked `apps/extension`

## Highlights added in latest pass
- Multi-item cart + share links + hub compare
- Wishlist + price-drop alert job hook
- Settings/KYC/export/delete, family members, OMT confirm, cancel/reorder, delivery OTP API
- Admin console: kanban, users, claims, config
- Contact / hubs / trust pages, support bot
- Chrome MV3 scaffold + GitHub Actions CI

## Still live-only
Real Whish/Tap/WhatsApp credentials, production Postgres/Redis, Arabic UI, native apps.
