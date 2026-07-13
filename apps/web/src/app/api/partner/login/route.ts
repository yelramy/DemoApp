import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@bridge/db";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email || "").trim();
  const code = String(body.code || "").trim();
  const partner = await prisma.partnerOrg.findFirst({
    where: { loginEmail: email, loginCode: code, active: true },
  });
  if (!partner) {
    return NextResponse.json({ error: "invalid_login" }, { status: 401 });
  }
  const token = randomBytes(24).toString("hex");
  const jar = await cookies();
  jar.set("bridge_partner", `${partner.id}.${token}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  // store token on partner temporarily via contact field pattern - use Observability for session
  await prisma.observabilityEvent.create({
    data: {
      level: "info",
      source: "partner_login",
      message: `Partner ${partner.id} login`,
      metaJson: JSON.stringify({ token }),
    },
  });
  return NextResponse.json({
    ok: true,
    partner: { id: partner.id, name: partner.name, hub: partner.hub, apiKey: partner.apiKey },
  });
}

export async function GET() {
  const jar = await cookies();
  const raw = jar.get("bridge_partner")?.value;
  if (!raw) return NextResponse.json({ partner: null });
  const partnerId = raw.split(".")[0];
  const partner = await prisma.partnerOrg.findUnique({ where: { id: partnerId } });
  return NextResponse.json({
    partner: partner
      ? { id: partner.id, name: partner.name, hub: partner.hub, apiKey: partner.apiKey }
      : null,
  });
}
