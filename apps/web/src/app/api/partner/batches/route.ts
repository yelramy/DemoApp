import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  const partner = await prisma.partnerOrg.findFirst({
    where: { apiKey: apiKey ?? "", active: true },
  });
  if (!partner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const batch = await prisma.shipmentBatch.create({
    data: {
      partnerId: partner.id,
      label: body.label || `Batch ${new Date().toISOString().slice(0, 10)}`,
      status: "open",
    },
  });

  if (Array.isArray(body.orderIds) && body.orderIds.length) {
    await prisma.order.updateMany({
      where: { id: { in: body.orderIds } },
      data: { batchId: batch.id, status: "consolidated" },
    });
  }

  return NextResponse.json({ batch });
}

export async function GET(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  const partner = await prisma.partnerOrg.findFirst({
    where: { apiKey: apiKey ?? "", active: true },
  });
  if (!partner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const batches = await prisma.shipmentBatch.findMany({
    where: { partnerId: partner.id },
    include: { orders: true, manifest: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ batches });
}
