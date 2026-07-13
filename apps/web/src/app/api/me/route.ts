import { NextResponse } from "next/server";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      preferredPayment: user.preferredPayment,
      notifyWhatsApp: user.notifyWhatsApp,
      notifyEmail: user.notifyEmail,
      notifySms: user.notifySms,
      kycStatus: user.kycStatus,
      suiteCode: user.suiteCode,
      referralCode: user.referralCode,
      wallet: user.wallet,
    },
  });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: body.name ?? user.name,
      preferredPayment: body.preferredPayment ?? user.preferredPayment,
      notifyWhatsApp: body.notifyWhatsApp ?? user.notifyWhatsApp,
      notifyEmail: body.notifyEmail ?? user.notifyEmail,
      notifySms: body.notifySms ?? user.notifySms,
      kycDocumentUrl: body.kycDocumentUrl ?? user.kycDocumentUrl,
      kycStatus: body.kycDocumentUrl ? "pending" : user.kycStatus,
    },
  });
  return NextResponse.json({ user: updated });
}

export async function DELETE() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  // soft-delete style: anonymize
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: "Deleted User",
      phone: null,
      email: `deleted_${user.id}@bridge.invalid`,
      notifyEmail: false,
      notifySms: false,
      notifyWhatsApp: false,
    },
  });
  return NextResponse.json({ ok: true });
}
