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
  discrepancy: "on_hold_hub",
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
  const eventKey = body.event_id || body.eventKey;
  if (eventKey) {
    const existing = await prisma.partnerEvent.findUnique({
      where: { eventKey: String(eventKey) },
    });
    if (existing) {
      return NextResponse.json({ ok: true, duplicate: true });
    }
  }

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: body.order_id }, { publicId: body.order_id }],
    },
  });

  // auto-match suite inbound by tracking
  if (!order && body.tracking) {
    const expected = await prisma.expectedParcel.findFirst({
      where: { tracking: body.tracking, status: "expected" },
    });
    if (expected) {
      await prisma.expectedParcel.update({
        where: { id: expected.id },
        data: { status: "received", receivedAt: new Date() },
      });
      await prisma.partnerEvent.create({
        data: {
          partnerId: partner.id,
          eventType: "suite_received",
          eventKey: eventKey ? String(eventKey) : undefined,
          payloadJson: JSON.stringify({ ...body, expectedParcelId: expected.id }),
        },
      });
      return NextResponse.json({ ok: true, matchedSuite: expected.id });
    }
  }

  await prisma.partnerEvent.create({
    data: {
      partnerId: partner.id,
      orderId: order?.id,
      eventType: body.event_type,
      eventKey: eventKey ? String(eventKey) : undefined,
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
        notes:
          body.event_type === "discrepancy"
            ? `${order.notes || ""}\nDiscrepancy: ${body.notes || "reported"}`.trim()
            : order.notes,
      },
    });
    await addOrderEvent(
      order.id,
      status,
      body.event_type === "discrepancy"
        ? `Discrepancy: ${body.notes || "wrong/damaged on arrival"}`
        : `Partner event: ${body.event_type}`,
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
      status: {
        in: ["purchased", "awaiting_inbound", "received_at_hub", "consolidated"],
      },
    },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  return NextResponse.json({ expected });
}
