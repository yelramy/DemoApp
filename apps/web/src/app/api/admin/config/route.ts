import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "OPS")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const [promos, rates, flags, macros, bans, areas] = await Promise.all([
    prisma.promoCode.findMany({ orderBy: { code: "asc" } }),
    prisma.rateCardConfig.findMany({ orderBy: { hub: "asc" } }),
    prisma.featureFlag.findMany(),
    prisma.supportMacro.findMany(),
    prisma.bannedKeyword.findMany(),
    prisma.deliveryArea.findMany(),
  ]);
  return NextResponse.json({ promos, rates, flags, macros, bans, areas });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json();
  if (body.type === "promo") {
    const promo = await prisma.promoCode.upsert({
      where: { code: String(body.code).toUpperCase() },
      update: {
        discountUsd: Number(body.discountUsd || 0),
        discountPct: Number(body.discountPct || 0),
        active: body.active ?? true,
        maxUses: Number(body.maxUses || 100),
      },
      create: {
        code: String(body.code).toUpperCase(),
        discountUsd: Number(body.discountUsd || 0),
        discountPct: Number(body.discountPct || 0),
        maxUses: Number(body.maxUses || 100),
      },
    });
    return NextResponse.json({ promo });
  }
  if (body.type === "rate") {
    const existing = await prisma.rateCardConfig.findFirst({
      where: { hub: body.hub, method: body.method || "air_express" },
    });
    const data = {
      hub: body.hub,
      method: body.method || "air_express",
      pricePerKg: Number(body.pricePerKg),
      minCharge: Number(body.minCharge),
      handlingPerParcel: Number(body.handlingPerParcel || 3),
      volumetricDivisor: Number(body.volumetricDivisor || 5000),
      active: body.active ?? true,
    };
    const rate = existing
      ? await prisma.rateCardConfig.update({ where: { id: existing.id }, data })
      : await prisma.rateCardConfig.create({ data });
    return NextResponse.json({ rate });
  }
  if (body.type === "flag") {
    const flag = await prisma.featureFlag.upsert({
      where: { key: body.key },
      update: { enabled: Boolean(body.enabled), note: body.note },
      create: { key: body.key, enabled: Boolean(body.enabled), note: body.note },
    });
    return NextResponse.json({ flag });
  }
  if (body.type === "ban") {
    const ban = await prisma.bannedKeyword.upsert({
      where: { keyword: String(body.keyword).toLowerCase() },
      update: { severity: body.severity || "block", note: body.note },
      create: {
        keyword: String(body.keyword).toLowerCase(),
        severity: body.severity || "block",
        note: body.note,
      },
    });
    return NextResponse.json({ ban });
  }
  return NextResponse.json({ error: "unknown_type" }, { status: 400 });
}
