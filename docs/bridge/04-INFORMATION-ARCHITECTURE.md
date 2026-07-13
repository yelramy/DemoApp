# 04 — Information architecture

## Public
```
/
/how-it-works
/pricing
/allowed-items
/pay-for-family
/faq
/blog
/blog/[slug]
/legal/terms
/legal/privacy
/legal/refunds
/legal/prohibited
/contact
/login
/signup
```

## App (authenticated)
```
/app                      # home: paste link CTA + active orders
/app/quote/new            # paste / manual
/app/quote/[id]           # breakdown + confirm
/app/cart
/app/checkout
/app/checkout/split       # diaspora payer flow
/app/orders
/app/orders/[id]
/app/orders/[id]/claim
/app/suite                # ship-for-me addresses
/app/suite/expected
/app/wishlist
/app/family               # recipients + payers
/app/wallet               # credits / referral
/app/addresses
/app/settings
/app/support
/app/support/[ticketId]
```

## Admin
```
/admin
/admin/orders
/admin/orders/[id]
/admin/buy-queue
/admin/partners
/admin/partners/[id]
/admin/payments
/admin/reconciliation
/admin/claims
/admin/users
/admin/pricing
/admin/parsers
/admin/content
/admin/analytics
/admin/staff
/admin/flags
```

## Partner
```
/partner
/partner/inbound
/partner/batches
/partner/manifests
/partner/events
/partner/invoices
/partner/claims
/partner/settings
```

## Design constraints (UI)
- One job per screen; quote screen is sacred (total + breakdown + CTA)
- No dashboard clutter on first-time home — paste link is the hero action
- English UI; USD labels
- Mobile-first; WhatsApp share/pay links work in-app browsers
- Status colors consistent across app/admin/partner
