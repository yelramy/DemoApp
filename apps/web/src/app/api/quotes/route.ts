import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { parseManualItem, parseProductUrl } from "@bridge/parsers";
import { computeQuote, loadPricingConfig } from "@/lib/pricing";
import { getSessionUser } from "@/lib/auth";
import { applyPromo, isBannedTitle } from "@/lib/risk";

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
  } else if (body.catalogSlug) {
    const product = await prisma.catalogProduct.findUnique({
      where: { slug: body.catalogSlug },
    });
    if (!product || !product.active) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Catalog item not found" } },
        { status: 404 },
      );
    }
    // Locked landed price path: synthesize quote totaling landedPriceUsd
    const quote = await prisma.quote.create({
      data: {
        userId: user?.id,
        hub: product.hub,
        method: "air_express",
        itemSubtotal: product.landedPriceUsd * 0.55,
        buyFee: 6,
        chargeableKg: product.weightKg,
        shipping: product.landedPriceUsd * 0.25,
        customsEstimate: product.landedPriceUsd * 0.15,
        paymentFee: Math.round(product.landedPriceUsd * 0.015 * 100) / 100,
        discount: 0,
        total: product.landedPriceUsd,
        bridgeTake: 8,
        marginOk: true,
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        payloadJson: JSON.stringify({
          parsed: {
            url: product.sourceUrl ?? `catalog://${product.slug}`,
            store: "catalog",
            title: product.title,
            priceUsd: product.landedPriceUsd * 0.55,
            imageUrl: product.imageUrl,
            estimatedWeightKg: product.weightKg,
            confidence: 1,
            hubHint: product.hub,
          },
          catalog: product,
        }),
      },
    });
    return NextResponse.json({ quoteId: quote.id, quote });
  } else {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "URL or manual item required" } },
      { status: 400 },
    );
  }

  const banned = await isBannedTitle(parsed.title);
  if (banned) {
    return NextResponse.json(
      {
        error: {
          code: "BANNED_ITEM",
          message: `Item blocked (${banned.keyword}). See prohibited list.`,
        },
      },
      { status: 422 },
    );
  }

  const hub = (body.hub as string) || parsed.hubHint;
  const config = await loadPricingConfig(hub);
  const provisional = computeQuote(
    [
      {
        title: parsed.title,
        itemPriceUsd: parsed.priceUsd!,
        estimatedWeightKg: parsed.estimatedWeightKg,
      },
    ],
    config,
  );
  const { discount, promo } = await applyPromo(
    body.promoCode,
    provisional.buyFee + provisional.shipping,
  );
  const breakdown = computeQuote(
    [
      {
        title: parsed.title,
        itemPriceUsd: parsed.priceUsd!,
        estimatedWeightKg: parsed.estimatedWeightKg,
      },
    ],
    config,
    discount,
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
      promoCode: promo?.code,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      payloadJson: JSON.stringify({ parsed, breakdown }),
    },
  });

  return NextResponse.json({ quoteId: quote.id, quote, parsed, breakdown });
}
