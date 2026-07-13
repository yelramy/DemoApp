import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

const FREE_DAYS = 7;
const FEE_PER_DAY = 1.5;

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const ids: string[] = body.parcelIds || [];
  const parcels = await prisma.expectedParcel.findMany({
    where: { id: { in: ids }, userId: user.id },
  });

  let storage = 0;
  for (const p of parcels) {
    const start = p.receivedAt ?? p.createdAt;
    const days = Math.max(
      0,
      Math.floor((Date.now() - start.getTime()) / (86400000)) - FREE_DAYS,
    );
    const fee = days * FEE_PER_DAY;
    storage += fee;
    await prisma.expectedParcel.update({
      where: { id: p.id },
      data: { status: "consolidating", storageFeeUsd: fee },
    });
  }

  return NextResponse.json({
    ok: true,
    storageFeeUsd: Math.round(storage * 100) / 100,
    message: "Consolidation requested — partner will pack next flight",
  });
}
