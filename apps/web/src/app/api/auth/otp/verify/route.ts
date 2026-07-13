import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  const body = await req.json();
  const target = String(body.phone || body.email || "").trim();
  const code = String(body.code || "").trim();

  const challenge = await prisma.otpChallenge.findFirst({
    where: {
      target,
      code,
      consumed: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!challenge?.userId) {
    return NextResponse.json(
      { error: { code: "INVALID_OTP", message: "Invalid or expired code" } },
      { status: 401 },
    );
  }

  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { consumed: true },
  });

  const token = randomBytes(32).toString("hex");
  await prisma.session.create({
    data: {
      token,
      userId: challenge.userId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const jar = await cookies();
  jar.set("bridge_session", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });

  const user = await prisma.user.findUnique({ where: { id: challenge.userId } });
  return NextResponse.json({ ok: true, user });
}
