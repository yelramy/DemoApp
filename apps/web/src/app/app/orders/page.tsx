import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";
import { money, STATUS_LABELS } from "@/lib/format";

export default async function OrdersPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="container-bridge py-10">
      <h1 className="display mb-6 text-3xl text-[var(--sea-deep)]">Orders</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <Link key={o.id} href={`/app/orders/${o.id}`} className="panel block p-5">
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-semibold">{o.itemTitle}</p>
                <p className="text-xs text-[var(--ink)]/50">{o.publicId}</p>
              </div>
              <p className="font-bold">{money(o.totalUsd)}</p>
            </div>
            <p className="mt-2 text-xs font-bold uppercase text-[var(--sea)]">
              {STATUS_LABELS[o.status] ?? o.status}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
