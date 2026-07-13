import { DEFAULT_UAE_AIR, computeQuote, type PricingConfig } from "@bridge/pricing";
import { prisma } from "@bridge/db";

export async function loadPricingConfig(hub = "UAE"): Promise<PricingConfig> {
  const rate = await prisma.rateCardConfig.findFirst({
    where: { hub, method: "air_express", active: true },
  });
  if (!rate) return DEFAULT_UAE_AIR;
  return {
    ...DEFAULT_UAE_AIR,
    rateCard: {
      hub: rate.hub as "UAE" | "US" | "TR",
      method: "air_express",
      pricePerKg: rate.pricePerKg,
      minCharge: rate.minCharge,
      handlingPerParcel: rate.handlingPerParcel,
      volumetricDivisor: rate.volumetricDivisor,
    },
  };
}

export { computeQuote };
