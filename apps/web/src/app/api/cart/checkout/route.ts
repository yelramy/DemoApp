import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";
import { computeQuote, loadPricingConfig } from "@/lib/pricing";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const items = await prisma.cartItem.findMany({ where: { userId: user.id } });
  if (!items.length) {
    return NextResponse.json({ error: { message: "Cart empty" } }, { status: 400 });
  }

  const hub = body.hub || items[0].hub || "UAE";
  const config = await loadPricingConfig(hub);
  const breakdown = computeQuote(
    items.map((i) => ({
      title: i.title,
      itemPriceUsd: i.priceUsd,
      estimatedWeightKg: i.estimatedWeightKg,
      quantity: i.quantity,
    })),
    config,
  );

  const quote = await prisma.quote.create({
    data: {
      userId: user.id,
      hub,
      method: "air_express",
      itemSubtotal: breakdown.itemSubtotal,
      buyFee: breakdown.buyFee,
      chargeableKg: breakdown.chargeableKg,
      shipping: breakdown.shipping,
      customsEstimate: breakdown.customsEstimate,
      paymentFee: breakdown.paymentFee,
      discount: breakdown.discount,
      total: breakdown.total,
      bridgeTake: breakdown.bridgeTake,
      marginOk: breakdown.marginOk,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      payloadJson: JSON.stringify({
        parsed: {
          title: items.map((i) => i.title).join(" + "),
          url: items[0].url,
          imageUrl: items[0].imageUrl,
          store: "cart",
          hubHint: hub,
          confidence: 1,
          priceUsd: breakdown.itemSubtotal,
          estimatedWeightKg: breakdown.chargeableKg,
        },
        breakdown,
        cartItemIds: items.map((i) => i.id),
      }),
    },
  });

  return NextResponse.json({ quoteId: quote.id });
}
