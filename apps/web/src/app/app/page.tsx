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
    take: 8,
  });

  return (
    <div className="container-bridge space-y-6 py-10">
      <div className="flex flex-wrap gap-2 text-sm font-semibold">
        {[
          ["/app/suite", "Suite"],
          ["/app/support", "Support"],
          ["/app/family", "Family"],
          ["/catalog", "Catalog"],
          ["/extension", "Extension"],
          ["/app/addresses", "Addresses"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="btn btn-ghost text-xs">
            {label}
          </Link>
        ))}
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="panel p-6 md:p-8">
          <h1 className="display mb-2 text-3xl text-[var(--sea-deep)]">
            Hi {user.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="mb-2 text-sm text-[var(--ink)]/70">
            Suite ID: <strong>{user.suiteCode}</strong> · Referral:{" "}
            <strong>{user.referralCode}</strong>
          </p>
          <p className="mb-6 text-sm text-[var(--ink)]/70">
            Wallet: {money(user.wallet?.balanceUsd ?? 0)}
          </p>
          <QuoteForm />
        </section>
        <section className="panel p-6 md:p-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="display text-2xl text-[var(--sea-deep)]">Your orders</h2>
            <Link href="/app/orders" className="text-sm font-semibold text-[var(--sea)]">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-sm text-[var(--ink)]/60">
                No orders yet. Paste a link to start.
              </p>
            ) : (
              orders.map((o) => (
                <Link
                  key={o.id}
                  href={`/app/orders/${o.id}`}
                  className="block rounded-2xl border border-black/5 bg-white/70 p-4 transition hover:border-[var(--sea)]/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{o.itemTitle}</p>
                      <p className="text-xs text-[var(--ink)]/55">{o.publicId}</p>
                    </div>
                    <p className="text-sm font-bold">{money(o.totalUsd)}</p>
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
    </div>
  );
}
