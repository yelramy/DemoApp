import { NextResponse } from "next/server";
import { prisma, OrderStatus } from "@bridge/db";
import { addOrderEvent, notifyUser, postLedger } from "@/lib/auth";

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
    const photos = body.photo_urls
      ? JSON.stringify(body.photo_urls)
      : order.hubPhotoUrls;

    let finalWeightKg = order.finalWeightKg;
    if (body.weight_kg) finalWeightKg = Number(body.weight_kg);

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status,
        hubTracking: body.tracking ?? order.hubTracking,
        hubPhotoUrls: photos,
        finalWeightKg,
        partnerId: partner.id,
      },
    });
    await addOrderEvent(
      order.id,
      status,
      `Partner event: ${body.event_type}`,
      body,
    );
    await notifyUser(order.customerId, body.event_type, {
      order_id: order.publicId,
      tracking: body.tracking,
    });

    if (
      body.weight_kg &&
      order.quotedWeightKg &&
      Number(body.weight_kg) > order.quotedWeightKg * 1.1
    ) {
      const extraKg = Number(body.weight_kg) - order.quotedWeightKg;
      const extraUsd = Math.round(extraKg * 12 * 100) / 100;
      await prisma.weightAdjustment.create({
        data: {
          orderId: order.id,
          quotedKg: order.quotedWeightKg,
          finalKg: Number(body.weight_kg),
          extraUsd,
          status: "due",
        },
      });
      await addOrderEvent(
        order.id,
        "weight_adjust",
        `Weight overage ${extraKg.toFixed(2)}kg · extra $${extraUsd}`,
      );
      await notifyUser(order.customerId, "weight_adjust", {
        order_id: order.publicId,
        amount: extraUsd,
        kg: body.weight_kg,
      });
    }

    if (status === "delivered") {
      await postLedger(order.id, "revenue_fees", 0, order.totalUsd * 0.2, "Recognized");
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  const apiKey = req.headers.get("x-api-key");
  const partner = await prisma.partnerOrg.findFirst({
    where: { apiKey: apiKey ?? "", active: true },
  });
  if (!partner) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const expected = await prisma.order.findMany({
    where: {
      partnerId: partner.id,
      status: { in: ["purchased", "awaiting_inbound", "received_at_hub", "consolidated"] },
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  return NextResponse.json({ expected });
}
