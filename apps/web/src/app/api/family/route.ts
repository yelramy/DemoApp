import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const members = await prisma.familyMember.findMany({
    where: { ownerUserId: user.id },
  });
  return NextResponse.json({ members });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const member = await prisma.familyMember.create({
    data: {
      ownerUserId: user.id,
      name: body.name,
      phone: body.phone,
      relation: body.relation || "family",
    },
  });
  return NextResponse.json({ member });
}
