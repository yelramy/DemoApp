import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@bridge/db";

export async function POST() {
  const jar = await cookies();
  const token = jar.get("bridge_session")?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { token } });
    jar.delete("bridge_session");
  }
  return NextResponse.json({ ok: true });
}
