import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const addresses = await prisma.address.findMany({ where: { userId: user.id } });
  return NextResponse.json({ addresses });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  if (body.isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }
  const address = await prisma.address.create({
    data: {
      userId: user.id,
      label: body.label || "Home",
      fullName: body.fullName || user.name || "Customer",
      phone: body.phone || user.phone || "",
      city: body.city,
      area: body.area,
      street: body.street,
      building: body.building,
      notes: body.notes,
      isDefault: Boolean(body.isDefault),
    },
  });
  return NextResponse.json({ address });
}
