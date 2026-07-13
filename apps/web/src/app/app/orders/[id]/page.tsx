import { notFound, redirect } from "next/navigation";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";
import { money, STATUS_LABELS } from "@/lib/format";
import { PayWhishButton } from "@/components/PayWhishButton";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pay?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const sp = await searchParams;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      events: { orderBy: { createdAt: "asc" } },
      payments: true,
      address: true,
    },
  });
  if (!order || (order.customerId !== user.id && user.role === "CUSTOMER")) {
    notFound();
  }

  const needsWhish =
    order.paymentMethod === "WHISH" &&
    order.payments.some((p) => p.status !== "PAID");

  return (
    <div className="container-bridge grid gap-8 py-10 lg:grid-cols-[1fr_0.85fr]">
      <section className="panel p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--mist)]">
          {order.publicId}
        </p>
        <h1 className="display mb-2 text-3xl text-[var(--sea-deep)]">
          {order.itemTitle}
        </h1>
        <p className="mb-6 text-sm font-semibold text-[var(--sea)]">
          {STATUS_LABELS[order.status] ?? order.status}
        </p>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--ink)]/55">Total</dt>
            <dd className="font-bold">{money(order.totalUsd)}</dd>
          </div>
          <div>
            <dt className="text-[var(--ink)]/55">Payment</dt>
            <dd className="font-bold">{order.paymentMethod}</dd>
          </div>
          <div>
            <dt className="text-[var(--ink)]/55">Deliver to</dt>
            <dd className="font-bold">
              {order.address
                ? `${order.address.area}, ${order.address.city}`
                : "—"}
            </dd>
          </div>
        </dl>
        {(needsWhish || sp.pay === "whish") && (
          <div className="mt-6 rounded-2xl bg-[var(--foam)] p-4">
            <p className="mb-3 text-sm">
              Complete Whish payment to start buying your item.
            </p>
            <PayWhishButton orderId={order.id} />
          </div>
        )}
      </section>
      <section className="panel p-6 md:p-8">
        <h2 className="display mb-4 text-2xl text-[var(--sea-deep)]">Timeline</h2>
        <ol className="space-y-4">
          {order.events.map((ev) => (
            <li key={ev.id} className="border-l-2 border-[var(--sea)]/30 pl-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--sea)]">
                {STATUS_LABELS[ev.status] ?? ev.status}
              </p>
              <p className="text-sm">{ev.message}</p>
              <p className="text-xs text-[var(--ink)]/45">
                {ev.createdAt.toLocaleString()}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
