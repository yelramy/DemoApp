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
  const body = await req.json();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true },
  });
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const ref = String(body.reference || "").trim();
  if (!ref) {
    return NextResponse.json({ error: { message: "OMT reference required" } }, { status: 400 });
  }

  const payment =
    order.payments.find((p) => p.method === "OMT") ||
    (await prisma.paymentIntent.create({
      data: {
        orderId,
        method: "OMT",
        amountUsd: order.totalUsd,
        status: "PENDING",
        providerRef: ref,
      },
    }));

  // sandbox: any reference confirms
  await prisma.paymentIntent.update({
    where: { id: payment.id },
    data: {
      status: "PAID",
      providerRef: ref,
      rawJson: JSON.stringify({ omt: true, reference: ref }),
    },
  });
  await prisma.order.update({ where: { id: orderId }, data: { status: "paid" } });
  await addOrderEvent(orderId, "paid", `OMT reference ${ref} confirmed (sandbox)`);
  await postLedger(orderId, "cash_omt", 0, order.totalUsd, "OMT sandbox");
  await notifyUser(order.customerId, "payment_received", { order_id: order.publicId });
  return NextResponse.json({ ok: true });
}
