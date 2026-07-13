# 03 — Full feature catalog

Everything in scope for the complete product (not MVP-trimmed). Build order is in `12-BUILD-PHASES.md`; this file is the full checklist.

## A. Marketing site
- [ ] Home (brand hero, one CTA: Start shopping)
- [ ] How it works
- [ ] Pricing explainer (fees, kg logic, customs honesty)
- [ ] Allowed / banned items
- [ ] Hubs & delivery areas (all Lebanon)
- [ ] Diaspora “Pay for family”
- [ ] FAQ
- [ ] Trust: reviews, sample timelines, partner insurance notes
- [ ] Blog/guides (SEO: “ship Amazon to Lebanon”, “pay Whish international shopping”)
- [ ] Legal: Terms, Privacy, Refund/Damage, Prohibited items
- [ ] Contact

## B. Customer app — discovery & quoting
- [ ] Paste product URL (multi-store parsers)
- [ ] Manual item form (screenshot + URL + declared price) when parser fails
- [ ] Multi-item cart
- [ ] Instant quote with breakdown:
  - item subtotal
  - buy-for-me fee
  - estimated weight / volumetric
  - shipping
  - customs/VAT estimate
  - payment fee buffer
  - **total USD**
- [ ] Quote expiry timer (price/stock volatility)
- [ ] Hub recommendation (UAE vs US) with ETA + cost compare
- [ ] Category eligibility gate
- [ ] Size/variant picker when page has options
- [ ] Save for later / wishlist
- [ ] Share cart link
- [ ] Browser extension (Chrome/Safari): “Add to Bridge” on Amazon/Noon (full product)
- [ ] Curated catalog (top SKUs with locked landed prices)
- [ ] Search curated catalog
- [ ] Price drop / back-in-stock alerts on wishlist

## C. Auth & profiles
- [ ] Phone OTP login (Lebanon +961 default)
- [ ] Email login for diaspora
- [ ] Profile: name, phones, preferred payment
- [ ] Address book (multiple Lebanon addresses, pin/area, building notes)
- [ ] Delivery instructions / landmark
- [ ] Notification prefs (WhatsApp / SMS / email / push)
- [ ] Family members (recipients linked to payer)
- [ ] KYC tier for high-value orders (ID upload)
- [ ] Account delete / data export

## D. Checkout & payments
- [ ] Whish Money checkout (primary)
- [ ] COD (with rules: max value, deposit %, area eligibility)
- [ ] OMT reference payment flow
- [ ] Card payment for diaspora payers (Tap/international PSP)
- [ ] Split pay: payer ≠ recipient
- [ ] Partial prepay + COD remainder
- [ ] Promo codes / referral credit
- [ ] Gift note to recipient
- [ ] Invoice PDF (USD)
- [ ] Payment webhook handling + idempotency
- [ ] Failed payment retry
- [ ] Refund to original method (or Whish credit wallet)

## E. Orders & tracking
- [ ] Order list + detail
- [ ] Timeline statuses (see state machine)
- [ ] Tracking number(s) per leg
- [ ] Photo proof at hub intake
- [ ] Weight finalization & adjustment invoice if needed (strict rules)
- [ ] ETA windows by hub/method
- [ ] Push/WhatsApp status notifications
- [ ] Delivery OTP / photo proof on delivery
- [ ] Rate order + tip courier (optional)
- [ ] Reorder
- [ ] Claim: damage / missing / wrong item
- [ ] Cancel rules by status
- [ ] Return assist (best-effort; policy engine)

## F. Ship-for-me suite
- [ ] Personal suite ID + UAE (and later US/TR) address block
- [ ] Expected package form (store, tracking, contents)
- [ ] Auto-match inbound scans to customer
- [ ] Storage window + storage fees after free days
- [ ] Consolidation picker (ship now vs wait for more)
- [ ] Abandon / donate / discard rules

## G. Diaspora module
- [ ] Payer dashboard
- [ ] Pay links / request links from recipient
- [ ] Recurring “family essentials” lists
- [ ] Remittance-alternative messaging
- [ ] Multi-currency display for payer (charge USD/settlement rules)

## H. Messaging & support
- [ ] In-app ticket thread per order
- [ ] WhatsApp Business API synced to same ticket
- [ ] Macro replies for ops
- [ ] Bot for FAQ + status (“where is my order?”)
- [ ] CSAT after delivery
- [ ] Escalation to partner

## I. Admin console (Bridge staff)
- [ ] Users, addresses, risk flags
- [ ] Orders board (kanban by status)
- [ ] Buy queue (manual purchase workstation)
- [ ] Partner assignment & manifests
- [ ] Quote rule editor (fees, kg rates, category bans)
- [ ] Store parser health dashboard
- [ ] Payments & reconciliation
- [ ] Refunds / credits ledger
- [ ] Claims desk
- [ ] COD cash collection reconciliation
- [ ] Promo manager
- [ ] Content CMS (FAQ, bans, blog)
- [ ] Analytics: conversion, margin, SLA, NPS
- [ ] Audit log
- [ ] Staff roles/permissions
- [ ] Feature flags

## J. Partner portal
- [ ] Login (partner org users)
- [ ] Inbound scan + photo upload
- [ ] Weight/dimension entry
- [ ] Discrepancy report (wrong item / damaged on arrival)
- [ ] Consolidation batches
- [ ] Outbound manifest to Lebanon
- [ ] Flight/cargo handoff events
- [ ] Customs event updates
- [ ] Last-mile partner handoff (if separate)
- [ ] Invoice Bridge weekly (per-kg + handling)
- [ ] Claims response workflow
- [ ] API keys + webhooks

## K. Partner API (machine)
- [ ] Auth (mTLS or signed API keys)
- [ ] Create expected inbound
- [ ] Webhook: received / weighed / departed / customs / delivered
- [ ] Rate shop (optional)
- [ ] Label URL / tracking sync
- [ ] Idempotent event posting

## L. Pricing & catalog ops
- [ ] Rate cards per hub/method
- [ ] Volumetric divisor config
- [ ] Category duty tables
- [ ] FX buffers
- [ ] Margin floors/ceilings
- [ ] Manual quote override with reason

## M. Growth
- [ ] Referral program (credit both sides)
- [ ] First-order promo
- [ ] Affiliate links for creators
- [ ] Abandoned quote recovery (WhatsApp/SMS)
- [ ] Review collection (Google / in-app)

## N. Mobile
- [ ] Responsive web complete (PWA)
- [ ] Optional native shells later (not required for “full web product”)
- [ ] Web push + WhatsApp deep links

## O. Observability
- [ ] Error tracking
- [ ] Product analytics
- [ ] Payment lag alerts
- [ ] Partner SLA alerts (no scan in X days)
- [ ] Cost/margin anomaly alerts
