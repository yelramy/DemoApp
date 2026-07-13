"use client";

import { useState } from "react";
import { money } from "@/lib/format";

export function HubCompare({
  title,
  priceUsd,
  weightKg,
}: {
  title: string;
  priceUsd: number;
  weightKg: number;
}) {
  const [rows, setRows] = useState<
    Array<{ hub: string; total: number; shipping: number; etaDaysMin: number; etaDaysMax: number }>
  >([]);
  const [recommended, setRecommended] = useState<string | null>(null);

  return (
    <div className="mt-6 rounded-2xl border border-black/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-[var(--sea-deep)]">Compare hubs</h3>
        <button
          className="btn btn-ghost text-xs"
          type="button"
          onClick={async () => {
            const res = await fetch("/api/quotes/compare", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ title, priceUsd, estimatedWeightKg: weightKg }),
            });
            const d = await res.json();
            setRows(d.comparisons || []);
            setRecommended(d.recommended?.hub || null);
          }}
        >
          Run compare
        </button>
      </div>
      {rows.length ? (
        <ul className="mt-3 space-y-2 text-sm">
          {rows.map((r) => (
            <li key={r.hub} className="flex justify-between rounded-lg bg-[var(--foam)] px-3 py-2">
              <span>
                {r.hub}
                {recommended === r.hub ? " · recommended" : ""} · ETA {r.etaDaysMin}–{r.etaDaysMax}d
              </span>
              <strong>{money(r.total)}</strong>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
