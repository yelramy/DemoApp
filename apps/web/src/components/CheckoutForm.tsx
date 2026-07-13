"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { money } from "@/lib/format";

export function CheckoutForm({
  quoteId,
  total,
}: {
  quoteId: string;
  total: number;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<"WHISH" | "COD" | "OMT">("WHISH");
  const [city, setCity] = useState("Beirut");
  const [area, setArea] = useState("Achrafieh");
  const [street, setStreet] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        quoteId,
        paymentMethod: method,
        city,
        area,
        street: street || "Street TBD",
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error?.message ?? "Checkout failed");
      return;
    }
    if (method === "WHISH") {
      router.push(`/app/orders/${data.orderId}?pay=whish`);
    } else {
      router.push(`/app/orders/${data.orderId}`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-3">
      <p className="text-sm font-semibold">Pay {money(total)} with</p>
      <div className="grid grid-cols-3 gap-2">
        {(["WHISH", "COD", "OMT"] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`btn text-xs ${method === m ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setMethod(m)}
          >
            {m}
          </button>
        ))}
      </div>
      <input
        className="input"
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        required
      />
      <input
        className="input"
        placeholder="Area"
        value={area}
        onChange={(e) => setArea(e.target.value)}
        required
      />
      <input
        className="input"
        placeholder="Street / building"
        value={street}
        onChange={(e) => setStreet(e.target.value)}
      />
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <button className="btn btn-primary w-full" disabled={loading} type="submit">
        {loading ? "Placing order…" : "Confirm order"}
      </button>
    </form>
  );
}
