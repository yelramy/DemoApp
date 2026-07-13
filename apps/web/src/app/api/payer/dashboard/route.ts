import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const payLinks = await prisma.payLink.findMany({
    where: {
      OR: [{ payerId: user.id }, { payerEmail: user.email ?? undefined }, { order: { customerId: user.id } }],
    },
    include: { order: true },
    orderBy: { createdAt: "desc" },
  });

  // multi-currency display helpers
  const fx = await prisma.fxBuffer.findMany();
  return NextResponse.json({
    payLinks,
    displayCurrencies: [
      { code: "USD", rate: 1 },
      ...fx.map((f) => ({ code: f.currency, rate: f.toUsd })),
    ],
  });
}
