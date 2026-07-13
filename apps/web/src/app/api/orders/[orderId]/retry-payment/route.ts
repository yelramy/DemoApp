import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { addOrderEvent, getSessionUser } from "@/lib/auth";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { orderId } = await ctx.params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: { orderBy: { createdAt: "desc" } } },
  });
  if (!order || (order.customerId !== user.id && order.payerId !== user.id && user.role === "CUSTOMER")) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const last = order.payments[0];
  if (!last || !["FAILED", "PENDING", "REQUIRES_ACTION"].includes(last.status)) {
    return NextResponse.json(
      { error: { message: "No failed/pending payment to retry" } },
      { status: 400 },
    );
  }

  const payment = await prisma.paymentIntent.create({
    data: {
      orderId: order.id,
      method: last.method,
      status: "PENDING",
      amountUsd: last.amountUsd,
      checkoutUrl: last.checkoutUrl,
      providerRef:
        last.method === "WHISH"
          ? `WHISH-RETRY-${order.publicId}-${Date.now()}`
          : last.method === "CARD"
            ? `CARD-RETRY-${order.publicId}-${Date.now()}`
            : null,
    },
  });
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "awaiting_payment" },
  });
  await addOrderEvent(order.id, "awaiting_payment", "Payment retry started");
  return NextResponse.json({ payment });
}
