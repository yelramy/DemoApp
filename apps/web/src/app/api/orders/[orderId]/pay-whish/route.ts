import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { addOrderEvent, getSessionUser } from "@/lib/auth";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { orderId } = await ctx.params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true },
  });
  const isOwner = order && (order.customerId === user.id || order.payerId === user.id);
  const isStaff = user.role === "ADMIN" || user.role === "OPS";
  if (!order || (!isOwner && !isStaff)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const payment = order.payments.find((p) => p.method === "WHISH");
  if (!payment?.providerRef) {
    return NextResponse.json({ error: "no_whish_intent" }, { status: 400 });
  }

  // Simulate Whish success by calling webhook handler logic inline
  await prisma.paymentIntent.update({
    where: { id: payment.id },
    data: { status: "PAID", rawJson: JSON.stringify({ simulated: true }) },
  });
  await prisma.order.update({
    where: { id: order.id },
    data: { status: "paid" },
  });
  await addOrderEvent(order.id, "paid", "Whish sandbox payment confirmed.");

  return NextResponse.json({ ok: true });
}
