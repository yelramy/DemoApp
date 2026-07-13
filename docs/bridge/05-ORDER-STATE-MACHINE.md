# 05 — Order state machine

## States
```
draft
quoted
awaiting_payment
paid
buy_in_progress
purchased
awaiting_inbound
received_at_hub
on_hold_hub
consolidated
in_transit_to_lebanon
customs_clearance
customs_hold
out_for_delivery
delivered
completed
cancelled
refund_pending
refunded
claim_open
claim_resolved
failed
```

## Happy path
`draft → quoted → awaiting_payment → paid → buy_in_progress → purchased → awaiting_inbound → received_at_hub → consolidated → in_transit_to_lebanon → customs_clearance → out_for_delivery → delivered → completed`

## Ship-for-me variant
Skip buy states: after suite inbound match → `received_at_hub` then customer pays shipping (`awaiting_payment` for ship fee) → continue.

## Transition rules (selected)
| From | To | Trigger | Who |
|---|---|---|---|
| quoted | awaiting_payment | user starts checkout | system |
| awaiting_payment | paid | Whish/card webhook OK | payments |
| awaiting_payment | cancelled | quote expired / user cancel | system/user |
| paid | buy_in_progress | enqueue buy job | system |
| buy_in_progress | purchased | buyer confirms order # | ops/automation |
| buy_in_progress | refund_pending | OOS / cannot buy | ops |
| purchased | awaiting_inbound | retailer tracking saved | system |
| awaiting_inbound | received_at_hub | partner scan+photo | partner |
| received_at_hub | on_hold_hub | damage/mismatch | partner/ops |
| received_at_hub | consolidated | added to batch | partner |
| consolidated | in_transit_to_lebanon | manifest departed | partner |
| in_transit_to_lebanon | customs_clearance | arrived LB | partner |
| customs_clearance | customs_hold | docs/duty issue | partner |
| customs_clearance | out_for_delivery | cleared | partner |
| out_for_delivery | delivered | POD | partner/courier |
| delivered | completed | claim window elapsed (e.g. 48–72h) | system |
| * | claim_open | user files claim in window | user |
| any pre-purchase | cancelled | policy allow | user/ops |

## Timers / SLAs
| Condition | SLA | Action |
|---|---|---|
| Quote lifetime | 2–6 hours (config) | expire |
| Paid but not purchased | 24h | alert ops |
| Purchased no inbound scan | hub ETA + 5d | alert partner |
| Received not consolidated | 7–14d free storage then fees | notify user |
| In transit no update | 5d | alert |
| Customs hold | 48h customer response | escalate |
| Delivery attempts | 3 | return to depot / reattempt rules |
| Claim window | 48–72h after deliver | auto-complete |

## Money side-effects
- `paid`: capture/hold funds; create ledger entry
- weight adjustment after hub weigh: issue `adjustment_invoice` (only if outside tolerance band disclosed at checkout)
- `refunded`: reverse ledger; release promo holds
- COD: `delivered` triggers cash collection confirm → settle

## Notifications map
Every customer-visible state change → WhatsApp template + in-app event.  
Ops alerts for SLA breaches only.
