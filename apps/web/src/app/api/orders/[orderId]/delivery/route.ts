import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { addOrderEvent, getSessionUser } from "@/lib/auth";

function otp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  const user = await getSessionUser();
  const { orderId } = await ctx.params;
  const body = await req.json();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (body.action === "generate") {
    if (!user || (user.role !== "ADMIN" && user.role !== "OPS" && user.role !== "PARTNER")) {
      // allow partner via api key alternative - for now staff only
      if (!user || user.role === "CUSTOMER") {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
    }
    const code = otp();
    await prisma.order.update({
      where: { id: orderId },
      data: { deliveryOtp: code, status: "out_for_delivery" },
    });
    await addOrderEvent(orderId, "out_for_delivery", `Delivery OTP issued`);
    return NextResponse.json({ ok: true, deliveryOtp: code });
  }

  if (body.action === "confirm") {
    if (!order.deliveryOtp || body.code !== order.deliveryOtp) {
      return NextResponse.json({ error: { message: "Invalid delivery OTP" } }, { status: 400 });
    }
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "delivered",
        deliveryProofUrl: body.proofUrl || null,
        csatScore: body.csatScore ?? null,
      },
    });
    await addOrderEvent(orderId, "delivered", "Delivered with OTP confirmation");
    if (order.paymentMethod === "COD") {
      await prisma.user.update({
        where: { id: order.customerId },
        data: { riskScore: { decrement: 0.05 } },
      });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "bad_action" }, { status: 400 });
}
