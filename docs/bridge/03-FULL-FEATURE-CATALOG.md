# 03 — Full feature catalog

Everything in scope for the complete product (not MVP-trimmed). Build order is in `12-BUILD-PHASES.md`; this file is the full checklist.

**Legend:** `[x]` implemented in sandbox/demo · `[~]` partial / deferred live credentials · `[ ]` not started

## A. Marketing site
- [x] Home (brand hero, one CTA: Start shopping)
- [x] How it works
- [x] Pricing explainer (fees, kg logic, customs honesty)
- [x] Allowed / banned items
- [x] Hubs & delivery areas (all Lebanon)
- [x] Diaspora “Pay for family”
- [x] FAQ
- [x] Trust: reviews, sample timelines, partner insurance notes
- [x] Blog/guides (SEO: “ship Amazon to Lebanon”, “pay Whish international shopping”)
- [x] Legal: Terms, Privacy, Refund/Damage, Prohibited items
- [x] Contact

## B. Customer app — discovery & quoting
- [x] Paste product URL (multi-store parsers)
- [x] Manual item form (screenshot + URL + declared price) when parser fails
- [x] Multi-item cart
- [x] Instant quote with breakdown:
  - item subtotal
  - buy-for-me fee
  - estimated weight / volumetric
  - shipping
  - customs/VAT estimate
  - payment fee buffer
  - **total USD**
- [x] Quote expiry timer (price/stock volatility)
- [x] Hub recommendation (UAE vs US) with ETA + cost compare
- [x] Category eligibility gate
- [x] Size/variant picker when page has options
- [x] Save for later / wishlist
- [x] Share cart link
- [x] Browser extension (Chrome MV3 scaffold; Safari later)
- [x] Curated catalog (top SKUs with locked landed prices)
- [x] Search curated catalog
- [x] Price drop / back-in-stock alerts on wishlist

## C. Auth & profiles
- [x] Phone OTP login (Lebanon +961 default)
- [x] Email login for diaspora
- [x] Profile: name, phones, preferred payment
- [x] Address book (multiple Lebanon addresses, pin/area, building notes)
- [x] Delivery instructions / landmark
- [x] Notification prefs (WhatsApp / SMS / email / push)
- [x] Family members (recipients linked to payer)
- [x] KYC tier for high-value orders (ID upload)
- [x] Account delete / data export

## D. Checkout & payments
- [x] Whish Money checkout (primary) — sandbox simulate
- [x] COD (with rules: max value, deposit %, area eligibility)
- [x] OMT reference payment flow
- [~] Card payment for diaspora payers (Tap sandbox stub; live PSP later)
- [x] Split pay: payer ≠ recipient
- [x] Partial prepay + COD remainder
- [x] Promo codes / referral credit
- [x] Gift note to recipient
- [x] Invoice PDF (USD)
- [x] Payment webhook handling + idempotency (sandbox)
- [x] Failed payment retry
- [x] Refund to original method (or Whish credit wallet)

## E. Orders & tracking
- [x] Order list + detail
- [x] Timeline statuses (see state machine)
- [x] Tracking number(s) per leg
- [x] Photo proof at hub intake
- [x] Weight finalization & adjustment invoice if needed (strict rules)
- [x] ETA windows by hub/method
- [~] Push/WhatsApp status notifications (logged; live WA later)
- [x] Delivery OTP / photo proof on delivery
- [x] Rate order + tip courier (optional)
- [x] Reorder
- [x] Claim: damage / missing / wrong item
- [x] Cancel rules by status
- [x] Return assist (best-effort; policy engine)

## F. Ship-for-me suite
- [x] Personal suite ID + UAE (and later US/TR) address block
- [x] Expected package form (store, tracking, contents)
- [x] Auto-match inbound scans to customer
- [x] Storage window + storage fees after free days
- [x] Consolidation picker (ship now vs wait for more)
- [x] Abandon / donate / discard rules

## G. Diaspora module
- [x] Payer dashboard
- [x] Pay links / request links from recipient
- [x] Recurring “family essentials” lists
- [x] Remittance-alternative messaging
- [x] Multi-currency display for payer (charge USD/settlement rules)

## H. Messaging & support
- [x] In-app ticket thread per order
- [~] WhatsApp Business API synced to same ticket (channel stub)
- [x] Macro replies for ops
- [x] Bot for FAQ + status (“where is my order?”)
- [x] CSAT after delivery
- [x] Escalation to partner

## I. Admin console (Bridge staff)
- [x] Users, addresses, risk flags
- [x] Orders board (kanban by status)
- [x] Buy queue (manual purchase workstation)
- [x] Partner assignment & manifests
- [x] Quote rule editor (fees, kg rates, category bans)
- [~] Store parser health dashboard (basic observability)
- [x] Payments & reconciliation
- [x] Refunds / credits ledger
- [x] Claims desk
- [x] COD cash collection reconciliation
- [x] Promo manager
- [x] Content CMS (FAQ, bans, blog)
- [x] Analytics: conversion, margin, SLA, NPS
- [x] Audit log
- [x] Staff roles/permissions
- [x] Feature flags

## J. Partner portal
- [x] Login (partner org users)
- [x] Inbound scan + photo upload
- [x] Weight/dimension entry
- [x] Discrepancy report (wrong item / damaged on arrival)
- [x] Consolidation batches
- [x] Outbound manifest to Lebanon
- [x] Flight/cargo handoff events
- [x] Customs event updates
- [x] Last-mile partner handoff (if separate)
- [x] Invoice Bridge weekly (per-kg + handling)
- [x] Claims response workflow
- [x] API keys + webhooks

## K. Partner API (machine)
- [x] Auth (API keys; mTLS later)
- [x] Create expected inbound
- [x] Webhook: received / weighed / departed / customs / delivered
- [x] Rate shop (optional)
- [~] Label URL / tracking sync (tracking fields; label URL later)
- [x] Idempotent event posting

## L. Pricing & catalog ops
- [x] Rate cards per hub/method
- [x] Volumetric divisor config
- [x] Category duty tables
- [x] FX buffers
- [x] Margin floors/ceilings
- [x] Manual quote override with reason

## M. Growth
- [x] Referral program (credit both sides)
- [x] First-order promo
- [x] Affiliate links for creators
- [x] Abandoned quote recovery (WhatsApp/SMS)
- [x] Review collection (Google / in-app)

## N. Mobile
- [x] Responsive web complete (PWA)
- [ ] Optional native shells later (not required for “full web product”) — deferred by design
- [~] Web push + WhatsApp deep links (prefs + notify logs)

## O. Observability
- [x] Error tracking
- [x] Product analytics
- [~] Payment lag alerts (events logged; pager later)
- [~] Partner SLA alerts (no scan in X days)
- [~] Cost/margin anomaly alerts
