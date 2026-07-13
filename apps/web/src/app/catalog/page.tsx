"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { money } from "@/lib/format";
import { CatalogBuyButton } from "@/components/CatalogBuyButton";

type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  hub: string;
  landedPriceUsd: number;
};

export default function CatalogPage() {
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetch(`/api/catalog?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => setProducts(d.products || []));
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="container-bridge py-10">
      <h1 className="display mb-2 text-4xl text-[var(--sea-deep)]">Curated catalog</h1>
      <p className="mb-6 max-w-2xl text-sm text-[var(--ink)]/70">
        Locked landed USD prices — no quote surprises on these SKUs.
      </p>
      <input
        className="input mb-8 max-w-md"
        placeholder="Search beauty, supplements, fashion…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
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
        Prefer any link?{" "}
        <Link href="/app" className="font-semibold text-[var(--sea)]">
          Paste a URL
        </Link>
      </p>
    </div>
  );
}
