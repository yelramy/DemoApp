"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OrderActions({
  orderId,
  mode,
  canClaim,
  canReview,
  paymentMethod,
}: {
  orderId: string;
  mode: "card" | "actions" | "omt";
  canClaim?: boolean;
  canReview?: boolean;
  paymentMethod?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [claimReason, setClaimReason] = useState("damage");
  const [rating, setRating] = useState(5);
  const [omtRef, setOmtRef] = useState("");

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

  if (mode === "omt") {
    return (
      <div className="flex flex-wrap gap-2">
        <input
          className="input max-w-[200px]"
          placeholder="OMT reference"
          value={omtRef}
          onChange={(e) => setOmtRef(e.target.value)}
        />
        <button
          className="btn btn-primary"
          type="button"
          onClick={async () => {
            await fetch(`/api/orders/${orderId}/pay-omt`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ reference: omtRef }),
            });
            router.refresh();
          }}
        >
          Confirm OMT
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-black/5 p-4">
      <div className="flex flex-wrap gap-2">
        <a className="btn btn-ghost text-xs" href={`/api/orders/${orderId}/invoice`}>
          Invoice
        </a>
        <button
          className="btn btn-ghost text-xs"
          type="button"
          onClick={async () => {
            const res = await fetch(`/api/orders/${orderId}/reorder`, { method: "POST" });
            const d = await res.json();
            if (d.redirect) router.push(d.redirect);
          }}
        >
          Reorder
        </button>
        <button
          className="btn btn-ghost text-xs text-[var(--danger)]"
          type="button"
          onClick={async () => {
            if (!confirm("Cancel this order?")) return;
            await fetch(`/api/orders/${orderId}/cancel`, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ toWallet: true }),
            });
            router.refresh();
          }}
        >
          Cancel
        </button>
      </div>
      {paymentMethod === "OMT" ? (
        <OrderActions orderId={orderId} mode="omt" />
      ) : null}
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
