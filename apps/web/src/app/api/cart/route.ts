import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";
import { computeQuote, loadPricingConfig } from "@/lib/pricing";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const items = await prisma.cartItem.findMany({ where: { userId: user.id } });
  const config = await loadPricingConfig("UAE");
  const breakdown = items.length
    ? computeQuote(
        items.map((i) => ({
          title: i.title,
          itemPriceUsd: i.priceUsd,
          estimatedWeightKg: i.estimatedWeightKg,
          quantity: i.quantity,
        })),
        config,
      )
    : null;
  return NextResponse.json({ items, breakdown });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const item = await prisma.cartItem.create({
    data: {
      userId: user.id,
      title: body.title,
      url: body.url || "manual://cart",
      imageUrl: body.imageUrl,
      priceUsd: Number(body.priceUsd),
      estimatedWeightKg: Number(body.estimatedWeightKg || 0.7),
      hub: body.hub || "UAE",
      quantity: Number(body.quantity || 1),
    },
  });
  return NextResponse.json({ item });
}

export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  if (body.clear) {
    await prisma.cartItem.deleteMany({ where: { userId: user.id } });
  } else if (body.id) {
    await prisma.cartItem.deleteMany({ where: { id: body.id, userId: user.id } });
  }
  return NextResponse.json({ ok: true });
}
