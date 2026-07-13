import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await ctx.params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payments: true, address: true, events: true, quote: true },
  });
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const lines = [
    `Bridge Invoice`,
    `Order: ${order.publicId}`,
    `Item: ${order.itemTitle}`,
    `Total USD: ${order.totalUsd.toFixed(2)}`,
    `Payment: ${order.paymentMethod}`,
    `Status: ${order.status}`,
    `Created: ${order.createdAt.toISOString()}`,
  ].join("\n");

  return new NextResponse(lines, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "content-disposition": `attachment; filename="${order.publicId}.txt"`,
    },
  });
}
