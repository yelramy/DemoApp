import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getSessionUser();
  const body = await req.json();
  let payload = body.payloadJson;
  if (!payload && user) {
    const items = await prisma.cartItem.findMany({ where: { userId: user.id } });
    payload = JSON.stringify({ items });
  }
  if (!payload) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }
  const token = `cart_${randomBytes(18).toString("base64url")}`;
  const share = await prisma.sharedCart.create({
    data: {
      token,
      payloadJson: payload,
      createdById: user?.id,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    },
  });
  return NextResponse.json({ token: share.token, url: `/share/${share.token}` });
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });
  const share = await prisma.sharedCart.findUnique({ where: { token } });
  if (!share || share.expiresAt < new Date()) {
    return NextResponse.json({ error: "expired" }, { status: 404 });
  }
  return NextResponse.json({ share, payload: JSON.parse(share.payloadJson) });
}
