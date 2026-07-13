import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser, notifyUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const item = await prisma.wishlistItem.create({
    data: {
      userId: user.id,
      title: body.title,
      url: body.url,
      imageUrl: body.imageUrl,
      priceUsd: body.priceUsd,
      targetPriceUsd: body.targetPriceUsd,
    },
  });
  return NextResponse.json({ item });
}

export async function PUT() {
  // price-drop scanner sandbox
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OPS")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const items = await prisma.wishlistItem.findMany({
    where: { alertEnabled: true, targetPriceUsd: { not: null } },
  });
  let alerts = 0;
  for (const item of items) {
    if (item.priceUsd != null && item.targetPriceUsd != null && item.priceUsd <= item.targetPriceUsd) {
      await notifyUser(item.userId, "wishlist_price_drop", {
        title: item.title,
        price: item.priceUsd,
      });
      alerts++;
    }
  }
  return NextResponse.json({ alerts });
}
