# 02 — Personas and journeys

## Personas

### P1 — Maya (Beirut shopper, 22–35)
- Wants Shein/Noon/Amazon/iHerb items
- Has Whish; card fails abroad
- Distrusts prepaid unknowns; will prepay if quote is clear + social proof
- Needs: fast quote, Whish, tracking, WhatsApp backup

### P2 — Karim (parent, 30–45)
- Buys baby formula, vitamins, device accessories
- Price-sensitive on shipping kg
- Prefers COD on first order, Whish later
- Needs: category trust, damage policy, ETA honesty

### P3 — Sara (diaspora payer, Dubai/Paris/US)
- Pays for parents/siblings in Lebanon
- Has normal international card
- Wants receipt + delivery confirmation to family
- Needs: split checkout, gift note, payer dashboard

### P4 — Rami (ops agent, part-time)
- Handles exceptions 2–4 hrs/day
- Needs: queue of blocked orders, macros, partner chat log, refund tools

### P5 — Partner warehouse (Dubai)
- Receives parcels, photos, consolidates, ships lanes to LB
- Needs: ASN/order IDs, SKU restrictions, daily manifest, claim process

## Journeys

### J1 — Link → delivered (core)
1. Land on Bridge → paste URL
2. Parser fetches title/image/price/weight estimate
3. Quote engine returns all-in USD breakdown
4. Account create / login (phone + OTP)
5. Choose recipient address in Lebanon
6. Pay Whish (or COD deposit rules)
7. Order enters `paid` → buy task created
8. Purchased → inbound to UAE hub
9. Received+photo → consolidated → departed
10. Customs → out for delivery → delivered
11. Review / referral prompt

### J2 — Diaspora pays
1. Recipient creates wishlist/cart in Lebanon (or payer pastes links)
2. Payer opens pay link (magic link)
3. Pays card / Whish (if available) abroad
4. Recipient gets tracking; payer gets receipts

### J3 — Ship-for-me (customer already bought)
1. Customer gets Bridge UAE address + suite ID
2. Shops Noon/Amazon.ae themselves
3. Marks inbound expected in app
4. Hub receives → quote shipping only → pay → forward

### J4 — Exception: customs hold
1. Status → `customs_hold`
2. Customer notified with reason + options
3. Ops/partner resolves docs or returns
4. Resume or refund path

### J5 — Exception: out of stock after pay
1. Buy task fails
2. Auto-offer: waitlist / alternate / full refund
3. SLA: resolve within 24h

## Support channels
- In-app chat (primary)
- WhatsApp Business (fallback, same ticket ID)
- Email receipts only (not primary support)
