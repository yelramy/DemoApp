import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { parseManualItem, parseProductUrl } from "@bridge/parsers";
import { computeQuote, loadPricingConfig } from "@/lib/pricing";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const user = await getSessionUser();

  let parsed;
  if (body.manual?.title && body.manual?.priceUsd) {
    parsed = parseManualItem({
      title: body.manual.title,
      priceUsd: Number(body.manual.priceUsd),
      url: body.manual.url,
      estimatedWeightKg: body.manual.estimatedWeightKg,
    });
  } else if (body.url) {
    try {
      new URL(body.url);
    } catch {
      return NextResponse.json(
        { error: { code: "INVALID_URL", message: "Enter a valid product URL" } },
        { status: 400 },
      );
    }
    parsed = await parseProductUrl(body.url);
    if (parsed.priceUsd == null) {
      return NextResponse.json(
        {
          error: {
            code: "PRICE_MISSING",
            message:
              "Could not read the price. Use manual entry with the USD price.",
          },
          parsed,
        },
        { status: 422 },
      );
    }
  } else {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "URL or manual item required" } },
      { status: 400 },
    );
  }

  const config = await loadPricingConfig(parsed.hubHint);
  const breakdown = computeQuote(
    [
      {
        title: parsed.title,
        itemPriceUsd: parsed.priceUsd!,
        estimatedWeightKg: parsed.estimatedWeightKg,
      },
    ],
    config,
  );

  if (!breakdown.marginOk) {
    return NextResponse.json(
      {
        error: {
          code: "MARGIN_FLOOR",
          message: "This item can’t be fulfilled profitably yet. Try another hub or item.",
        },
      },
      { status: 422 },
    );
  }

  const quote = await prisma.quote.create({
    data: {
      userId: user?.id,
      hub: parsed.hubHint,
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
      payloadJson: JSON.stringify({ parsed, breakdown }),
    },
  });

  return NextResponse.json({ quoteId: quote.id, quote, parsed, breakdown });
}
