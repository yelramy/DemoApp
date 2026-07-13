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
  const [method, setMethod] = useState<"WHISH" | "COD" | "OMT" | "CARD">("WHISH");
  const [city, setCity] = useState("Beirut");
  const [area, setArea] = useState("Achrafieh");
  const [street, setStreet] = useState("");
  const [giftNote, setGiftNote] = useState("");
  const [createPayLink, setCreatePayLink] = useState(false);
  const [payerEmail, setPayerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payLink, setPayLink] = useState<string | null>(null);

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
        giftNote,
        createPayLink,
        payerEmail: payerEmail || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error?.message ?? "Checkout failed");
      return;
    }
    if (data.payLink) {
      setPayLink(data.payLink);
      return;
    }
    if (method === "WHISH") router.push(`/app/orders/${data.orderId}?pay=whish`);
    else if (method === "CARD") router.push(`/app/orders/${data.orderId}?pay=card`);
    else router.push(`/app/orders/${data.orderId}`);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-3">
      <p className="text-sm font-semibold">Pay {money(total)} with</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(["WHISH", "COD", "OMT", "CARD"] as const).map((m) => (
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
      <input
        className="input"
        placeholder="Gift note (optional)"
        value={giftNote}
        onChange={(e) => setGiftNote(e.target.value)}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={createPayLink}
          onChange={(e) => setCreatePayLink(e.target.checked)}
        />
        Create diaspora pay link instead of paying now
      </label>
      {createPayLink ? (
        <input
          className="input"
          placeholder="Payer email"
          value={payerEmail}
          onChange={(e) => setPayerEmail(e.target.value)}
        />
      ) : null}
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      {payLink ? (
        <p className="rounded-xl bg-[var(--foam)] p-3 text-sm">
          Share pay link: <a className="font-semibold text-[var(--sea)]" href={payLink}>{payLink}</a>
        </p>
      ) : null}
      <button className="btn btn-primary w-full" disabled={loading} type="submit">
        {loading ? "Placing order…" : createPayLink ? "Create pay link" : "Confirm order"}
      </button>
    </form>
  );
}
