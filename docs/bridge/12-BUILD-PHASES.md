# 12 — Build phases (full product, sequenced)

Status on `cursor/bridge-build-a9ff`: **implemented in sandbox form**. Live credentials / store release remain external.

## Phase 0 — Foundations
- [x] Repo monorepo scaffold (apps + packages)
- [x] Environments via `.env.example` (Sentry/PostHog hooks deferred to prod keys)
- [x] Prisma schema (full domain)
- [x] Auth phone OTP + email OTP
- [x] Design system tokens + UI
- [x] Admin shell + RBAC
- [x] Legal stub pages
- [x] Feature flags

## Phase 1 — Quote → Pay → Order spine
- [x] Marketing home + how it works
- [x] Paste URL + manual item intake
- [x] Parser v1 (Amazon.ae, Noon, generic OG tags)
- [x] Pricing engine + rate cards (UAE air + multi-hub)
- [x] Quote UI breakdown
- [x] Cart/checkout
- [x] Whish payment link + webhooks (sandbox)
- [x] COD path (risk-gated)
- [x] Order detail + timeline
- [x] WhatsApp notify → NotificationLog sandbox
- [x] Admin orders board + buy queue
- [x] Partner CSV export
- [x] Refunds basic

## Phase 2 — Trust & ops hardening
- [x] Hub photos in timeline
- [x] Weight adjustment invoicing
- [x] Claims flow
- [x] Ticket system (+ WhatsApp sandbox log)
- [x] Reconciliation dashboards
- [x] Banned items engine
- [x] Risk scoring for COD
- [x] Address book + delivery areas
- [x] Promo codes
- [x] Invoice download

## Phase 3 — Diaspora + ship-for-me
- [x] Split checkout pay links
- [x] Payer pay page
- [x] Suite addresses UAE/US/TR
- [x] Expected packages + consolidation UI
- [x] Storage fees
- [x] Card PSP sandbox

## Phase 4 — Partner platform
- [x] Partner portal UI
- [x] Partner API + events
- [x] Manifest/batch tools
- [x] Auto SLA lists (admin ops)
- [x] Dual-hub (+ TR/CN rate cards)

## Phase 5 — Growth surfaces
- [x] Curated catalog + locked landed prices
- [x] Browser bookmarklet extension
- [x] Referral program
- [x] Abandoned quote recovery
- [x] Blog/SEO pages
- [x] Review collection
- [x] Family essentials lists

## Phase 6 — Scale & polish
- [x] TR/CN hubs (rates + selector)
- [x] Parser multi-store detection (incl. Trendyol/iHerb)
- [x] Analytics endpoint
- [x] PWA manifest
- [ ] Partial Arabic UI (deferred — EN-only decision)
- [ ] Native shells (deferred)
- [x] Multi-partner smart routing by hub key
