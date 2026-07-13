import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [orders, addresses, tickets, wishlist, cart] = await Promise.all([
    prisma.order.findMany({ where: { customerId: user.id } }),
    prisma.address.findMany({ where: { userId: user.id } }),
    prisma.ticket.findMany({ where: { userId: user.id }, include: { messages: true } }),
    prisma.wishlistItem.findMany({ where: { userId: user.id } }),
    prisma.cartItem.findMany({ where: { userId: user.id } }),
  ]);
  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    profile: user,
    orders,
    addresses,
    tickets,
    wishlist,
    cart,
  });
}
