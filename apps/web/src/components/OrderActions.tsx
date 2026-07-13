"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OrderActions({
  orderId,
  mode,
  canClaim,
  canReview,
}: {
  orderId: string;
  mode: "card" | "actions";
  canClaim?: boolean;
  canReview?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [claimReason, setClaimReason] = useState("damage");
  const [rating, setRating] = useState(5);

  if (mode === "card") {
    return (
      <button
        className="btn btn-primary"
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          await fetch(`/api/orders/${orderId}/pay-card`, { method: "POST" });
          setLoading(false);
          router.refresh();
        }}
      >
        {loading ? "…" : "Simulate card pay"}
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-black/5 p-4">
      <a className="btn btn-ghost text-xs" href={`/api/orders/${orderId}/invoice`}>
        Download invoice
      </a>
      {canClaim ? (
        <div className="flex flex-wrap gap-2">
          <select
            className="input max-w-[160px] py-2"
            value={claimReason}
            onChange={(e) => setClaimReason(e.target.value)}
          >
            <option value="damage">Damage</option>
            <option value="missing">Missing</option>
            <option value="wrong_item">Wrong item</option>
          </select>
          <button
            className="btn btn-ghost text-xs"
            type="button"
            onClick={async () => {
              await fetch(`/api/orders/${orderId}/claims`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ reason: claimReason }),
              });
              router.refresh();
            }}
          >
            Open claim
          </button>
        </div>
      ) : null}
      {canReview ? (
        <div className="flex flex-wrap gap-2">
          <input
            className="input max-w-[100px] py-2"
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          />
          <button
            className="btn btn-primary text-xs"
            type="button"
            onClick={async () => {
              await fetch(`/api/orders/${orderId}/reviews`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ rating, body: "Great delivery" }),
              });
              router.refresh();
            }}
          >
            Submit review
          </button>
        </div>
      ) : null}
    </div>
  );
}
