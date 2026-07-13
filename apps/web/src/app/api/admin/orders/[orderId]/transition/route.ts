import { NextResponse } from "next/server";
import { prisma, OrderStatus } from "@bridge/db";
import { addOrderEvent, getSessionUser } from "@/lib/auth";

const ALLOWED: Partial<Record<OrderStatus, OrderStatus[]>> = {
  paid: ["buy_in_progress", "cancelled", "refund_pending"],
  buy_in_progress: ["purchased", "refund_pending"],
  purchased: ["awaiting_inbound"],
  awaiting_inbound: ["received_at_hub"],
  received_at_hub: ["consolidated", "on_hold_hub"],
  consolidated: ["in_transit_to_lebanon"],
  in_transit_to_lebanon: ["customs_clearance"],
  customs_clearance: ["out_for_delivery", "customs_hold"],
  customs_hold: ["customs_clearance", "refund_pending"],
  out_for_delivery: ["delivered"],
  delivered: ["completed", "claim_open"],
  refund_pending: ["refunded"],
  claim_open: ["claim_resolved", "completed"],
};

export async function POST(
  req: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OPS")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { orderId } = await ctx.params;
  const body = await req.json();
  const next = body.status as OrderStatus;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const allowed = ALLOWED[order.status] ?? [];
  if (!allowed.includes(next)) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_TRANSITION",
          message: `Cannot move ${order.status} → ${next}`,
        },
      },
      { status: 400 },
    );
  }

  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: next,
      retailerOrderId: body.retailerOrderId ?? order.retailerOrderId,
      retailerTrack: body.retailerTrack ?? order.retailerTrack,
      hubTracking: body.hubTracking ?? order.hubTracking,
    },
  });
  await addOrderEvent(
    orderId,
    next,
    body.message ?? `Status updated to ${next}`,
    body.meta,
  );

  return NextResponse.json({ ok: true });
}
