"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { money } from "@/lib/format";

export default function CartPage() {
  const router = useRouter();
  const [data, setData] = useState<{
    items: Array<{
      id: string;
      title: string;
      priceUsd: number;
      quantity: number;
      hub: string;
    }>;
    breakdown: { total: number; chargeableKg: number } | null;
  } | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/cart");
    setData(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  if (!data) return <div className="container-bridge py-10">Loading cart…</div>;

  return (
    <div className="container-bridge py-10">
      <h1 className="display mb-6 text-3xl text-[var(--sea-deep)]">Cart</h1>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          {data.items.length === 0 ? (
            <p className="panel p-6 text-sm">Cart is empty.</p>
          ) : (
            data.items.map((i) => (
              <div key={i.id} className="panel flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">{i.title}</p>
                  <p className="text-xs text-[var(--ink)]/55">
                    {i.hub} · qty {i.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold">{money(i.priceUsd * i.quantity)}</span>
                  <button
                    className="btn btn-ghost text-xs"
                    type="button"
                    onClick={async () => {
                      await fetch("/api/cart", {
                        method: "DELETE",
                        headers: { "content-type": "application/json" },
                        body: JSON.stringify({ id: i.id }),
                      });
                      load();
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="panel space-y-3 p-6">
          <p className="text-sm">
            Estimated total:{" "}
            <strong>{data.breakdown ? money(data.breakdown.total) : "—"}</strong>
          </p>
          <button
            className="btn btn-primary w-full"
            type="button"
            disabled={!data.items.length}
            onClick={async () => {
              const res = await fetch("/api/cart/checkout", { method: "POST" });
              const d = await res.json();
              if (d.quoteId) router.push(`/app/quote/${d.quoteId}`);
            }}
          >
            Quote cart
          </button>
          <button
            className="btn btn-ghost w-full"
            type="button"
            disabled={!data.items.length}
            onClick={async () => {
              const res = await fetch("/api/cart/share", { method: "POST" });
              const d = await res.json();
              setShareUrl(d.url);
            }}
          >
            Share cart link
          </button>
          {shareUrl ? (
            <a className="block text-sm font-semibold text-[var(--sea)]" href={shareUrl}>
              {shareUrl}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
