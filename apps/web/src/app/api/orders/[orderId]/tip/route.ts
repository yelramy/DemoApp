import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { addOrderEvent, getSessionUser, postLedger } from "@/lib/auth";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { orderId } = await ctx.params;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.customerId !== user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const body = await req.json();
  const tipUsd = Math.max(0, Number(body.tipUsd || 0));
  await prisma.order.update({ where: { id: orderId }, data: { tipUsd } });
  if (tipUsd > 0) {
    await postLedger(orderId, "tip", tipUsd, 0, "Courier tip");
    await addOrderEvent(orderId, order.status, `Tip $${tipUsd} recorded`);
  }
  return NextResponse.json({ tipUsd });
}
