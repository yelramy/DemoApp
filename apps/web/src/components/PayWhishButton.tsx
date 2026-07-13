"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PayWhishButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function pay() {
    setLoading(true);
    await fetch(`/api/orders/${orderId}/pay-whish`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button className="btn btn-primary" disabled={loading} onClick={pay} type="button">
      {loading ? "Confirming…" : "Simulate Whish pay"}
    </button>
  );
}
