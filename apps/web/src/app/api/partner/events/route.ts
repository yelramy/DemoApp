import { NextResponse } from "next/server";
import { prisma, OrderStatus } from "@bridge/db";
import { addOrderEvent } from "@/lib/auth";

const EVENT_TO_STATUS: Record<string, OrderStatus> = {
  received: "received_at_hub",
  weighed: "received_at_hub",
  departed: "in_transit_to_lebanon",
  customs: "customs_clearance",
  delivered: "delivered",
  exception: "on_hold_hub",
};

export async function POST(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  const partner = await prisma.partnerOrg.findFirst({
    where: { apiKey: apiKey ?? "", active: true },
  });
  if (!partner) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: body.order_id }, { publicId: body.order_id }],
      partnerId: partner.id,
    },
  });

  await prisma.partnerEvent.create({
    data: {
      partnerId: partner.id,
      orderId: order?.id,
      eventType: body.event_type,
      payloadJson: JSON.stringify(body),
    },
  });

  if (order && EVENT_TO_STATUS[body.event_type]) {
    const status = EVENT_TO_STATUS[body.event_type];
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status,
        hubTracking: body.tracking ?? order.hubTracking,
      },
    });
    await addOrderEvent(
      order.id,
      status,
      `Partner event: ${body.event_type}`,
      body,
    );
  }

  return NextResponse.json({ ok: true });
}
