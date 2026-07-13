import { cookies } from "next/headers";
import { prisma } from "@bridge/db";

export function suiteCode() {
  return `BRG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function referralCode() {
  return `REF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function getSessionUser() {
  const jar = await cookies();
  const token = jar.get("bridge_session")?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        include: {
          addresses: true,
          wallet: true,
        },
      },
    },
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

export async function notifyUser(
  userId: string | null | undefined,
  template: string,
  payload: Record<string, unknown>,
  channel = "whatsapp_sandbox",
) {
  await prisma.notificationLog.create({
    data: {
      userId: userId ?? null,
      channel,
      template,
      payload: JSON.stringify(payload),
    },
  });
}

export async function postLedger(
  orderId: string | null,
  account: string,
  debit: number,
  credit: number,
  memo?: string,
) {
  await prisma.ledgerEntry.create({
    data: { orderId: orderId ?? undefined, account, debit, credit, memo },
  });
}
