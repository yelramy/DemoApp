import { NextResponse } from "next/server";
import { computeQuote, loadPricingConfig } from "@/lib/pricing";
import type { HubCode } from "@bridge/pricing";

export async function POST(req: Request) {
  const body = await req.json();
  const title = body.title || "Item";
  const priceUsd = Number(body.priceUsd || 40);
  const weight = Number(body.estimatedWeightKg || 0.8);
  const hubs: HubCode[] = ["UAE", "US", "TR"];
  const comparisons = [];
  for (const hub of hubs) {
    const config = await loadPricingConfig(hub);
    const eta =
      hub === "UAE" ? [8, 16] : hub === "TR" ? [10, 18] : [12, 24];
    const q = computeQuote(
      [{ title, itemPriceUsd: priceUsd, estimatedWeightKg: weight }],
      config,
    );
    comparisons.push({
      hub,
      total: q.total,
      shipping: q.shipping,
      chargeableKg: q.chargeableKg,
      etaDaysMin: eta[0],
      etaDaysMax: eta[1],
    });
  }
  comparisons.sort((a, b) => a.total - b.total);
  return NextResponse.json({
    recommended: comparisons[0],
    comparisons,
  });
}
