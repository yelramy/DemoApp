# 17 — Test plan

## Unit
- Pricing engine (kg ceil, volumetric, margin floor, promos)
- Order state transitions (illegal transitions throw)
- Ledger balancing
- Webhook idempotency keys
- Parser confidence thresholds

## Integration
- Whish webhook → paid → buy job enqueued
- Partner event → timeline + customer notify
- COD deliver → reconciliation row
- Quote expiry job
- Weight overage invoice gating outbound

## E2E (Playwright)
1. Paste Noon URL → quote → Whish sandbox pay → see `paid`
2. Diaspora pay link → card sandbox → recipient tracking
3. Ship-for-me expected → receive event → pay ship → delivered
4. OOS path → refund
5. Admin buy-queue complete happy path

## UAT (Lebanon)
- Real Whish small charge + refund
- Real partner pilot 5 parcels
- Delivery to Beirut + 1 outside Beirut
- COD attempt success + refuse
- Claim damage photo flow

## Load
- Quote endpoint under burst
- Webhook burst duplicate storm

## Security
- OTP brute force lockout
- Partner API auth negative tests
- Admin RBAC denial tests
