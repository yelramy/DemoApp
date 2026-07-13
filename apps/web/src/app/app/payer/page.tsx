"use client";

import { useEffect, useState } from "react";
import { money } from "@/lib/format";

type PayLink = {
  id: string;
  token: string;
  payerEmail: string | null;
  order: { publicId: string; itemTitle: string; totalUsd: number; status: string };
};

export default function PayerDashboardPage() {
  const [payLinks, setPayLinks] = useState<PayLink[]>([]);
  const [currencies, setCurrencies] = useState<Array<{ code: string; rate: number }>>([
    { code: "USD", rate: 1 },
  ]);
  const [display, setDisplay] = useState("USD");

  useEffect(() => {
    fetch("/api/payer/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setPayLinks(d.payLinks || []);
        if (d.displayCurrencies?.length) setCurrencies(d.displayCurrencies);
      });
  }, []);

  const fx = currencies.find((c) => c.code === display)?.rate || 1;
  function show(usd: number) {
    if (display === "USD") return money(usd);
    const local = Math.round((usd / fx) * 100) / 100;
    return `${local} ${display} (~${money(usd)})`;
  }

  return (
    <div className="container-bridge py-10">
      <h1 className="display mb-2 text-3xl text-[var(--sea-deep)]">Payer dashboard</h1>
      <p className="mb-6 text-sm text-[var(--ink)]/65">
        Pay links you created or received · remittance alternative for family shopping.
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        {currencies.map((c) => (
          <button
            key={c.code}
            type="button"
            className={`btn text-xs ${display === c.code ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setDisplay(c.code)}
          >
            {c.code}
          </button>
        ))}
        <a className="btn btn-ghost text-xs" href="/pay-for-family">
          New family pay
        </a>
        <a className="btn btn-ghost text-xs" href="/app/family">
          Essentials lists
        </a>
      </div>
      <div className="space-y-3">
        {payLinks.length === 0 ? (
          <p className="panel p-6 text-sm text-[var(--ink)]/65">No pay links yet.</p>
        ) : (
          payLinks.map((p) => (
            <div key={p.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="font-semibold">{p.order.publicId}</div>
                <div className="text-sm text-[var(--ink)]/65">{p.order.itemTitle}</div>
                <div className="text-xs">{p.order.status}</div>
              </div>
              <div className="text-right">
                <div className="display text-xl text-[var(--sea-deep)]">
                  {show(p.order.totalUsd)}
                </div>
                <a className="text-sm font-semibold text-[var(--sea)]" href={`/pay/${p.token}`}>
                  Open pay link
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
