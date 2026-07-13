import { NextResponse } from "next/server";
import { prisma, PaymentMethod } from "@bridge/db";
import {
  addOrderEvent,
  getSessionUser,
  notifyUser,
  postLedger,
  publicOrderId,
} from "@/lib/auth";
import { codRiskAllowed } from "@/lib/risk";

function etaForHub(hub: string): [number, number] {
  if (hub === "UAE") return [8, 16];
  if (hub === "TR") return [10, 18];
  if (hub === "CN") return [14, 28];
  return [12, 24];
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Log in first" } },
      { status: 401 },
    );
  }

  const body = await req.json();
  const quote = await prisma.quote.findUnique({ where: { id: body.quoteId } });
  if (!quote || quote.expiresAt < new Date()) {
    return NextResponse.json(
      { error: { code: "QUOTE_EXPIRED", message: "Quote expired. Refresh it." } },
      { status: 400 },
    );
  }

  const method = String(body.paymentMethod || "WHISH").toUpperCase() as PaymentMethod;
  if (!["WHISH", "COD", "OMT", "CARD"].includes(method)) {
    return NextResponse.json(
      { error: { code: "BAD_METHOD", message: "Unsupported payment method" } },
      { status: 400 },
    );
  }

  let addressId = body.addressId as string | undefined;
  let city = body.city || "Beirut";
  let area = body.area || "Beirut";

  if (addressId) {
    const existing = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: { code: "BAD_ADDRESS", message: "Address not found" } },
        { status: 400 },
      );
    }
    city = existing.city;
    area = existing.area;
  } else {
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        fullName: body.fullName || user.name || "Customer",
        phone: body.phone || user.phone || "",
        city,
        area,
        street: body.street || "Address pending",
        building: body.building,
        notes: body.notes,
        isDefault: true,
      },
    });
    addressId = address.id;
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  const useWallet = Boolean(body.useWalletCredit);
  const walletCredit = useWallet
    ? Math.min(wallet?.balanceUsd ?? 0, quote.total)
    : 0;
  const chargeTotal = Math.round((quote.total - walletCredit) * 100) / 100;

  let depositUsd = 0;
  if (method === "COD") {
    const deliveryArea = await prisma.deliveryArea.findFirst({
      where: { city, area, active: true },
    });
    const gate = codRiskAllowed({
      riskScore: user.riskScore,
      codFails: user.codFails,
      amountUsd: chargeTotal,
      areaCodAllowed: deliveryArea?.codAllowed ?? true,
      areaMax: deliveryArea?.codMaxUsd ?? 200,
    });
    if (!gate.ok) {
      return NextResponse.json(
        { error: { code: "COD_BLOCKED", message: gate.reason } },
        { status: 422 },
      );
    }
    // partial prepay deposit for COD over $100
    if (chargeTotal > 100) {
      depositUsd = Math.round(chargeTotal * 0.2 * 100) / 100;
    }
  }

  const payload = JSON.parse(quote.payloadJson) as {
    parsed: {
      title: string;
      url: string;
      imageUrl?: string | null;
      variantLabel?: string;
      screenshotUrl?: string;
    };
  };

  const partner = await prisma.partnerOrg.findFirst({
    where: { active: true, hub: quote.hub },
  });
  const [etaMin, etaMax] = etaForHub(quote.hub);

  const order = await prisma.order.create({
    data: {
      publicId: publicOrderId(),
      status: "awaiting_payment",
      customerId: user.id,
      payerId: body.payerId || user.id,
      addressId,
      quoteId: quote.id,
      partnerId: partner?.id,
      paymentMethod: method,
      totalUsd: chargeTotal,
      itemTitle: payload.parsed.title,
      itemUrl: payload.parsed.url,
      itemImage: payload.parsed.imageUrl ?? null,
      quotedWeightKg: quote.chargeableKg,
      giftNote: body.giftNote ?? null,
      tipUsd: Number(body.tipUsd || 0),
      depositUsd,
      walletCreditApplied: walletCredit,
      variantLabel: body.variantLabel || payload.parsed.variantLabel || null,
      screenshotUrl: body.screenshotUrl || payload.parsed.screenshotUrl || null,
      etaDaysMin: etaMin,
      etaDaysMax: etaMax,
    },
  });

  if (walletCredit > 0) {
    await prisma.wallet.update({
      where: { userId: user.id },
      data: { balanceUsd: { decrement: walletCredit } },
    });
    await postLedger(order.id, "wallet", walletCredit, 0, "Wallet credit applied");
  }

  await addOrderEvent(order.id, "awaiting_payment", "Order created. Awaiting payment.");
  await notifyUser(user.id, "quote_ready", {
    order_id: order.publicId,
    total_usd: order.totalUsd,
  });

  if (quote.promoCode) {
    await prisma.promoCode.update({
      where: { code: quote.promoCode },
      data: { usedCount: { increment: 1 } },
    });
  }

  // first-order auto promo tracking
  const prior = await prisma.order.count({
    where: { customerId: user.id, id: { not: order.id } },
  });
  if (prior === 0 && !quote.promoCode) {
    await addOrderEvent(order.id, "awaiting_payment", "First-order customer");
  }

  const payment = await prisma.paymentIntent.create({
    data: {
      orderId: order.id,
      method,
      status: method === "COD" ? "REQUIRES_ACTION" : "PENDING",
      amountUsd: method === "COD" && depositUsd > 0 ? depositUsd : chargeTotal + Number(body.tipUsd || 0),
      checkoutUrl:
        method === "WHISH"
          ? `/app/checkout/${order.id}/whish`
          : method === "OMT"
            ? `/app/checkout/${order.id}/omt`
            : method === "CARD"
              ? `/app/pay/${order.id}/card`
              : null,
      providerRef:
        method === "WHISH"
          ? `WHISH-SIM-${order.publicId}`
          : method === "CARD"
            ? `CARD-SIM-${order.publicId}`
            : null,
    },
  });

  if (method === "COD" && depositUsd === 0) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "paid" } });
    await addOrderEvent(
      order.id,
      "paid",
      "COD selected. Order entered buy queue; cash collected on delivery.",
    );
    await postLedger(order.id, "cash_cod", 0, chargeTotal, "COD pledged");
  }

  if (body.createPayLink) {
    const token = `pay_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    await prisma.payLink.create({
      data: {
        token,
        orderId: order.id,
        payerEmail: body.payerEmail,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    return NextResponse.json({
      orderId: order.id,
      publicId: order.publicId,
      payment,
      payLink: `/pay/${token}`,
      depositUsd,
      walletCredit,
    });
  }

  return NextResponse.json({
    orderId: order.id,
    publicId: order.publicId,
    payment,
    depositUsd,
    walletCredit,
  });
}
