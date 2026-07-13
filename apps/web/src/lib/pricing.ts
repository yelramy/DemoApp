import { DEFAULT_UAE_AIR, computeQuote, type PricingConfig } from "@bridge/pricing";
import { prisma } from "@bridge/db";

export async function loadPricingConfig(
  hub = "UAE",
  category?: string,
): Promise<PricingConfig> {
  const rate = await prisma.rateCardConfig.findFirst({
    where: { hub, method: "air_express", active: true },
  });
  const duty = category
    ? await prisma.categoryDuty.findUnique({ where: { category } })
    : null;

  if (duty && !duty.allowed) {
    throw new Error(`CATEGORY_BLOCKED:${category}`);
  }

  const base = rate
    ? {
        ...DEFAULT_UAE_AIR,
        rateCard: {
          hub: rate.hub as "UAE" | "US" | "TR",
          method: "air_express" as const,
          pricePerKg: rate.pricePerKg,
          minCharge: rate.minCharge,
          handlingPerParcel: rate.handlingPerParcel,
          volumetricDivisor: rate.volumetricDivisor,
        },
      }
    : { ...DEFAULT_UAE_AIR };

  if (duty) {
    base.customsDutyPct = duty.dutyPct;
    base.customsVatPct = duty.vatPct;
  }
  return base;
}

export async function applyFxToUsd(amount: number, currency: string) {
  if (!currency || currency === "USD") return amount;
  const fx = await prisma.fxBuffer.findUnique({ where: { currency } });
  if (!fx) return amount;
  return Math.round(amount * fx.toUsd * (1 + fx.bufferPct) * 100) / 100;
}

export { computeQuote };
