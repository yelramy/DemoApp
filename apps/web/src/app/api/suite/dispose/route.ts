import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const parcel = await prisma.expectedParcel.findFirst({
    where: { id: body.id, userId: user.id },
  });
  if (!parcel) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const status = ["abandoned", "donate", "discard"].includes(body.status)
    ? body.status
    : "abandoned";
  const updated = await prisma.expectedParcel.update({
    where: { id: parcel.id },
    data: { status },
  });
  return NextResponse.json({ parcel: updated });
}
