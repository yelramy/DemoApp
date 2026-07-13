"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { money } from "@/lib/format";

export default function ShareCartPage() {
  const { token } = useParams<{ token: string }>();
  const [payload, setPayload] = useState<{ items?: Array<{ title: string; priceUsd: number }> } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/cart/share?token=${token}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) setError("Link expired");
        else setPayload(d.payload);
      })
      .catch(() => setError("Failed"));
  }, [token]);

  if (error) {
    return <div className="container-bridge py-16 panel p-8">{error}</div>;
  }
  if (!payload) return <div className="container-bridge py-16">Loading…</div>;

  return (
    <div className="container-bridge py-16">
      <div className="panel mx-auto max-w-lg p-8">
        <h1 className="display text-3xl text-[var(--sea-deep)]">Shared cart</h1>
        <ul className="mt-6 space-y-2 text-sm">
          {(payload.items || []).map((i, idx) => (
            <li key={idx} className="flex justify-between gap-3 rounded-xl bg-[var(--foam)] px-3 py-2">
              <span>{i.title}</span>
              <strong>{money(i.priceUsd)}</strong>
            </li>
          ))}
        </ul>
        <a className="btn btn-primary mt-6" href="/login">
          Log in to buy this for family
        </a>
      </div>
    </div>
  );
}
