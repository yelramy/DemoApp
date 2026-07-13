import Link from "next/link";
import { prisma } from "@bridge/db";
import { money } from "@/lib/format";
import { CatalogBuyButton } from "@/components/CatalogBuyButton";

export default async function CatalogPage() {
  const products = await prisma.catalogProduct.findMany({
    where: { active: true },
    orderBy: { title: "asc" },
  });
  return (
    <div className="container-bridge py-10">
      <h1 className="display mb-2 text-4xl text-[var(--sea-deep)]">Curated catalog</h1>
      <p className="mb-8 max-w-2xl text-sm text-[var(--ink)]/70">
        Locked landed USD prices — no quote surprises on these SKUs.
      </p>
      <div className="grid gap-5 md:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="panel flex flex-col p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--accent)]">
              {p.category} · {p.hub}
            </p>
            <h2 className="display mt-2 text-xl text-[var(--sea-deep)]">{p.title}</h2>
            <p className="mt-2 flex-1 text-sm text-[var(--ink)]/65">{p.description}</p>
            <p className="mt-4 text-lg font-bold">{money(p.landedPriceUsd)} all-in</p>
            <CatalogBuyButton slug={p.slug} />
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm">
        Prefer any link? <Link href="/app" className="font-semibold text-[var(--sea)]">Paste a URL</Link>
      </p>
    </div>
  );
}
