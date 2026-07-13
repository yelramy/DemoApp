import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser, notifyUser } from "@/lib/auth";

export async function POST() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OPS")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const abandoned = await prisma.quote.findMany({
    where: {
      order: null,
      expiresAt: { gt: new Date() },
      abandonedNudgeAt: null,
      createdAt: { lt: new Date(Date.now() - 30 * 60000) },
      userId: { not: null },
    },
    take: 50,
  });

  for (const q of abandoned) {
    await prisma.quote.update({
      where: { id: q.id },
      data: { abandonedNudgeAt: new Date() },
    });
    await notifyUser(q.userId, "abandoned_quote", {
      quote_id: q.id,
      total_usd: q.total,
      link: `/app/quote/${q.id}`,
    });
  }

  return NextResponse.json({ nudged: abandoned.length });
}
