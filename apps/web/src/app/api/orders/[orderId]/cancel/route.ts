import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { addOrderEvent, getSessionUser, notifyUser, postLedger } from "@/lib/auth";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { orderId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (order.customerId !== user.id && user.role === "CUSTOMER") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const cancellable = ["awaiting_payment", "paid", "buy_in_progress"];
  if (!cancellable.includes(order.status)) {
    return NextResponse.json(
      { error: { message: "Too late to cancel — contact support" } },
      { status: 400 },
    );
  }

  const refund = ["paid", "buy_in_progress"].includes(order.status);
  await prisma.order.update({
    where: { id: orderId },
    data: { status: refund ? "refunded" : "cancelled" },
  });
  if (refund) {
    await prisma.paymentIntent.updateMany({
      where: { orderId },
      data: { status: "REFUNDED" },
    });
    await postLedger(orderId, "refunds", order.totalUsd, 0, "Cancel refund");
    // wallet credit option
    if (body.toWallet) {
      await prisma.wallet.upsert({
        where: { userId: order.customerId },
        update: { balanceUsd: { increment: order.totalUsd } },
        create: { userId: order.customerId, balanceUsd: order.totalUsd },
      });
    }
  }
  await addOrderEvent(
    orderId,
    refund ? "refunded" : "cancelled",
    body.reason || "Cancelled by customer/ops",
  );
  await notifyUser(order.customerId, "cancelled", { order_id: order.publicId });
  return NextResponse.json({ ok: true, refunded: refund });
}
