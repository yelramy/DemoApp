import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { addOrderEvent } from "@/lib/auth";

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  const partner = await prisma.partnerOrg.findFirst({
    where: { apiKey: apiKey ?? "", active: true },
  });
  if (!partner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();
  const batch = await prisma.shipmentBatch.findFirst({
    where: { id: body.batchId, partnerId: partner.id },
    include: { orders: true },
  });
  if (!batch) return NextResponse.json({ error: "batch_not_found" }, { status: 404 });

  const manifest = await prisma.manifest.create({
    data: {
      partnerId: partner.id,
      batchId: batch.id,
      flightRef: body.flightRef || `FZ-${Date.now()}`,
      departedAt: new Date(),
      payloadJson: JSON.stringify({ orderCount: batch.orders.length }),
    },
  });

  await prisma.shipmentBatch.update({
    where: { id: batch.id },
    data: { status: "departed" },
  });

  for (const order of batch.orders) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "in_transit_to_lebanon" },
    });
    await addOrderEvent(
      order.id,
      "in_transit_to_lebanon",
      `Manifest ${manifest.flightRef} departed`,
    );
  }

  return NextResponse.json({ manifest });
}
