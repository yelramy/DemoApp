import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

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
  if (!["delivered", "completed"].includes(order.status)) {
    return NextResponse.json({ error: "too_early" }, { status: 400 });
  }
  const body = await req.json();
  const review = await prisma.review.upsert({
    where: { orderId },
    update: { rating: Number(body.rating), body: body.body },
    create: {
      orderId,
      userId: user.id,
      rating: Number(body.rating),
      body: body.body,
    },
  });
  return NextResponse.json({ review });
}
