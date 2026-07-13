# 11 — Automation and ops (low weekly hours)

## Automation target
Happy path **hands-off**. Humans only for exceptions + partner relationship.

## Automated
- URL parse & quote
- Payment capture confirmation
- Buy task creation
- Price recheck before buy
- Partner expected-inbound messages
- Status sync from partner webhooks
- Customer notifications
- SLA timers & alerts
- Quote expiry
- Referral credits
- Basic FAQ bot (“where is my order?”, banned items)
- Reconciliation reports

## Semi-automated (ops clicks)
- Manual purchase on hard sites (saved cards, 2FA)
- Alternate product approval
- Customs doc requests
- Claim adjudication
- COD exception handling
- Refund approval above threshold

## Manual (unavoidable)
- Partner negotiation / rate changes
- Edge-case customer empathy chats
- Legal / banking

## Staffing model for “few hours/week founder”
| Role | Hours | When |
|---|---|---|
| Founder | 2–5 / week | partners, pricing, escalations |
| Ops agent (part-time) | 15–25 / week | buy queue, tickets, COD |
| Logistics partner | contracted | physical pipe |

Without ops hire, founder time stays **8–15h/week**. Autopilot founder time needs **ops seat + stable partner API**.

## Playbooks (must write as runbooks in-app later)
1. OOS after payment  
2. Weight overage  
3. Damage at hub  
4. Customs hold  
5. Failed COD  
6. Lost in transit  
7. Wrong item  
8. Abusive customer  
9. Partner silent (SLA breach)

## Tools
- Admin buy-queue with browser profiles
- Shared password manager for retail accounts
- WhatsApp Business inbox = tickets
- On-call: Slack/Telegram alert for SLA reds only
