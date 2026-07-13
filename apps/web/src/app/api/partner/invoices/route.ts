import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";

export async function GET(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  const partner = await prisma.partnerOrg.findFirst({
    where: { apiKey: apiKey ?? "", active: true },
  });
  if (!partner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const invoices = await prisma.partnerInvoice.findMany({
    where: { partnerId: partner.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ invoices });
}

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  const partner = await prisma.partnerOrg.findFirst({
    where: { apiKey: apiKey ?? "", active: true },
  });
  if (!partner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const since = new Date(Date.now() - 7 * 86400000);
  const orders = await prisma.order.findMany({
    where: {
      partnerId: partner.id,
      updatedAt: { gte: since },
      finalWeightKg: { not: null },
    },
  });
  const kgTotal = orders.reduce((s, o) => s + (o.finalWeightKg || 0), 0);
  const amountUsd = Math.round((kgTotal * 8 + orders.length * 2) * 100) / 100;
  const weekOf = new Date().toISOString().slice(0, 10);
  const invoice = await prisma.partnerInvoice.create({
    data: {
      partnerId: partner.id,
      weekOf,
      amountUsd,
      kgTotal,
      status: "open",
      payloadJson: JSON.stringify({ orderIds: orders.map((o) => o.publicId) }),
    },
  });
  return NextResponse.json({ invoice });
}
