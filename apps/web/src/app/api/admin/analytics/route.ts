import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OPS")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const orders = await prisma.order.findMany({ take: 500 });
  const byStatus: Record<string, number> = {};
  let revenue = 0;
  let bridgeTakeEst = 0;
  for (const o of orders) {
    byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
    if (["paid", "delivered", "completed", "buy_in_progress", "purchased"].includes(o.status) || o.status.includes("transit") || o.status.includes("customs") || o.status.includes("hub") || o.status.includes("delivery")) {
      revenue += o.totalUsd;
      bridgeTakeEst += o.totalUsd * 0.12;
    }
  }

  const reviews = await prisma.review.aggregate({ _avg: { rating: true }, _count: true });

  return NextResponse.json({
    orderCount: orders.length,
    byStatus,
    revenueEst: Math.round(revenue * 100) / 100,
    marginEst: Math.round(bridgeTakeEst * 100) / 100,
    avgRating: reviews._avg.rating,
    reviewCount: reviews._count,
  });
}
