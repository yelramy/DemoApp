import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OPS")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const since = new Date(Date.now() - 7 * 86400000);
  const [payments, ledger, claims, notifications, staleBuys, partnerSilent] =
    await Promise.all([
      prisma.paymentIntent.findMany({
        where: { createdAt: { gte: since } },
        include: { order: true },
      }),
      prisma.ledgerEntry.findMany({ where: { createdAt: { gte: since } } }),
      prisma.claim.findMany({ where: { status: "open" }, include: { order: true } }),
      prisma.notificationLog.findMany({
        where: { createdAt: { gte: since } },
        take: 50,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.findMany({
        where: {
          status: "paid",
          updatedAt: { lt: new Date(Date.now() - 24 * 3600000) },
        },
      }),
      prisma.order.findMany({
        where: {
          status: { in: ["purchased", "awaiting_inbound"] },
          updatedAt: { lt: new Date(Date.now() - 5 * 86400000) },
        },
      }),
    ]);

  const paidSum = payments
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + p.amountUsd, 0);

  return NextResponse.json({
    paidSum7d: Math.round(paidSum * 100) / 100,
    paymentCount: payments.length,
    ledgerRows: ledger.length,
    openClaims: claims,
    recentNotifications: notifications,
    sla: {
      buyOverdue: staleBuys.map((o) => o.publicId),
      partnerSilent: partnerSilent.map((o) => o.publicId),
    },
  });
}
