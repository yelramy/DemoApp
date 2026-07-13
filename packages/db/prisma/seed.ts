import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function code(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function main() {
  const flags = [
    { key: "whish_payments", enabled: true, note: "Sandbox simulated" },
    { key: "cod_payments", enabled: true, note: null },
    { key: "diaspora_split_pay", enabled: true, note: null },
    { key: "browser_extension", enabled: true, note: "Bookmarklet + guide" },
    { key: "card_payments", enabled: true, note: "Sandbox card" },
    { key: "abandoned_quote_nudge", enabled: true, note: null },
  ];
  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: { enabled: flag.enabled, note: flag.note },
      create: flag,
    });
  }

  for (const rate of [
    { hub: "UAE", method: "air_express", pricePerKg: 12, minCharge: 15, handlingPerParcel: 3, volumetricDivisor: 5000 },
    { hub: "US", method: "air_express", pricePerKg: 18, minCharge: 22, handlingPerParcel: 4, volumetricDivisor: 5000 },
    { hub: "TR", method: "air_express", pricePerKg: 11, minCharge: 14, handlingPerParcel: 3, volumetricDivisor: 5000 },
    { hub: "CN", method: "air_economy", pricePerKg: 9, minCharge: 12, handlingPerParcel: 2.5, volumetricDivisor: 5000 },
  ]) {
    const existing = await prisma.rateCardConfig.findFirst({
      where: { hub: rate.hub, method: rate.method },
    });
    if (existing) await prisma.rateCardConfig.update({ where: { id: existing.id }, data: rate });
    else await prisma.rateCardConfig.create({ data: rate });
  }

  await prisma.partnerOrg.upsert({
    where: { apiKey: "partner-demo-key" },
    update: {
      name: "Demo UAE Hub",
      hub: "UAE",
      active: true,
      loginEmail: "uae@partner.bridge",
      loginCode: "246810",
    },
    create: {
      name: "Demo UAE Hub",
      hub: "UAE",
      contact: "ops@demo-hub.ae",
      apiKey: "partner-demo-key",
      loginEmail: "uae@partner.bridge",
      loginCode: "246810",
    },
  });

  await prisma.partnerOrg.upsert({
    where: { apiKey: "partner-us-demo-key" },
    update: {
      name: "Demo US Hub",
      hub: "US",
      active: true,
      loginEmail: "us@partner.bridge",
      loginCode: "246810",
    },
    create: {
      name: "Demo US Hub",
      hub: "US",
      contact: "ops@demo-hub.us",
      apiKey: "partner-us-demo-key",
      loginEmail: "us@partner.bridge",
      loginCode: "246810",
    },
  });

  for (const kw of ["weapon", "ammunition", "counterfeit", "cannabis", "vape liquid"]) {
    await prisma.bannedKeyword.upsert({
      where: { keyword: kw },
      update: {},
      create: { keyword: kw, severity: "block", note: "Airline/customs ban" },
    });
  }

  for (const area of [
    { city: "Beirut", area: "Achrafieh", codAllowed: true, codMaxUsd: 300 },
    { city: "Beirut", area: "Hamra", codAllowed: true, codMaxUsd: 300 },
    { city: "Tripoli", area: "Center", codAllowed: true, codMaxUsd: 200 },
    { city: "Saida", area: "Center", codAllowed: true, codMaxUsd: 150 },
  ]) {
    const existing = await prisma.deliveryArea.findFirst({
      where: { city: area.city, area: area.area },
    });
    if (!existing) await prisma.deliveryArea.create({ data: area });
  }

  await prisma.promoCode.upsert({
    where: { code: "BRIDGE10" },
    update: { discountUsd: 10, active: true },
    create: {
      code: "BRIDGE10",
      discountUsd: 10,
      maxUses: 1000,
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@bridge.lb" },
    update: { role: "ADMIN" },
    create: {
      email: "admin@bridge.lb",
      name: "Bridge Admin",
      role: "ADMIN",
      phone: "+96170000001",
      suiteCode: code("BRG"),
      referralCode: code("REF"),
    },
  });

  const customer = await prisma.user.findUnique({ where: { phone: "+96170123456" } });
  if (!customer) {
    await prisma.user.create({
      data: {
        phone: "+96170123456",
        name: "Maya Khoury",
        role: "CUSTOMER",
        email: "maya@example.com",
        suiteCode: code("BRG"),
        referralCode: code("REF"),
        addresses: {
          create: {
            label: "Home",
            fullName: "Maya Khoury",
            phone: "+96170123456",
            city: "Beirut",
            area: "Achrafieh",
            street: "Main St",
            building: "Bldg 12",
            isDefault: true,
          },
        },
        wallet: { create: { balanceUsd: 5 } },
      },
    });
  }

  const catalog = [
    {
      slug: "vitamin-c-serum",
      title: "Brightening Vitamin C Serum",
      description: "Popular beauty staple with locked UAE landed price.",
      category: "beauty",
      hub: "UAE",
      landedPriceUsd: 48,
      weightKg: 0.4,
      sourceUrl: "https://www.noon.com/",
    },
    {
      slug: "omega-3-softgels",
      title: "Omega-3 Softgels 120ct",
      description: "Supplement restock with transparent all-in pricing.",
      category: "supplements",
      hub: "US",
      landedPriceUsd: 62,
      weightKg: 0.6,
      sourceUrl: "https://www.iherb.com/",
    },
    {
      slug: "everyday-sneakers",
      title: "Everyday Knit Sneakers",
      description: "Fashion soft goods from UAE hub.",
      category: "fashion",
      hub: "UAE",
      landedPriceUsd: 89,
      weightKg: 1.1,
      sourceUrl: "https://www.amazon.ae/",
    },
  ];
  for (const p of catalog) {
    await prisma.catalogProduct.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  const posts = [
    {
      slug: "ship-amazon-to-lebanon",
      title: "How to shop Amazon for Lebanon without a US card",
      excerpt: "Use Bridge for all-in USD quotes and Whish checkout.",
      body: "Lebanese cards often fail on foreign sites. Bridge buys through partner hubs, shows customs estimates, and lets you pay with Whish or COD.",
    },
    {
      slug: "whish-international-shopping",
      title: "Pay with Whish for international shopping",
      excerpt: "Local rails for global products.",
      body: "Whish is Bridge’s primary rail. After you confirm an all-in quote, sandbox (and later live) Whish payment releases the buy queue.",
    },
  ];
  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  for (const macro of [
    { title: "Where is my order?", body: "Open your order page for the live timeline. Typical UAE→Lebanon is 10–21 days." },
    { title: "Customs hold", body: "Customs sometimes needs a clearer invoice. Reply with ID if requested and we’ll unblock." },
    { title: "Refund ETA", body: "Approved refunds post back to Whish/card within 1–3 business days in sandbox/live rails." },
  ]) {
    const existing = await prisma.supportMacro.findFirst({ where: { title: macro.title } });
    if (!existing) await prisma.supportMacro.create({ data: macro });
  }

  for (const duty of [
    { category: "beauty", dutyPct: 0.1, allowed: true },
    { category: "supplements", dutyPct: 0.05, allowed: true },
    { category: "fashion", dutyPct: 0.15, allowed: true },
    { category: "electronics", dutyPct: 0.2, allowed: true },
    { category: "weapons", dutyPct: 1, allowed: false },
  ]) {
    await prisma.categoryDuty.upsert({
      where: { category: duty.category },
      update: duty,
      create: duty,
    });
  }

  for (const fx of [
    { currency: "AED", toUsd: 0.27, bufferPct: 0.02 },
    { currency: "EUR", toUsd: 1.08, bufferPct: 0.02 },
    { currency: "TRY", toUsd: 0.03, bufferPct: 0.03 },
  ]) {
    await prisma.fxBuffer.upsert({
      where: { currency: fx.currency },
      update: fx,
      create: fx,
    });
  }

  await prisma.affiliateLink.upsert({
    where: { code: "CREATOR1" },
    update: { active: true, creditUsd: 7 },
    create: { code: "CREATOR1", label: "Creator pilot", creditUsd: 7 },
  });

  console.log("Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
