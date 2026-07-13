"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CatalogBuyButton({ slug }: { slug: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function buy() {
    setLoading(true);
    const res = await fetch("/api/quotes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ catalogSlug: slug }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) router.push(`/app/quote/${data.quoteId}`);
  }
  return (
    <button className="btn btn-primary mt-4 w-full" disabled={loading} onClick={buy} type="button">
      {loading ? "…" : "Buy at landed price"}
    </button>
  );
}
