import { prisma } from "@bridge/db";

export default async function TrustPage() {
  const reviews = await prisma.review.findMany({
    take: 12,
    orderBy: { createdAt: "desc" },
    include: { user: true, order: true },
  });
  return (
    <div className="container-bridge py-16">
      <h1 className="display mb-4 text-4xl text-[var(--sea-deep)]">Trust</h1>
      <p className="mb-8 max-w-2xl text-sm text-[var(--ink)]/70">
        All-in quotes, hub intake photos, delivery OTP, and partner insurance caps disclosed at checkout.
        Typical timeline: buy → UAE hub (2–5d) → Lebanon (8–16d total common).
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {reviews.length === 0 ? (
          <div className="panel p-6 text-sm">Reviews appear after delivered orders.</div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="panel p-5">
              <p className="font-bold text-[var(--accent)]">{"★".repeat(r.rating)}</p>
              <p className="mt-2 text-sm">{r.body || "Great delivery"}</p>
              <p className="mt-2 text-xs text-[var(--ink)]/50">
                {r.user.name || "Customer"} · {r.order.publicId}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
