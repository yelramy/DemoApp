import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { addOrderEvent } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const secret = req.headers.get("x-whish-secret");
  if (secret !== (process.env.WHISH_WEBHOOK_SECRET ?? "dev-whish-secret")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const providerRef = String(body.providerRef || "");
  const payment = await prisma.paymentIntent.findFirst({
    where: { providerRef },
    include: { order: true },
  });
  if (!payment) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (payment.status === "PAID") {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  await prisma.paymentIntent.update({
    where: { id: payment.id },
    data: { status: "PAID", rawJson: JSON.stringify(body) },
  });
  await prisma.order.update({
    where: { id: payment.orderId },
    data: { status: "paid" },
  });
  await addOrderEvent(payment.orderId, "paid", "Whish payment confirmed.");

  return NextResponse.json({ ok: true });
}
