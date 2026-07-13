# 16 — Notification templates

All customer messages English. Variables in `{{braces}}`.

## WhatsApp / SMS
| Key | Body |
|---|---|
| `quote_ready` | Your Bridge quote is ready: {{total_usd}} USD all-in. Valid {{expires_in}}. Pay: {{link}} |
| `payment_received` | Payment received for {{order_id}}. We’re placing your order. |
| `purchased` | Ordered from the store. Tracking to our hub: {{retailer_tracking}} |
| `received_hub` | Arrived at our {{hub}} hub. Photo in your order page. |
| `weight_adjust` | Final weight {{kg}} kg. Extra {{amount}} USD due before shipping: {{link}} |
| `departed` | On the way to Lebanon. ETA {{eta}}. |
| `customs` | In Lebanese customs clearance. |
| `customs_hold` | Customs needs info for {{order_id}}: {{reason}}. Reply here or open {{link}} |
| `out_for_delivery` | Out for delivery today. Be ready for {{payment_hint}}. |
| `delivered` | Delivered. Problems within {{claim_hours}}h: {{link}} |
| `refunded` | Refund {{amount}} USD processed for {{order_id}}. |
| `cod_reminder` | Courier coming with {{order_id}}. Please have {{amount}} USD ready. |
| `abandoned_quote` | Still want {{item_title}}? Your quote can be refreshed: {{link}} |

## Email (diaspora + receipts)
- Payment receipt
- Weekly family activity summary (optional)
- Claim updates

## Ops alerts
- `sla_buy_overdue`
- `sla_inbound_missing`
- `sla_partner_silent`
- `payment_mismatch`
- `cod_fail_streak`
