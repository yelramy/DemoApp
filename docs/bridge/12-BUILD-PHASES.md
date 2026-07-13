# 12 — Build phases (full product, sequenced)

This is **full scope**, not an MVP-only plan. Phases are delivery sequence so “all of it” still ships coherently. Nothing in `03-FULL-FEATURE-CATALOG.md` is permanently cut; later phases complete it.

## Phase 0 — Foundations (week-scale)
- [ ] Repo monorepo scaffold (apps + packages)
- [ ] CI/CD, environments, Sentry, PostHog
- [ ] Prisma schema v1 (users, quotes, orders, payments, ledger, partners)
- [ ] Auth phone OTP + email OTP
- [ ] Design system tokens + core UI kit
- [ ] Admin shell + RBAC
- [ ] Legal stub pages
- [ ] Feature flags

## Phase 1 — Quote → Pay → Order spine
- [ ] Marketing home + how it works
- [ ] Paste URL + manual item intake
- [ ] Parser v1 (Amazon.ae, Noon, generic OG tags)
- [ ] Pricing engine + rate cards (UAE air)
- [ ] Quote UI breakdown
- [ ] Cart + checkout
- [ ] Whish payment link + webhooks
- [ ] COD path (basic)
- [ ] Order detail + timeline
- [ ] WhatsApp notify on status
- [ ] Admin orders board + buy queue (manual)
- [ ] Partner CSV import/export (no API yet)
- [ ] Refunds basic

**Exit criteria:** 10 real paid test orders delivered via partner.

## Phase 2 — Trust & ops hardening
- [ ] Hub photos in timeline
- [ ] Weight adjustment invoicing
- [ ] Claims flow
- [ ] Ticket system + WhatsApp sync
- [ ] Reconciliation dashboards
- [ ] Banned items engine
- [ ] Risk scoring for COD
- [ ] Address book + delivery areas
- [ ] Promo codes
- [ ] Invoice PDFs

## Phase 3 — Diaspora + ship-for-me
- [ ] Split checkout pay links
- [ ] Payer dashboard
- [ ] Suite addresses UAE
- [ ] Expected packages + consolidation UI
- [ ] Storage fees
- [ ] Card PSP for diaspora

## Phase 4 — Partner platform
- [ ] Partner portal UI
- [ ] Partner API + webhooks
- [ ] Manifest/batch tools
- [ ] Auto SLA alerts
- [ ] Dual-hub (add US rate card + parsers)

## Phase 5 — Growth surfaces
- [ ] Curated catalog + locked landed prices
- [ ] Browser extension
- [ ] Referral program
- [ ] Abandoned quote recovery
- [ ] Blog/SEO pages
- [ ] Review collection
- [ ] Family essentials recurring lists

## Phase 6 — Scale & polish
- [ ] TR/CN hubs
- [ ] Playwright parser farm
- [ ] Advanced analytics/margin AI assists
- [ ] PWA push
- [ ] Partial Arabic UI (optional)
- [ ] Native shells (optional)
- [ ] Multi-partner smart routing

## Definition of “ALL done”
Every checkbox in `03-FULL-FEATURE-CATALOG.md` is shipped or explicitly deferred with founder sign-off in `14-OPEN-DECISIONS.md`. Phases 0–5 are required for “full product”; Phase 6 is scale.

## Engineering standards (all phases)
- TypeScript strict
- Tests: pricing pure functions, state machine, payment idempotency
- Contract tests for webhooks
- Staging rehearsal before each phase prod enable
- No secrets in repo
