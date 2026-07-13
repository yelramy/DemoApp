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
      { error: { message: "Returns only after delivery" } },
      { status: 400 },
    );
  }
  const body = await req.json();
  const row = await prisma.returnRequest.create({
    data: {
      orderId,
      reason: body.reason || "changed_mind",
      details: body.details,
    },
  });
  await prisma.order.update({
    where: { id: orderId },
    data: { returnStatus: "requested" },
  });
  await addOrderEvent(orderId, "return_requested", `Return: ${row.reason}`);
  await notifyUser(order.customerId, "return_requested", { order_id: order.publicId });
  return NextResponse.json({ return: row });
}
