# 07 — Payments

## Principles
1. Whish is default for Lebanon residents
2. COD is allowed with risk controls
3. Diaspora card pay is first-class for split checkout
4. Every cent has a ledger entry
5. Webhooks are idempotent

## Methods

### Whish Money (primary)
- Merchant payment link or deep link / QR
- Webhook → mark `paid`
- Settlement tracking to Bridge bank/wallet
- Refund path: Whish refund API if available, else credit wallet + manual

### COD
- Eligibility: address area, order max USD, customer risk score
- Optional deposit (Whish) % for high value
- Driver collects USD cash (policy: USD only)
- Attempts: 3 then depot hold
- Reconciliation: courier remit vs order IDs daily

### OMT
- Generate reference + amount + instructions
- Customer pays at OMT / app
- Ops or webhook confirms reference
- Auto-expire unpaid references

### Diaspora card
- PSP: Tap / equivalent supporting international cards
- 3DS required
- Payer entity/billing country may differ from recipient
- Receipts to payer email

### Credits wallet
- Referral, goodwill, weight underage
- Not cash-outable; applies to service fees/shipping first

## Split checkout
- Cart owned by recipient account
- `PaymentIntent` assigned to payer user or guest payer
- Permissions: payer sees amounts + tracking; recipient sees delivery

## Ledger (double-entry lite)
Accounts: customer_liability, partner_payable, revenue_fees, revenue_shipping, cogs_shipping, payment_fees, cash_whish, cash_cod, refunds  
Every payment/refund/adjustment posts journal rows.

## Reconciliation jobs
- Daily: Whish settlement vs `paid` orders
- Daily: COD collections vs delivered
- Weekly: partner invoices vs manifests weights
- Alert on unmatched > threshold

## Failure modes
| Event | Handling |
|---|---|
| Double webhook | idempotency key |
| Paid then OOS | refund or alternate within 24h |
| COD refuse | restocking path; blacklist score |
| Partial Whish pay | do not buy until full |
| Chargeback (card) | freeze related orders; evidence pack |

## Fees to price in
- Whish merchant fee (~1–2% ballpark — confirm contract)
- PSP card fees
- COD failure cost amortized into COD surcharge
