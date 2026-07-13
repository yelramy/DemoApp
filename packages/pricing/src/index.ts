export type HubCode = "UAE" | "US" | "TR";
export type ShipMethod = "air_express" | "air_economy" | "sea";

export interface RateCard {
  hub: HubCode;
  method: ShipMethod;
  pricePerKg: number;
  minCharge: number;
  handlingPerParcel: number;
  volumetricDivisor: number;
}

export interface QuoteLineInput {
  title: string;
  itemPriceUsd: number;
  domesticShippingUsd?: number;
  estimatedWeightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  category?: string;
  quantity?: number;
}

export interface PricingConfig {
  buyFeeFlatMin: number;
  buyFeePct: number;
  customsDutyPct: number;
  customsVatPct: number;
  clearanceFeeUsd: number;
  paymentFeePct: number;
  marginFloorUsd: number;
  marginFloorPct: number;
  weightTolerancePct: number;
  rateCard: RateCard;
}

export interface QuoteBreakdown {
  itemSubtotal: number;
  buyFee: number;
  chargeableKg: number;
  shipping: number;
  customsEstimate: number;
  paymentFee: number;
  discount: number;
  total: number;
  bridgeTake: number;
  marginOk: boolean;
  lines: Array<{
    title: string;
    lineTotal: number;
    chargeableKg: number;
  }>;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function ceilToHalfKg(kg: number) {
  return Math.ceil(kg * 2) / 2;
}

export function volumetricKg(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  divisor: number,
) {
  return (lengthCm * widthCm * heightCm) / divisor;
}

export function chargeableWeightKg(input: {
  estimatedWeightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  divisor: number;
}) {
  const actual = Math.max(0.1, input.estimatedWeightKg);
  if (
    input.lengthCm &&
    input.widthCm &&
    input.heightCm &&
    input.divisor > 0
  ) {
    const vol = volumetricKg(
      input.lengthCm,
      input.widthCm,
      input.heightCm,
      input.divisor,
    );
    return ceilToHalfKg(Math.max(actual, vol));
  }
  return ceilToHalfKg(actual);
}

export function computeQuote(
  lines: QuoteLineInput[],
  config: PricingConfig,
  discountUsd = 0,
): QuoteBreakdown {
  const pricedLines = lines.map((line) => {
    const qty = line.quantity ?? 1;
    const item = (line.itemPriceUsd + (line.domesticShippingUsd ?? 0)) * qty;
    const kg = chargeableWeightKg({
      estimatedWeightKg: line.estimatedWeightKg * qty,
      lengthCm: line.lengthCm,
      widthCm: line.widthCm,
      heightCm: line.heightCm,
      divisor: config.rateCard.volumetricDivisor,
    });
    return { title: line.title, lineTotal: round2(item), chargeableKg: kg };
  });

  const itemSubtotal = round2(
    pricedLines.reduce((s, l) => s + l.lineTotal, 0),
  );
  const chargeableKg = ceilToHalfKg(
    pricedLines.reduce((s, l) => s + l.chargeableKg, 0),
  );

  const buyFee = round2(
    Math.max(config.buyFeeFlatMin, itemSubtotal * config.buyFeePct),
  );

  const shippingRaw =
    chargeableKg * config.rateCard.pricePerKg +
    config.rateCard.handlingPerParcel;
  const shipping = round2(Math.max(config.rateCard.minCharge, shippingRaw));

  const cif = itemSubtotal + shipping;
  const customsEstimate = round2(
    cif * (config.customsDutyPct + config.customsVatPct) +
      config.clearanceFeeUsd,
  );

  const prePay = itemSubtotal + buyFee + shipping + customsEstimate;
  const paymentFee = round2(prePay * config.paymentFeePct);
  const discount = round2(Math.min(discountUsd, prePay + paymentFee));
  const total = round2(prePay + paymentFee - discount);

  const partnerShippingCost =
    chargeableKg * (config.rateCard.pricePerKg * 0.65) +
    config.rateCard.handlingPerParcel * 0.5;
  const bridgeTake = round2(
    buyFee + (shipping - partnerShippingCost) + paymentFee,
  );
  const servicePortion = buyFee + shipping + paymentFee;
  const marginOk =
    bridgeTake >= config.marginFloorUsd &&
    (servicePortion === 0 ||
      bridgeTake / servicePortion >= config.marginFloorPct);

  return {
    itemSubtotal,
    buyFee,
    chargeableKg,
    shipping,
    customsEstimate,
    paymentFee,
    discount,
    total,
    bridgeTake,
    marginOk,
    lines: pricedLines,
  };
}

export const DEFAULT_UAE_AIR: PricingConfig = {
  buyFeeFlatMin: 6,
  buyFeePct: 0.07,
  customsDutyPct: 0.1,
  customsVatPct: 0.11,
  clearanceFeeUsd: 3,
  paymentFeePct: 0.015,
  marginFloorUsd: 4,
  marginFloorPct: 0.12,
  weightTolerancePct: 0.1,
  rateCard: {
    hub: "UAE",
    method: "air_express",
    pricePerKg: 12,
    minCharge: 15,
    handlingPerParcel: 3,
    volumetricDivisor: 5000,
  },
};
