import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";
import { QuoteForm } from "@/components/QuoteForm";
import { money, STATUS_LABELS } from "@/lib/format";

export default async function AppHome() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="container-bridge space-y-5 py-5 sm:space-y-6 sm:py-8">
      <section className="panel p-4 sm:p-6 md:p-8">
        <h1 className="display mb-1 text-2xl text-[var(--sea-deep)] sm:mb-2 sm:text-3xl">
          Hi {user.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mb-4 text-sm text-[var(--ink)]/70">
          Wallet {money(user.wallet?.balanceUsd ?? 0)} · Suite{" "}
          <strong>{user.suiteCode}</strong>
        </p>
        <QuoteForm />
      </section>

      <section className="panel p-4 sm:p-6 md:p-8">
        <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
          <h2 className="display text-xl text-[var(--sea-deep)] sm:text-2xl">Recent orders</h2>
          <Link href="/app/orders" className="text-sm font-semibold text-[var(--sea)]">
            View all
          </Link>
        </div>
        <div className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-sm text-[var(--ink)]/60">
              No orders yet. Paste a link above to start.
            </p>
          ) : (
            orders.map((o) => (
              <Link
                key={o.id}
                href={`/app/orders/${o.id}`}
                className="block rounded-2xl border border-black/5 bg-white/70 p-4 active:border-[var(--sea)]/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{o.itemTitle}</p>
                    <p className="text-xs text-[var(--ink)]/55">{o.publicId}</p>
                  </div>
                  <p className="shrink-0 text-sm font-bold">{money(o.totalUsd)}</p>
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[var(--sea)]">
                  {STATUS_LABELS[o.status] ?? o.status}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
