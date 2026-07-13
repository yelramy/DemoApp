# 15 — API surface (complete target)

Base: `https://api.bridge.lb/v1` (domain TBD). Auth: Bearer session JWT or API keys (partner).

## Public / app
### Auth
- `POST /auth/otp/request` `{ phone|email }`
- `POST /auth/otp/verify` → session
- `POST /auth/logout`
- `GET /me`

### Addresses
- `GET/POST /addresses`
- `PATCH/DELETE /addresses/:id`

### Parsing & quotes
- `POST /parse` `{ url }` → product draft
- `POST /quotes` `{ lines[], hub?, method? }`
- `GET /quotes/:id`
- `POST /quotes/:id/refresh`

### Cart / checkout
- `GET/POST /cart/items`
- `POST /checkout/intents` `{ quoteId, addressId, paymentMethod, payer? }`
- `POST /checkout/intents/:id/confirm`

### Payments webhooks
- `POST /webhooks/whish`
- `POST /webhooks/psp`
- `POST /webhooks/omt` (if any)

### Orders
- `GET /orders`
- `GET /orders/:id`
- `POST /orders/:id/cancel`
- `POST /orders/:id/claims`
- `GET /orders/:id/invoice.pdf`

### Suite
- `GET /suite`
- `POST /suite/expected`
- `POST /suite/consolidate`

### Family / diaspora
- `GET/POST /family/members`
- `POST /pay-links` `{ orderId|cartId, payerEmail }`
- `GET /pay-links/:token`

### Support
- `GET/POST /tickets`
- `POST /tickets/:id/messages`

### Wallet
- `GET /wallet`
- `POST /referrals/redeem`

## Admin
- `GET /admin/orders` filters
- `POST /admin/orders/:id/transition`
- `GET /admin/buy-queue`
- `POST /admin/buy-queue/:id/complete`
- `CRUD /admin/rate-cards`
- `CRUD /admin/bans`
- `GET /admin/reconciliation/:day`
- `POST /admin/refunds`
- staff/users/flags/content endpoints

## Partner
- `POST /partner/events` (idempotent)
- `GET /partner/expected`
- `POST /partner/inbounds/:id/receive`
- `POST /partner/batches`
- `POST /partner/manifests`
- `GET /partner/invoices`

## Error format
```json
{ "error": { "code": "QUOTE_EXPIRED", "message": "...", "details": {} } }
```
