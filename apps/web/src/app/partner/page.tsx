"use client";

import { useState } from "react";

export default function PartnerPage() {
  const [orderId, setOrderId] = useState("");
  const [eventType, setEventType] = useState("received");
  const [result, setResult] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/partner/events", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": "partner-demo-key",
      },
      body: JSON.stringify({
        event_id: crypto.randomUUID(),
        event_type: eventType,
        order_id: orderId,
        tracking: `DXB-${Date.now()}`,
        weight_kg: 1.2,
      }),
    });
    const data = await res.json();
    setResult(res.ok ? "Event accepted" : JSON.stringify(data));
  }

  return (
    <div className="container-bridge py-10">
      <div className="panel mx-auto max-w-xl p-8">
        <h1 className="display mb-2 text-3xl text-[var(--sea-deep)]">Partner portal</h1>
        <p className="mb-6 text-sm text-[var(--ink)]/65">
          Demo UAE hub · API key <code>partner-demo-key</code>
        </p>
        <form onSubmit={submit} className="space-y-3">
          <input
            className="input"
            placeholder="Order id or publicId"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            required
          />
          <select
            className="input"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
          >
            {["received", "weighed", "departed", "customs", "delivered", "exception"].map(
              (t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ),
            )}
          </select>
          <button className="btn btn-primary w-full" type="submit">
            Post event
          </button>
        </form>
        {result ? <p className="mt-4 text-sm font-semibold text-[var(--ok)]">{result}</p> : null}
      </div>
    </div>
  );
}
