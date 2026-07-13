import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { addOrderEvent, postLedger } from "@/lib/auth";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const link = await prisma.payLink.findUnique({
    where: { token },
    include: { order: true },
  });
  if (!link || link.expiresAt < new Date()) {
    return NextResponse.json({ error: "expired" }, { status: 404 });
  }
  return NextResponse.json({ link, order: link.order });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ token: string }> },
) {
  const { token } = await ctx.params;
  const body = await req.json();
  const link = await prisma.payLink.findUnique({
    where: { token },
    include: { order: { include: { payments: true } } },
  });
  if (!link || link.expiresAt < new Date() || link.status !== "open") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const method = (body.method || "CARD").toUpperCase();
  await prisma.paymentIntent.create({
    data: {
      orderId: link.orderId,
      method: method === "WHISH" ? "WHISH" : "CARD",
      status: "PAID",
      amountUsd: link.order.totalUsd,
      providerRef: `${method}-SIM-${link.order.publicId}`,
      rawJson: JSON.stringify({ diaspora: true, simulated: true }),
    },
  });
  await prisma.order.update({
    where: { id: link.orderId },
    data: { status: "paid", paymentMethod: method === "WHISH" ? "WHISH" : "CARD" },
  });
  await prisma.payLink.update({
    where: { id: link.id },
    data: { status: "paid" },
  });
  await addOrderEvent(link.orderId, "paid", `Diaspora paid via ${method} sandbox`);
  await postLedger(link.orderId, "cash_card", 0, link.order.totalUsd, "Diaspora pay");

  return NextResponse.json({ ok: true, orderId: link.orderId });
}
