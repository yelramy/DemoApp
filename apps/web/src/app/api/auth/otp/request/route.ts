import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { referralCode, suiteCode } from "@/lib/auth";

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

  const recentCount = await prisma.otpChallenge.count({
    where: {
      target,
      createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) },
    },
  });
  if (recentCount >= 5) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many OTP requests; try again later" } },
      { status: 429 },
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
        referralCode: referralCode(),
        role: target === "admin@bridge.lb" ? "ADMIN" : "CUSTOMER",
        wallet: { create: { balanceUsd: 0 } },
      },
    });

    if (body.referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: String(body.referralCode).toUpperCase() },
      });
      if (referrer && referrer.id !== user.id) {
        await prisma.referralRedemption.create({
          data: {
            referrerId: referrer.id,
            refereeId: user.id,
            creditUsd: 5,
          },
        });
        await prisma.wallet.upsert({
          where: { userId: referrer.id },
          update: { balanceUsd: { increment: 5 } },
          create: { userId: referrer.id, balanceUsd: 5 },
        });
        await prisma.wallet.upsert({
          where: { userId: user.id },
          update: { balanceUsd: { increment: 5 } },
          create: { userId: user.id, balanceUsd: 5 },
        });
      }
    }
  }

  await prisma.otpChallenge.create({
    data: {
      userId: user.id,
      target,
      code: DEMO_OTP,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const isSandbox = process.env.NODE_ENV !== "production" || !!process.env.DEMO_OTP_CODE;
  return NextResponse.json({
    ok: true,
    ...(isSandbox ? { demoCode: DEMO_OTP } : {}),
    message: isSandbox ? "OTP sent (sandbox: use demo code)" : "OTP sent",
  });
}
