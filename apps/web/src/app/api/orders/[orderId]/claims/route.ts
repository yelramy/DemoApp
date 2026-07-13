import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { addOrderEvent, getSessionUser, notifyUser } from "@/lib/auth";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { orderId } = await ctx.params;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || (order.customerId !== user.id && user.role === "CUSTOMER")) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (!["delivered", "completed", "claim_open"].includes(order.status)) {
    return NextResponse.json(
      { error: { message: "Claims open only after delivery" } },
      { status: 400 },
    );
  }
  const body = await req.json();
  const claim = await prisma.claim.create({
    data: {
      orderId: order.id,
      reason: body.reason || "damage",
      details: body.details,
      photoUrls: body.photoUrls ? JSON.stringify(body.photoUrls) : null,
    },
  });
  await prisma.order.update({
    where: { id: orderId },
    data: { status: "claim_open" },
  });
  await addOrderEvent(orderId, "claim_open", `Claim opened: ${claim.reason}`);
  await notifyUser(user.id, "claim_open", { order_id: order.publicId });
  return NextResponse.json({ claim });
}
