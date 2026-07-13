# 08 — Logistics partner protocol

## Model
Bridge does **not** own UAE warehouse day one.  
Partner(s) provide: receiving address, intake, photos, weigh/dim, consolidate, export, fly/truck to LB, customs assist, last mile (or hand off to LB courier).

## Hub roadmap
1. **UAE (Dubai)** — default
2. **US** — Amazon/iHerb specialty
3. **Turkey** — Trendyol fashion
4. China — only with strict QC

## Partner tiers
- **Tier A — Consumer forwarder** (Boxit4me-class): suite addresses, photos, assisted purchase optional
- **Tier B — Freight** (Zmzm/BBC-class): bulk/kg lanes, weaker consumer tooling
Prefer Tier A for launch; Tier B as capacity backup.

## Commercial terms to negotiate
- Per-kg rates by method + monthly minimums
- Handling per inbound parcel
- Free storage days + storage fees
- Photo included?
- Liability for loss/damage (cap + insurance)
- Claim window
- Payment terms (weekly, after scan-out preferred — minimize float theft risk)
- White-label / no customer poaching clause
- Banned goods list alignment
- SLA: scan within 24–48h of carrier delivery to hub

## Operational handshake (no API yet)
Daily:
1. Bridge exports CSV/JSON of expected inbounds + outbound batch requests
2. Partner uploads intake CSV + photo links
3. Bridge generates customer charges / releases
4. Partner posts outbound tracking
Migrate to API webhooks ASAP (`03` Partner API).

## Address format
```
Bridge c/o <Partner>
<Warehouse street>
Dubai, UAE
Suite: BRG-<userPublicId>
Phone: partner phone
```
Customer must put suite on every retailer checkout.

## Event schema (canonical)
```json
{
  "event_id": "uuid",
  "event_type": "received|weighed|departed|customs|delivered|exception",
  "order_id": "BRG-...",
  "occurred_at": "ISO-8601",
  "weight_kg": 1.2,
  "dimensions_cm": {"l":10,"w":10,"h":10},
  "tracking": "....",
  "photo_urls": ["..."],
  "notes": "..."
}
```

## Customs
- Partner or LB broker clears under agreed importer of record model (legal review required)
- Bridge stores commercial invoices, HS guesses, customer ID if required
- Restricted: batteries, aerosols, alcohol, pharma without permits, counterfeit, weapons, etc.

## Last mile
Options:
1. Partner delivers door-to-door nationwide
2. Partner to Beirut depot + Bridge courier network
3. Customer pickup points

COD cash chain must be contractually defined.

## Pilot safety
- 5–10 low-value test parcels before go-live
- Dual-partner capability before scaling spend
- Intake photos mandatory for claims
