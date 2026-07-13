"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [tipUsd, setTipUsd] = useState("0");
  const [useWalletCredit, setUseWalletCredit] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [createPayLink, setCreatePayLink] = useState(false);
  const [payerEmail, setPayerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payLink, setPayLink] = useState<string | null>(null);
  const [depositNote, setDepositNote] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/wallet")
      .then((r) => r.json())
      .then((d) => setWalletBalance(d.balanceUsd || 0))
      .catch(() => null);
  }, []);

  const tip = Number(tipUsd || 0);
  const walletApplied = useWalletCredit ? Math.min(walletBalance, total) : 0;
  const charge = Math.round((total - walletApplied + tip) * 100) / 100;
  const codDeposit =
    method === "COD" && charge > 100 ? Math.round(charge * 0.2 * 100) / 100 : 0;

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    setDepositNote(null);
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
        tipUsd: tip,
        useWalletCredit,
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
    if (data.depositUsd > 0) {
      setDepositNote(`COD deposit due now: ${money(data.depositUsd)}`);
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
    <form onSubmit={submit} className="mt-6 space-y-3 pb-24">
      <p className="text-sm font-semibold">Pay {money(charge)} with</p>
      <div className="grid grid-cols-2 gap-2">
        {(["WHISH", "COD", "OMT", "CARD"] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`btn text-sm ${method === m ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setMethod(m)}
          >
            {m}
          </button>
        ))}
      </div>
      {method === "COD" && codDeposit > 0 ? (
        <p className="rounded-xl bg-[var(--sand)] p-3 text-xs">
          COD over $100 requires ~20% deposit ({money(codDeposit)}) now; remainder on
          delivery.
        </p>
      ) : null}
      <input
        className="input"
        placeholder="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        autoComplete="address-level2"
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
        autoComplete="street-address"
      />
      <details className="rounded-2xl border border-black/5 bg-white/60 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-[var(--sea-deep)]">
          Gift note, tip, pay link
        </summary>
        <div className="mt-3 space-y-2">
          <input
            className="input"
            placeholder="Gift note (optional)"
            value={giftNote}
            onChange={(e) => setGiftNote(e.target.value)}
          />
          <input
            className="input"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            placeholder="Courier tip USD"
            value={tipUsd}
            onChange={(e) => setTipUsd(e.target.value)}
          />
          {walletBalance > 0 ? (
            <label className="flex min-h-12 items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={useWalletCredit}
                onChange={(e) => setUseWalletCredit(e.target.checked)}
              />
              Use wallet ({money(walletBalance)})
            </label>
          ) : null}
          <label className="flex min-h-12 items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="h-5 w-5"
              checked={createPayLink}
              onChange={(e) => setCreatePayLink(e.target.checked)}
            />
            Diaspora pay link instead
          </label>
          {createPayLink ? (
            <input
              className="input"
              placeholder="Payer email"
              inputMode="email"
              value={payerEmail}
              onChange={(e) => setPayerEmail(e.target.value)}
            />
          ) : null}
        </div>
      </details>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      {depositNote ? <p className="text-sm text-[var(--ok)]">{depositNote}</p> : null}
      {payLink ? (
        <p className="rounded-xl bg-[var(--foam)] p-3 text-sm">
          Share pay link:{" "}
          <a className="font-semibold text-[var(--sea)]" href={payLink}>
            {payLink}
          </a>
        </p>
      ) : null}

      <div className="sticky-cta">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="text-[var(--ink)]/65">Due now</span>
          <strong className="display text-xl text-[var(--sea-deep)]">{money(charge)}</strong>
        </div>
        <button className="btn btn-primary w-full" disabled={loading} type="submit">
          {loading
            ? "Placing order…"
            : createPayLink
              ? "Create pay link"
              : `Confirm · ${method}`}
        </button>
      </div>
    </form>
  );
}
