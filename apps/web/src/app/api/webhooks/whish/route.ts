import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { prisma } from "@bridge/db";
import { addOrderEvent } from "@/lib/auth";

function secretMatches(provided: string | null, expected: string | undefined) {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  const body = await req.json();
  const expected =
    process.env.WHISH_WEBHOOK_SECRET ??
    (process.env.NODE_ENV !== "production" ? "dev-whish-secret" : undefined);
  if (!secretMatches(req.headers.get("x-whish-secret"), expected)) {
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
