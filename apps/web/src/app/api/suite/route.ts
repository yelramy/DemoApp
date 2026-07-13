import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const parcels = await prisma.expectedParcel.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    suite: {
      code: user.suiteCode,
      uae: `Bridge c/o Demo UAE Hub\nAl Quoz Industrial\nDubai, UAE\nSuite: ${user.suiteCode}`,
      us: `Bridge c/o Demo US Hub\nDelaware Free Zone\nUSA\nSuite: ${user.suiteCode}`,
      tr: `Bridge c/o Demo TR Hub\nIstanbul\nTurkey\nSuite: ${user.suiteCode}`,
    },
    parcels,
  });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const parcel = await prisma.expectedParcel.create({
    data: {
      userId: user.id,
      store: body.store,
      tracking: body.tracking,
      description: body.description || "Expected package",
    },
  });
  return NextResponse.json({ parcel });
}
