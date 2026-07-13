import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OPS")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const orders = await prisma.order.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  const columns: Record<string, typeof orders> = {
    awaiting_payment: [],
    paid: [],
    buying: [],
    hub: [],
    transit: [],
    delivery: [],
    done: [],
  };
  for (const o of orders) {
    if (o.status === "awaiting_payment") columns.awaiting_payment.push(o);
    else if (["paid", "buy_in_progress"].includes(o.status)) columns.paid.push(o);
    else if (["purchased", "awaiting_inbound"].includes(o.status)) columns.buying.push(o);
    else if (["received_at_hub", "consolidated", "on_hold_hub"].includes(o.status))
      columns.hub.push(o);
    else if (
      ["in_transit_to_lebanon", "customs_clearance", "customs_hold"].includes(o.status)
    )
      columns.transit.push(o);
    else if (["out_for_delivery"].includes(o.status)) columns.delivery.push(o);
    else columns.done.push(o);
  }
  return NextResponse.json({ columns });
}
