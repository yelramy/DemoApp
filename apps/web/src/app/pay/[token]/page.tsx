"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { money } from "@/lib/format";

export default function DiasporaPayPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<{
    publicId: string;
    itemTitle: string;
    totalUsd: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/pay-links/${token}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) setError("Pay link invalid or expired");
        else setOrder(d.order);
      })
      .catch(() => setError("Failed to load"));
  }, [token]);

  async function pay(method: "CARD" | "WHISH") {
    const res = await fetch(`/api/pay-links/${token}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ method }),
    });
    if (res.ok) router.push("/pay-for-family?paid=1");
  }

  if (error) {
    return (
      <div className="container-bridge py-16">
        <div className="panel p-8 text-[var(--danger)]">{error}</div>
      </div>
    );
  }
  if (!order) return <div className="container-bridge py-16">Loading…</div>;

  return (
    <div className="container-bridge py-16">
      <div className="panel mx-auto max-w-lg p-8">
        <h1 className="display text-3xl text-[var(--sea-deep)]">Pay for family</h1>
        <p className="mt-2 text-sm text-[var(--ink)]/65">{order.publicId}</p>
        <p className="mt-4 font-semibold">{order.itemTitle}</p>
        <p className="display mt-2 text-3xl">{money(order.totalUsd)}</p>
        <div className="mt-6 flex flex-col gap-2">
          <button className="btn btn-primary" type="button" onClick={() => pay("CARD")}>
            Pay with card (sandbox)
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => pay("WHISH")}>
            Pay with Whish (sandbox)
          </button>
        </div>
      </div>
    </div>
  );
}
