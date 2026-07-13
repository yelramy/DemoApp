# PROJECT_MAP

## What this repo is
**Bridge** — English web product for Lebanon: paste a product link / multi-item cart, get an all-in USD quote, pay with Whish/COD/OMT/card, track delivery. Logistics partnered (UAE/US/TR/CN).

## Status
- Branch: `cursor/bridge-build-a9ff`
- Catalog coverage: sandbox-complete for web product; live PSP/WA/Postgres deferred
- Plan docs: `docs/bridge/` · checklist: `docs/bridge/03-FULL-FEATURE-CATALOG.md`

## Run
```bash
pnpm install
pnpm db:generate && pnpm db:push && pnpm db:seed
pnpm dev
```
- http://localhost:3000 · OTP `246810`
- Customer `+96170123456` · Admin `admin@bridge.lb`
- Partner login `uae@partner.bridge` / `246810` · API `partner-demo-key`
- Promo `BRIDGE10` · Affiliate `CREATOR1`
- Extension: load unpacked `apps/extension`

## Latest pass (closing catalog gaps)
- Schema: duties, FX, returns, partner invoices/login, affiliates, observability, tip/deposit/wallet/variant
- Checkout: wallet credit, COD deposit, tip; quote expiry UI; variants/screenshot/category
- Orders: ETA, returns, CSAT, tip, payment retry, per-order ticket
- Suite: abandon/donate/discard; partner auto-match by tracking
- Partner: login, invoices, rates, discrepancy + idempotent events
- Diaspora: `/app/payer` multi-currency dashboard
- Admin: CMS, quote override, affiliates, observability/audit tabs

## Still live-only
Real Whish/Tap/WhatsApp credentials, production Postgres/Redis/Nest workers, Arabic UI, native apps, Chrome Web Store publish.

## CI note
`.github/workflows/ci.yml` uses `pnpm/action-setup@v4` without a `version` key (reads `packageManager` from root `package.json`) and Node 24.
