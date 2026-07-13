# 09 — System architecture

## High-level
```
[Web Next.js] ─── [API] ─── [Postgres]
     │              │
     │              ├── Redis (sessions, rate limit, cache)
     │              ├── Queue workers (BullMQ)
     │              ├── Object storage (photos, invoices)
     │              ├── WhatsApp Business API
     │              ├── Whish + PSP webhooks
     │              └── Partner webhooks
     │
[Admin] [Partner portal]  (same monorepo apps)
```

## Monorepo layout
```
/apps/web          # customer + marketing
/apps/admin
/apps/partner
/apps/api          # NestJS (preferred) or Next route handlers + workers
/apps/worker
/packages/ui
/packages/config
/packages/db       # Prisma schema
/packages/pricing
/packages/parsers  # store URL parsers
```

## Stack choices
| Layer | Choice | Why |
|---|---|---|
| Web | Next.js App Router + TS | SEO marketing + app |
| API | NestJS + OpenAPI | clear modules, queues |
| DB | PostgreSQL + Prisma | relational orders/ledger |
| Cache/queue | Redis + BullMQ | jobs/SLA timers |
| Auth | Phone OTP (Lebanon) + email magic/OTP diaspora | local reality |
| Files | S3-compatible | hub photos |
| Hosting | Vercel (frontends) + Fly/Render/AWS (API/worker) | split concerns |
| Observability | Sentry + OpenTelemetry + PostHog | errors + product |

## Core domain modules
- Users & Families
- Addresses
- Catalog/Parsers
- Quotes
- Carts & Orders
- Payments & Ledger
- Fulfillment/Partner
- Claims
- Support/Tickets
- Pricing/Config
- Notifications
- Admin/Audit

## Data model (tables — essential)
`users`, `user_identities`, `families`, `family_members`,  
`addresses`,  
`stores`, `parsed_products`,  
`quotes`, `quote_lines`,  
`carts`, `cart_items`,  
`orders`, `order_events`,  
`payment_intents`, `payment_events`, `ledger_accounts`, `ledger_entries`,  
`partner_orgs`, `partner_users`, `hubs`, `rate_cards`,  
`inbounds`, `parcels`, `batches`, `manifests`,  
`claims`, `tickets`, `ticket_messages`,  
`promos`, `wallets`, `wallet_transactions`,  
`feature_flags`, `audit_logs`

## Parser subsystem
- Input URL → detect store → fetch HTML/API → extract title, price, currency, images, variants, weight hints
- Headless browser fallback (Playwright) for JS sites
- Confidence score; below threshold → manual form
- Cache parses; respect robots/ToS; prefer official APIs where exist
- Worker refreshes price before payment capture

## Quote service
Pure function library in `packages/pricing` used by API and admin simulators.

## Notification service
Templates: WhatsApp / SMS / email / push.  
Provider abstraction with failover.

## Security baselines
- TLS everywhere
- Secrets in vault/env
- Webhook signature verification
- RBAC for admin/partner
- PII encryption at rest for IDs
- Rate limits on OTP and quote

## Environments
`dev` / `staging` / `prod`  
Staging must simulate Whish webhooks + partner events.
