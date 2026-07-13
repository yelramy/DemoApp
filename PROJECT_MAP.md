# PROJECT_MAP

## What this repo is
**Bridge** — English web product for Lebanon: paste a product link / multi-item cart, get an all-in USD quote, pay with Whish/COD/OMT/card, track delivery. Logistics partnered (UAE/US/TR/CN).

## Status
- Branch: `cursor/mobile-first-a9ff` (mobile-first production shell)
- Base product: merged on `master` (sandbox web catalog complete)
- Plan docs: `docs/bridge/` · checklist: `docs/bridge/03-FULL-FEATURE-CATALOG.md`

## Run
```bash
pnpm install
cp packages/db/.env.example packages/db/.env
cp apps/web/.env.example apps/web/.env.local
pnpm db:generate && pnpm db:push && pnpm db:seed
pnpm dev
```
- Local SQLite: `packages/db/.env` + `apps/web/.env.local` (from `*.example`; gitignored)
- http://localhost:3000 · OTP `246810`
- Customer `+96170123456` · Admin `admin@bridge.lb`
- Partner login `uae@partner.bridge` / `246810` · API `partner-demo-key`
- Promo `BRIDGE10` · Affiliate `CREATOR1`
- Health: `GET /api/health`
- Extension: load unpacked `apps/extension`

## Mobile-first (latest)
- Bottom tabs on `/app/*`: Shop · Orders · Cart · Account · More sheet
- Marketing hamburger sheet; sticky header with safe-area
- Quote: clipboard Paste, options collapsed, full-width CTA
- Checkout / pay: sticky thumb CTA above tab bar
- PWA: icons 192/512/180, `sw.js` shell cache, installable manifest (`start_url=/app`)
- Touch: 48px targets, 16px inputs (no iOS zoom), `viewport-fit=cover`
- Prod hardening: security headers, `/api/health`, expanded `.env.example`

## Still live-only
Real Whish/Tap/WhatsApp credentials, production Postgres/Redis/Nest workers, Arabic UI, native apps, Chrome Web Store publish.

## CI note
`.github/workflows/ci.yml` uses `pnpm/action-setup@v4` without a `version` key (reads `packageManager` from root `package.json`) and Node 24.
