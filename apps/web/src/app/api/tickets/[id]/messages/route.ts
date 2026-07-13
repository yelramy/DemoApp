import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (ticket.userId !== user.id && user.role === "CUSTOMER") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const message = await prisma.ticketMessage.create({
    data: {
      ticketId: id,
      sender: user.role === "CUSTOMER" ? "customer" : "ops",
      body: body.body,
    },
  });
  return NextResponse.json({ message });
}
