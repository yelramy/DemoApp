import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser, notifyUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const tickets = await prisma.ticket.findMany({
    where: user.role === "CUSTOMER" ? { userId: user.id } : {},
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ tickets });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const ticket = await prisma.ticket.create({
    data: {
      userId: user.id,
      orderId: body.orderId,
      subject: body.subject || "Support",
      channel: body.channel || "in_app",
      messages: {
        create: { sender: "customer", body: body.message || body.subject || "Help" },
      },
    },
    include: { messages: true },
  });
  await notifyUser(user.id, "ticket_created", { ticket_id: ticket.id }, "whatsapp_sandbox");
  return NextResponse.json({ ticket });
}
