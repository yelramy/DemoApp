import { prisma } from "@bridge/db";

export async function isBannedTitle(title: string) {
  const bans = await prisma.bannedKeyword.findMany();
  const lower = title.toLowerCase();
  return bans.find((b) => lower.includes(b.keyword.toLowerCase())) ?? null;
}

export function codRiskAllowed(input: {
  riskScore: number;
  codFails: number;
  amountUsd: number;
  areaCodAllowed: boolean;
  areaMax: number;
}) {
  if (!input.areaCodAllowed) return { ok: false, reason: "COD not available in this area" };
  if (input.amountUsd > input.areaMax) {
    return { ok: false, reason: `COD max for area is $${input.areaMax}` };
  }
  if (input.codFails >= 2 || input.riskScore >= 0.7) {
    return { ok: false, reason: "COD blocked by risk score — use Whish" };
  }
  return { ok: true as const };
}

export async function applyPromo(code: string | undefined, subtotalService: number) {
  if (!code) return { discount: 0, promo: null as null };
  const promo = await prisma.promoCode.findUnique({ where: { code: code.toUpperCase() } });
  if (!promo || !promo.active) return { discount: 0, promo: null };
  if (promo.expiresAt && promo.expiresAt < new Date()) return { discount: 0, promo: null };
  if (promo.usedCount >= promo.maxUses) return { discount: 0, promo: null };
  const pct = promo.discountPct > 0 ? subtotalService * promo.discountPct : 0;
  const discount = Math.min(subtotalService, Math.max(promo.discountUsd, pct));
  return { discount: Math.round(discount * 100) / 100, promo };
}
