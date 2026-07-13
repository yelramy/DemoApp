import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { addOrderEvent, getSessionUser, postLedger } from "@/lib/auth";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  const user = await getSessionUser();
  const { orderId } = await ctx.params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true },
  });
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (user && order.customerId !== user.id && order.payerId !== user.id && user.role === "CUSTOMER") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const payment =
    order.payments.find((p) => p.method === "CARD") ||
    (await prisma.paymentIntent.create({
      data: {
        orderId,
        method: "CARD",
        status: "PENDING",
        amountUsd: order.totalUsd,
        providerRef: `CARD-SIM-${order.publicId}`,
      },
    }));

  await prisma.paymentIntent.update({
    where: { id: payment.id },
    data: { status: "PAID", rawJson: JSON.stringify({ simulated: true, psp: "tap_sandbox" }) },
  });
  await prisma.order.update({ where: { id: orderId }, data: { status: "paid" } });
  await addOrderEvent(orderId, "paid", "Card sandbox payment confirmed (Tap-style).");
  await postLedger(orderId, "cash_card", 0, order.totalUsd, "Card sandbox");

  return NextResponse.json({ ok: true });
}
