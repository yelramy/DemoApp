import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code");
  if (code) {
    const link = await prisma.affiliateLink.findUnique({ where: { code: code.toUpperCase() } });
    if (!link || !link.active) return NextResponse.json({ error: "invalid" }, { status: 404 });
    await prisma.affiliateLink.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } },
    });
    return NextResponse.json({ link });
  }
  const links = await prisma.affiliateLink.findMany({ where: { active: true } });
  return NextResponse.json({ links });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const link = await prisma.affiliateLink.create({
    data: {
      code: String(body.code).toUpperCase(),
      label: body.label || body.code,
      creditUsd: Number(body.creditUsd || 7),
    },
  });
  return NextResponse.json({ link });
}
