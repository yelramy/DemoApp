import { redirect } from "next/navigation";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";
import { money, STATUS_LABELS } from "@/lib/format";
import { AdminTransitionForm } from "@/components/AdminTransitionForm";

export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "ADMIN" && user.role !== "OPS") redirect("/app");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { customer: true },
  });
  const buyQueue = orders.filter((o) =>
    ["paid", "buy_in_progress"].includes(o.status),
  );

  return (
    <div className="container-bridge space-y-8 py-10">
      <div>
        <h1 className="display text-4xl text-[var(--sea-deep)]">Admin</h1>
        <p className="text-sm text-[var(--ink)]/65">
          Buy queue and order board · signed in as {user.email ?? user.phone}
        </p>
      </div>

      <section className="panel p-6">
        <h2 className="display mb-4 text-2xl">Buy queue ({buyQueue.length})</h2>
        <div className="space-y-4">
          {buyQueue.map((o) => (
            <div key={o.id} className="rounded-2xl border border-black/5 bg-white/80 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{o.itemTitle}</p>
                  <p className="text-xs text-[var(--ink)]/50">
                    {o.publicId} · {o.customer.name ?? o.customer.phone}
                  </p>
                  <a
                    className="text-sm font-semibold text-[var(--sea)]"
                    href={o.itemUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open product
                  </a>
                </div>
                <p className="font-bold">{money(o.totalUsd)}</p>
              </div>
              <AdminTransitionForm orderId={o.id} status={o.status} />
            </div>
          ))}
          {buyQueue.length === 0 ? (
            <p className="text-sm text-[var(--ink)]/55">Queue clear.</p>
          ) : null}
        </div>
      </section>

      <section className="panel p-6">
        <h2 className="display mb-4 text-2xl">All orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-[var(--ink)]/55">
                <th className="py-2">Order</th>
                <th>Status</th>
                <th>Total</th>
                <th>Pay</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-black/5">
                  <td className="py-3">
                    <div className="font-semibold">{o.itemTitle}</div>
                    <div className="text-xs text-[var(--ink)]/45">{o.publicId}</div>
                  </td>
                  <td>{STATUS_LABELS[o.status] ?? o.status}</td>
                  <td>{money(o.totalUsd)}</td>
                  <td>{o.paymentMethod}</td>
                  <td>
                    <AdminTransitionForm orderId={o.id} status={o.status} compact />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
