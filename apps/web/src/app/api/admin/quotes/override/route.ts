import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const quote = await prisma.quote.findUnique({ where: { id: body.quoteId } });
  if (!quote) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const updated = await prisma.quote.update({
    where: { id: quote.id },
    data: {
      total: Number(body.total ?? quote.total),
      shipping: Number(body.shipping ?? quote.shipping),
      buyFee: Number(body.buyFee ?? quote.buyFee),
      customsEstimate: Number(body.customsEstimate ?? quote.customsEstimate),
      bridgeTake: Number(body.bridgeTake ?? quote.bridgeTake),
      marginOk: true,
      overrideReason: body.reason || "manual override",
      overrideById: user.id,
    },
  });
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "quote.override",
      entity: "Quote",
      entityId: quote.id,
      metaJson: JSON.stringify(body),
    },
  });
  return NextResponse.json({ quote: updated });
}
