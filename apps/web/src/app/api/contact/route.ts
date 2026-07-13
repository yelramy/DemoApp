import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.name || !body.email || !body.message) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const row = await prisma.contactMessage.create({
    data: {
      name: body.name,
      email: body.email,
      message: body.message,
    },
  });
  return NextResponse.json({ ok: true, id: row.id });
}
