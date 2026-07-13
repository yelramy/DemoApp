import { prisma } from "@bridge/db";

export default async function HubsPage() {
  const [rates, areas] = await Promise.all([
    prisma.rateCardConfig.findMany({ where: { active: true }, orderBy: { hub: "asc" } }),
    prisma.deliveryArea.findMany({ where: { active: true }, orderBy: { city: "asc" } }),
  ]);
  return (
    <div className="container-bridge py-16">
      <h1 className="display mb-4 text-4xl text-[var(--sea-deep)]">Hubs & delivery</h1>
      <p className="mb-8 max-w-2xl text-sm text-[var(--ink)]/70">
        UAE is default. US/TR/CN available by product. Door delivery nationwide with area COD rules.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <h2 className="display text-xl">Shipping hubs</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {rates.map((r) => (
              <li key={r.id} className="rounded-xl bg-[var(--foam)] px-3 py-2">
                <strong>{r.hub}</strong> {r.method} · ${r.pricePerKg}/kg · min ${r.minCharge}
              </li>
            ))}
          </ul>
        </div>
        <div className="panel p-6">
          <h2 className="display text-xl">Lebanon delivery areas</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {areas.map((a) => (
              <li key={a.id} className="rounded-xl bg-[var(--foam)] px-3 py-2">
                {a.city} / {a.area} · COD{" "}
                {a.codAllowed ? `up to $${a.codMaxUsd}` : "unavailable"}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
