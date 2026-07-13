import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const lists = await prisma.essentialsList.findMany({
    where: { userId: user.id },
    include: { items: true },
  });
  return NextResponse.json({ lists, referralCode: user.referralCode });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  if (body.item && body.listId) {
    const item = await prisma.essentialsItem.create({
      data: {
        listId: body.listId,
        title: body.item.title,
        url: body.item.url,
        priceUsd: body.item.priceUsd,
      },
    });
    return NextResponse.json({ item });
  }
  const list = await prisma.essentialsList.create({
    data: { userId: user.id, name: body.name || "Family essentials" },
  });
  return NextResponse.json({ list });
}
