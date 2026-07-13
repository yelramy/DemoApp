import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function suiteCode() {
  return `BRG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function main() {
  const flags = [
    { key: "whish_payments", enabled: true, note: "Sandbox simulated" },
    { key: "cod_payments", enabled: true, note: null },
    { key: "diaspora_split_pay", enabled: true, note: null },
    { key: "browser_extension", enabled: false, note: null },
  ];
  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: { enabled: flag.enabled, note: flag.note },
      create: flag,
    });
  }

  const rates = [
    {
      hub: "UAE",
      method: "air_express",
      pricePerKg: 12,
      minCharge: 15,
      handlingPerParcel: 3,
      volumetricDivisor: 5000,
    },
    {
      hub: "US",
      method: "air_express",
      pricePerKg: 18,
      minCharge: 22,
      handlingPerParcel: 4,
      volumetricDivisor: 5000,
    },
  ];
  for (const rate of rates) {
    const existing = await prisma.rateCardConfig.findFirst({
      where: { hub: rate.hub, method: rate.method },
    });
    if (existing) {
      await prisma.rateCardConfig.update({
        where: { id: existing.id },
        data: rate,
      });
    } else {
      await prisma.rateCardConfig.create({ data: rate });
    }
  }

  const partner = await prisma.partnerOrg.upsert({
    where: { apiKey: "partner-demo-key" },
    update: { name: "Demo UAE Hub", active: true },
    create: {
      name: "Demo UAE Hub",
      hub: "UAE",
      contact: "ops@demo-hub.ae",
      apiKey: "partner-demo-key",
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
      suiteCode: suiteCode(),
    },
  });

  const existingCustomer = await prisma.user.findUnique({
    where: { phone: "+96170123456" },
  });
  if (!existingCustomer) {
    await prisma.user.create({
      data: {
        phone: "+96170123456",
        name: "Maya Khoury",
        role: "CUSTOMER",
        email: "maya@example.com",
        suiteCode: suiteCode(),
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
        wallet: { create: { balanceUsd: 0 } },
      },
    });
  }

  console.log("Seeded partner", partner.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
