import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ balanceUsd: wallet?.balanceUsd ?? 0 });
}
