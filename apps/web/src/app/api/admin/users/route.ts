import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

async function requireStaff() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OPS")) return null;
  return user;
}

export async function GET() {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { wallet: true, _count: { select: { orders: true } } },
  });
  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  const actor = await requireStaff();
  if (!actor) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json();
  const updated = await prisma.user.update({
    where: { id: body.userId },
    data: {
      riskScore: body.riskScore ?? undefined,
      role: body.role ?? undefined,
      kycStatus: body.kycStatus ?? undefined,
    },
  });
  await prisma.auditLog.create({
    data: {
      actorId: actor.id,
      action: "user.update",
      entity: "User",
      entityId: updated.id,
      metaJson: JSON.stringify(body),
    },
  });
  return NextResponse.json({ user: updated });
}
