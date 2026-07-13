"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const NEXT: Record<string, string[]> = {
  paid: ["buy_in_progress"],
  buy_in_progress: ["purchased"],
  purchased: ["awaiting_inbound"],
  awaiting_inbound: ["received_at_hub"],
  received_at_hub: ["consolidated"],
  consolidated: ["in_transit_to_lebanon"],
  in_transit_to_lebanon: ["customs_clearance"],
  customs_clearance: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: ["completed"],
};

export function AdminTransitionForm({
  orderId,
  status,
  compact,
}: {
  orderId: string;
  status: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const options = NEXT[status] ?? [];
  const [next, setNext] = useState(options[0] ?? "");
  const [loading, setLoading] = useState(false);

  if (!options.length) return null;

  async function run() {
    setLoading(true);
    await fetch(`/api/admin/orders/${orderId}/transition`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        status: next,
        message: `Ops moved order to ${next}`,
        retailerOrderId: next === "purchased" ? `RET-${Date.now()}` : undefined,
      }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${compact ? "" : "mt-3"}`}>
      <select
        className="input max-w-[220px] py-2"
        value={next}
        onChange={(e) => setNext(e.target.value)}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <button className="btn btn-primary text-xs" disabled={loading} onClick={run} type="button">
        {loading ? "…" : "Advance"}
      </button>
    </div>
  );
}
