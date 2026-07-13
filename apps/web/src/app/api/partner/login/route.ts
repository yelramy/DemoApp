import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@bridge/db";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_SECRET =
  process.env.SESSION_SECRET ??
  (process.env.NODE_ENV !== "production" ? "dev-partner-cookie-secret" : undefined);

function sign(partnerId: string) {
  if (!COOKIE_SECRET) throw new Error("SESSION_SECRET is required in production");
  return createHmac("sha256", COOKIE_SECRET).update(partnerId).digest("hex");
}

function verifyCookie(raw: string | undefined): string | null {
  if (!raw || !COOKIE_SECRET) return null;
  const [partnerId, sig] = raw.split(".");
  if (!partnerId || !sig) return null;
  const expected = Buffer.from(sign(partnerId));
  const provided = Buffer.from(sig);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }
  return partnerId;
}

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
  const jar = await cookies();
  jar.set("bridge_partner", `${partner.id}.${sign(partner.id)}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 12 * 60 * 60,
  });
  await prisma.observabilityEvent.create({
    data: {
      level: "info",
      source: "partner_login",
      message: `Partner ${partner.id} login`,
    },
  });
  return NextResponse.json({
    ok: true,
    partner: { id: partner.id, name: partner.name, hub: partner.hub, apiKey: partner.apiKey },
  });
}

export async function GET() {
  const jar = await cookies();
  const partnerId = verifyCookie(jar.get("bridge_partner")?.value);
  if (!partnerId) return NextResponse.json({ partner: null });
  const partner = await prisma.partnerOrg.findUnique({ where: { id: partnerId } });
  return NextResponse.json({
    partner:
      partner && partner.active
        ? { id: partner.id, name: partner.name, hub: partner.hub, apiKey: partner.apiKey }
        : null,
  });
}
