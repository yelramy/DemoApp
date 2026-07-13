import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OPS")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const claims = await prisma.claim.findMany({
    include: { order: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ claims });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OPS")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const claim = await prisma.claim.update({
    where: { id: body.claimId },
    data: {
      status: body.status || "resolved",
      resolvedAt: new Date(),
    },
  });
  if (body.status === "resolved") {
    await prisma.order.update({
      where: { id: claim.orderId },
      data: { status: "claim_resolved" },
    });
  }
  await prisma.auditLog.create({
    data: {
      actorId: user.id,
      action: "claim.resolve",
      entity: "Claim",
      entityId: claim.id,
      metaJson: JSON.stringify(body),
    },
  });
  return NextResponse.json({ claim });
}
