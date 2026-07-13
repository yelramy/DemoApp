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
  const activeOrders = orders.filter((order) => !["completed", "cancelled", "refunded"].includes(order.status));

  return (
    <div className="container-bridge space-y-4 py-5 sm:space-y-6 sm:py-8">
      <header className="flex items-start justify-between gap-4 px-1">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">Your Bridge</p>
          <h1 className="display mt-1 text-3xl text-[var(--sea-deep)] sm:text-4xl">
            Welcome back, {user.name?.split(" ")[0] ?? "there"}.
          </h1>
        </div>
        <Link href="/app/settings" aria-label="Account settings" className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--sea-deep)] font-extrabold text-[var(--sun)]">
          {(user.name?.[0] ?? "B").toUpperCase()}
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="panel p-4">
          <p className="text-xs font-bold text-[var(--ink)]/48">Wallet</p>
          <p className="mt-1 text-xl font-extrabold text-[var(--sea-deep)]">{money(user.wallet?.balanceUsd ?? 0)}</p>
        </div>
        <div className="panel p-4">
          <p className="text-xs font-bold text-[var(--ink)]/48">Active orders</p>
          <p className="mt-1 text-xl font-extrabold text-[var(--sea-deep)]">{activeOrders.length}</p>
        </div>
        <div className="panel col-span-2 p-4 sm:col-span-1">
          <p className="text-xs font-bold text-[var(--ink)]/48">Your suite</p>
          <p className="mt-1 text-lg font-extrabold tracking-wide text-[var(--sea-deep)]">{user.suiteCode}</p>
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b border-black/[0.06] bg-[var(--foam)]/70 px-4 py-4 sm:px-6">
          <p className="section-kicker">New order</p>
          <h2 className="display mt-1 text-2xl text-[var(--sea-deep)]">Paste a product. Get the full price.</h2>
        </div>
        <div className="p-4 sm:p-6"><QuoteForm /></div>
      </section>

      <section className="panel p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--accent)]">Latest activity</p>
            <h2 className="display mt-1 text-2xl text-[var(--sea-deep)]">Recent orders</h2>
          </div>
          <Link href="/app/orders" className="btn btn-ghost min-h-10 px-3 text-xs">View all</Link>
        </div>
        <div className="space-y-2">
          {orders.length === 0 ? (
            <div className="rounded-2xl bg-[var(--sand)]/60 px-4 py-7 text-center">
              <p className="font-bold text-[var(--sea-deep)]">Nothing here yet</p>
              <p className="mt-1 text-sm text-[var(--ink)]/58">Your first quote starts with the product link above.</p>
            </div>
          ) : orders.map((order) => (
            <Link key={order.id} href={`/app/orders/${order.id}`} className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-3 transition-colors active:bg-[var(--foam)]/60 sm:p-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--foam)] text-sm font-black text-[var(--sea)]">↗</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold">{order.itemTitle}</p>
                <p className="mt-0.5 text-xs font-semibold text-[var(--sea)]">{STATUS_LABELS[order.status] ?? order.status}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-extrabold">{money(order.totalUsd)}</p>
                <p className="mt-0.5 text-[10px] text-[var(--ink)]/42">{order.publicId}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
