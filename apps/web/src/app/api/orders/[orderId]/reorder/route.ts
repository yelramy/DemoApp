import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { orderId } = await ctx.params;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.customerId !== user.id) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // add to cart for reorder
  await prisma.cartItem.create({
    data: {
      userId: user.id,
      title: order.itemTitle,
      url: order.itemUrl,
      imageUrl: order.itemImage,
      priceUsd: order.totalUsd * 0.55,
      estimatedWeightKg: order.quotedWeightKg ?? 0.7,
    },
  });

  return NextResponse.json({ ok: true, redirect: "/app/cart" });
}
