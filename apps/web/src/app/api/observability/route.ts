import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json();
  const row = await prisma.observabilityEvent.create({
    data: {
      level: body.level || "error",
      source: body.source || "web",
      message: body.message || "unknown",
      metaJson: body.meta ? JSON.stringify(body.meta) : null,
    },
  });
  return NextResponse.json({ id: row.id });
}

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OPS")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const events = await prisma.observabilityEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const audits = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ events, audits });
}
