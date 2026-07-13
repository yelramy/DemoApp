import { cookies } from "next/headers";
import { prisma } from "@bridge/db";

export async function getSessionUser() {
  const jar = await cookies();
  const token = jar.get("bridge_session")?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: { include: { addresses: true, wallet: true } } },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

export function publicOrderId() {
  return `BRG-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

export function suiteCode() {
  return `BRG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function addOrderEvent(
  orderId: string,
  status: string,
  message: string,
  meta?: unknown,
) {
  await prisma.orderEvent.create({
    data: {
      orderId,
      status,
      message,
      metaJson: meta ? JSON.stringify(meta) : null,
    },
  });
}
