import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ orderId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { orderId } = await ctx.params;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || (order.customerId !== user.id && user.role === "CUSTOMER")) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const body = await req.json().catch(() => ({}));
  let ticket = await prisma.ticket.findFirst({
    where: { orderId, userId: user.id, status: "open" },
  });
  if (!ticket) {
    ticket = await prisma.ticket.create({
      data: {
        userId: user.id,
        orderId,
        subject: body.subject || `Order ${order.publicId}`,
        channel: "in_app",
      },
    });
  }
  if (body.message) {
    await prisma.ticketMessage.create({
      data: { ticketId: ticket.id, sender: "customer", body: body.message },
    });
  }
  return NextResponse.json({ ticketId: ticket.id, redirect: `/app/support?ticket=${ticket.id}` });
}
