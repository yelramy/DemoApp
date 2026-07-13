import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { suiteCode } from "@/lib/auth";

const DEMO_OTP = process.env.DEMO_OTP_CODE ?? "246810";

export async function POST(req: Request) {
  const body = await req.json();
  const target = String(body.phone || body.email || "").trim();
  if (!target) {
    return NextResponse.json(
      { error: { code: "TARGET_REQUIRED", message: "Phone or email required" } },
      { status: 400 },
    );
  }

  let user = body.phone
    ? await prisma.user.findUnique({ where: { phone: target } })
    : await prisma.user.findUnique({ where: { email: target } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone: body.phone ? target : null,
        email: body.email ? target : null,
        name: body.name ?? null,
        suiteCode: suiteCode(),
        role: target === "admin@bridge.lb" ? "ADMIN" : "CUSTOMER",
        wallet: { create: { balanceUsd: 0 } },
      },
    });
  }

  await prisma.otpChallenge.create({
    data: {
      userId: user.id,
      target,
      code: DEMO_OTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  return NextResponse.json({
    ok: true,
    demoCode: DEMO_OTP,
    message: "OTP sent (sandbox: use demo code)",
  });
}
