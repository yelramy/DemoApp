import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getSessionUser();
  const body = await req.json();
  const text = String(body.message || "").toLowerCase();

  if (text.includes("where") && text.includes("order")) {
    if (!user) {
      return NextResponse.json({
        reply: "Log in, then ask again with your order id — or open /app/orders.",
      });
    }
    const order =
      (body.orderId
        ? await prisma.order.findUnique({ where: { id: body.orderId } })
        : null) ||
      (await prisma.order.findFirst({
        where: { customerId: user.id },
        orderBy: { createdAt: "desc" },
      }));
    if (!order) {
      return NextResponse.json({ reply: "No orders yet. Paste a link on /app to start." });
    }
    return NextResponse.json({
      reply: `Order ${order.publicId} is currently “${order.status}”. Open /app/orders/${order.id} for the full timeline.`,
    });
  }

  if (text.includes("banned") || text.includes("prohibited")) {
    return NextResponse.json({
      reply: "See /allowed-items and /legal/prohibited for banned goods (weapons, counterfeit, loose batteries, etc.).",
    });
  }

  if (text.includes("whish") || text.includes("pay")) {
    return NextResponse.json({
      reply: "Whish is primary. COD is area/risk limited. Diaspora can pay via /pay links. OMT needs a reference confirmation.",
    });
  }

  const macros = await prisma.supportMacro.findMany({ where: { active: true } });
  return NextResponse.json({
    reply:
      "I can help with order status, banned items, and payments. Try: “where is my order?”",
    macros,
  });
}
