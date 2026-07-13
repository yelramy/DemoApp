"use client";

import { useEffect, useState } from "react";

type Batch = {
  id: string;
  label: string;
  status: string;
  orders: Array<{ id: string; publicId: string; itemTitle: string }>;
  manifest: { flightRef: string | null } | null;
};

export default function PartnerPage() {
  const [orderId, setOrderId] = useState("");
  const [eventType, setEventType] = useState("received");
  const [weight, setWeight] = useState("1.2");
  const [photo, setPhoto] = useState("https://placehold.co/400x300/png?text=Hub+Photo");
  const [result, setResult] = useState<string | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [expected, setExpected] = useState<Array<{ id: string; publicId: string }>>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const apiKey = "partner-demo-key";

  async function refresh() {
    const [b, e] = await Promise.all([
      fetch("/api/partner/batches", { headers: { "x-api-key": apiKey } }).then((r) => r.json()),
      fetch("/api/partner/events", { headers: { "x-api-key": apiKey } }).then((r) => r.json()),
    ]);
    setBatches(b.batches || []);
    setExpected(e.expected || []);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function submitEvent(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/partner/events", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        event_id: crypto.randomUUID(),
        event_type: eventType,
        order_id: orderId,
        tracking: `DXB-${Date.now()}`,
        weight_kg: Number(weight),
        photo_urls: [photo],
      }),
    });
    const data = await res.json();
    setResult(res.ok ? "Event accepted" : JSON.stringify(data));
    refresh();
  }

  return (
    <div className="container-bridge space-y-8 py-10">
      <div>
        <h1 className="display text-3xl text-[var(--sea-deep)]">Partner portal</h1>
        <p className="text-sm text-[var(--ink)]/65">
          Demo UAE hub · API key <code>partner-demo-key</code> (US: partner-us-demo-key)
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={submitEvent} className="panel space-y-3 p-6">
          <h2 className="display text-xl">Post inbound / transit event</h2>
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
          <input
            className="input"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Weight kg"
          />
          <input
            className="input"
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
            placeholder="Photo URL"
          />
          <button className="btn btn-primary w-full" type="submit">
            Post event
          </button>
          {result ? <p className="text-sm font-semibold text-[var(--ok)]">{result}</p> : null}
        </form>

        <div className="panel p-6">
          <h2 className="display mb-3 text-xl">Expected at hub</h2>
          <div className="max-h-80 space-y-2 overflow-auto text-sm">
            {expected.map((o) => (
              <label key={o.id} className="flex gap-2 rounded-lg border border-black/5 p-2">
                <input
                  type="checkbox"
                  checked={selected.includes(o.id)}
                  onChange={(e) =>
                    setSelected((s) =>
                      e.target.checked ? [...s, o.id] : s.filter((x) => x !== o.id),
                    )
                  }
                />
                <button
                  type="button"
                  className="text-left"
                  onClick={() => setOrderId(o.publicId)}
                >
                  {o.publicId}
                </button>
              </label>
            ))}
          </div>
          <button
            className="btn btn-ghost mt-4"
            type="button"
            disabled={!selected.length}
            onClick={async () => {
              const res = await fetch("/api/partner/batches", {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                  "x-api-key": apiKey,
                },
                body: JSON.stringify({ orderIds: selected }),
              });
              const batch = (await res.json()).batch;
              if (batch?.id) {
                await fetch("/api/partner/manifests", {
                  method: "POST",
                  headers: {
                    "content-type": "application/json",
                    "x-api-key": apiKey,
                  },
                  body: JSON.stringify({ batchId: batch.id }),
                });
              }
              setSelected([]);
              refresh();
            }}
          >
            Batch + manifest selected
          </button>
        </div>
      </div>

      <div className="panel p-6">
        <h2 className="display mb-3 text-xl">Batches</h2>
        <div className="space-y-3 text-sm">
          {batches.map((b) => (
            <div key={b.id} className="rounded-xl border border-black/5 p-3">
              <strong>{b.label}</strong> · {b.status}
              {b.manifest?.flightRef ? ` · ${b.manifest.flightRef}` : ""}
              <div className="text-xs text-[var(--ink)]/55">
                {b.orders.map((o) => o.publicId).join(", ")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
