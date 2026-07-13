import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      ok: true,
      service: "bridge-web",
      time: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        service: "bridge-web",
        error: e instanceof Error ? e.message : "db_unavailable",
      },
      { status: 503 },
    );
  }
}
