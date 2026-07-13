import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";

export async function GET(req: Request) {
  const hub = new URL(req.url).searchParams.get("hub") || "UAE";
  const method = new URL(req.url).searchParams.get("method") || "air_express";
  const kg = Number(new URL(req.url).searchParams.get("kg") || 1);
  const rate = await prisma.rateCardConfig.findFirst({
    where: { hub, method, active: true },
  });
  if (!rate) return NextResponse.json({ error: "no_rate" }, { status: 404 });
  const price = Math.max(rate.minCharge, kg * rate.pricePerKg + rate.handlingPerParcel);
  return NextResponse.json({
    hub,
    method,
    kg,
    price: Math.round(price * 100) / 100,
    rate,
  });
}
