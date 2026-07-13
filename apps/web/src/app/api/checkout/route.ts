import { NextResponse } from "next/server";
import { prisma, PaymentMethod } from "@bridge/db";
import { addOrderEvent, getSessionUser, publicOrderId } from "@/lib/auth";

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
  if (!addressId) {
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        fullName: body.fullName || user.name || "Customer",
        phone: body.phone || user.phone || "",
        city: body.city || "Beirut",
        area: body.area || "Beirut",
        street: body.street || "Address pending",
        building: body.building,
        notes: body.notes,
        isDefault: true,
      },
    });
    addressId = address.id;
  }

  const payload = JSON.parse(quote.payloadJson) as {
    parsed: { title: string; url: string; imageUrl?: string | null };
  };

  const partner = await prisma.partnerOrg.findFirst({ where: { active: true } });

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
      totalUsd: quote.total,
      itemTitle: payload.parsed.title,
      itemUrl: payload.parsed.url,
      itemImage: payload.parsed.imageUrl ?? null,
    },
  });

  await addOrderEvent(order.id, "awaiting_payment", "Order created. Awaiting payment.");

  const payment = await prisma.paymentIntent.create({
    data: {
      orderId: order.id,
      method,
      status: method === "COD" ? "REQUIRES_ACTION" : "PENDING",
      amountUsd: quote.total,
      checkoutUrl:
        method === "WHISH"
          ? `/app/checkout/${order.id}/whish`
          : method === "OMT"
            ? `/app/checkout/${order.id}/omt`
            : null,
      providerRef: method === "WHISH" ? `WHISH-SIM-${order.publicId}` : null,
    },
  });

  if (method === "COD") {
    // COD: mark paid-enough to enter buy queue with collection later
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "paid" },
    });
    await prisma.paymentIntent.update({
      where: { id: payment.id },
      data: { status: "REQUIRES_ACTION" },
    });
    await addOrderEvent(
      order.id,
      "paid",
      "COD selected. Order entered buy queue; cash collected on delivery.",
    );
  }

  return NextResponse.json({ orderId: order.id, publicId: order.publicId, payment });
}
