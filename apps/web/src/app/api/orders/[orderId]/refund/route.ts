import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { addOrderEvent, getSessionUser, notifyUser, postLedger } from "@/lib/auth";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OPS")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { orderId } = await ctx.params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true },
  });
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "refunded" },
  });
  await prisma.paymentIntent.updateMany({
    where: { orderId },
    data: { status: "REFUNDED" },
  });
  await addOrderEvent(orderId, "refunded", "Refund issued by ops");
  await postLedger(orderId, "refunds", order.totalUsd, 0, "Customer refund");
  await notifyUser(order.customerId, "refunded", {
    order_id: order.publicId,
    amount: order.totalUsd,
  });
  return NextResponse.json({ ok: true });
}
