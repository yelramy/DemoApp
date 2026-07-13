import { notFound, redirect } from "next/navigation";
import { prisma } from "@bridge/db";
import { getSessionUser } from "@/lib/auth";
import { money, STATUS_LABELS } from "@/lib/format";
import { PayWhishButton } from "@/components/PayWhishButton";
import { OrderActions } from "@/components/OrderActions";

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
      claims: true,
      review: true,
      weightAdjustments: true,
    },
  });
  if (!order || (order.customerId !== user.id && user.role === "CUSTOMER")) {
    notFound();
  }

  const needsWhish =
    order.paymentMethod === "WHISH" &&
    order.payments.every((p) => p.status !== "PAID");
  const needsCard =
    order.paymentMethod === "CARD" &&
    order.payments.every((p) => p.status !== "PAID");
  const photos: string[] = order.hubPhotoUrls
    ? JSON.parse(order.hubPhotoUrls)
    : [];

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
          <div>
            <dt className="text-[var(--ink)]/55">Weight</dt>
            <dd className="font-bold">
              quoted {order.quotedWeightKg ?? "—"} kg
              {order.finalWeightKg ? ` · final ${order.finalWeightKg} kg` : ""}
            </dd>
          </div>
        </dl>
        {order.giftNote ? (
          <p className="mt-4 rounded-xl bg-[var(--sand)] p-3 text-sm">
            Gift note: {order.giftNote}
          </p>
        ) : null}
        {order.weightAdjustments.length > 0 ? (
          <div className="mt-4 rounded-xl bg-[var(--sand)] p-3 text-sm">
            Weight adjustments:{" "}
            {order.weightAdjustments
              .map((w) => `$${w.extraUsd} (${w.status})`)
              .join(", ")}
          </div>
        ) : null}
        {photos.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {photos.map((src) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={src} src={src} alt="Hub intake" className="rounded-xl" />
            ))}
          </div>
        ) : null}
        {(needsWhish || sp.pay === "whish") && (
          <div className="mt-6 rounded-2xl bg-[var(--foam)] p-4">
            <p className="mb-3 text-sm">Complete Whish payment to start buying.</p>
            <PayWhishButton orderId={order.id} />
          </div>
        )}
        {(needsCard || sp.pay === "card") && (
          <div className="mt-6 rounded-2xl bg-[var(--foam)] p-4">
            <p className="mb-3 text-sm">Complete card sandbox payment.</p>
            <OrderActions orderId={order.id} mode="card" />
          </div>
        )}
        {order.paymentMethod === "OMT" &&
          order.payments.every((p) => p.status !== "PAID") && (
            <div className="mt-6 rounded-2xl bg-[var(--foam)] p-4">
              <p className="mb-3 text-sm">Pay via OMT and enter the reference.</p>
              <OrderActions orderId={order.id} mode="omt" />
            </div>
          )}
        <div className="mt-6">
          <OrderActions
            orderId={order.id}
            mode="actions"
            paymentMethod={order.paymentMethod}
            canClaim={["delivered", "completed"].includes(order.status)}
            canReview={["delivered", "completed"].includes(order.status) && !order.review}
          />
        </div>
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
