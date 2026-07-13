# 06 — Pricing and margins

## Goals
- Customer sees **one all-in USD total** before pay
- Bridge protects **margin floor**
- Customs shown as estimate with disclosed variance policy

## Quote formula
```
item_subtotal        = sum(retail_price_converted_usd) + domestic_shipping_to_hub
buy_fee              = max(flat_min, pct * item_subtotal)   # e.g. max($6, 7%)
chargeable_kg        = max(actual_est_kg, volumetric_est_kg)
shipping             = chargeable_kg * rate_card[hub][method]  # ceil to 0.5kg
customs_estimate     = f(category_duty, vat, cif_basis, clearance_fee)
payment_fee          = payment_method_fee_buffer
discount             = promos + credits
total                = item + buy_fee + shipping + customs_estimate + payment_fee - discount
```

## Volumetric
`volumetric_kg = (L*W*H cm) / divisor`  
Default divisor config per carrier (e.g. 5000). Use higher of actual vs volumetric.

## Rate cards (config, not hardcoded)
Per hub: UAE, US, TR, CN…  
Per method: air_express, air_economy, sea  
Fields: `price_per_kg`, `min_charge`, `handling_per_parcel`, `fuel_surcharge_pct`

## Margin rules
```
expected_partner_cost = chargeable_kg * partner_rate + handling + buy_cost_extra
bridge_take           = buy_fee + (shipping - expected_partner_cost) + payment_fee - payment_processor_cost
assert bridge_take >= margin_floor_usd AND bridge_take/item_service_portion >= margin_floor_pct
```
If floor fails → block checkout or bump shipping (show honest total).

## Target economics
- Gross on service layer (fees+shipping markup): **15–25%**
- Net after support/COD loss: **5–12%** early; improve with Whish-prepay mix

## Weight adjustment policy (must be in UX + Terms)
- If final hub weight ≤ quote weight + tolerance (e.g. 10% or 0.2kg): no extra charge
- If above tolerance: customer pays difference via Whish before outbound OR cancel+return policy
- If below: optional credit (config)

## Customs variance policy
- Show estimate range when uncertain
- If Bridge “duties included” product: Bridge eats small overage up to cap; large overage → customer option
- If “duties on delivery”: collect at door / before release — disclosed

## Promo engine
- Percentage or fixed off service fees (not item) preferred
- Referral credit wallet
- First-order shipping discount capped

## Manual override
Admin can override quote components with mandatory reason code (audit).
