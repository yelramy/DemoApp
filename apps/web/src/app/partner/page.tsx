"use client";

import { useCallback, useEffect, useState } from "react";

type Batch = {
  id: string;
  label: string;
  status: string;
  orders: Array<{ id: string; publicId: string; itemTitle: string }>;
  manifest: { flightRef: string | null } | null;
};

type Invoice = {
  id: string;
  weekOf: string;
  amountUsd: number;
  kgTotal: number;
  status: string;
};

export default function PartnerPage() {
  const [orderId, setOrderId] = useState("");
  const [eventType, setEventType] = useState("received");
  const [weight, setWeight] = useState("1.2");
  const [photo, setPhoto] = useState("https://placehold.co/400x300/png?text=Hub+Photo");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [expected, setExpected] = useState<Array<{ id: string; publicId: string }>>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [ratePreview, setRatePreview] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("partner-demo-key");
  const [email, setEmail] = useState("uae@partner.bridge");
  const [code, setCode] = useState("246810");
  const [partnerName, setPartnerName] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const headers = { "x-api-key": apiKey };
    const [b, e, inv] = await Promise.all([
      fetch("/api/partner/batches", { headers }).then((r) => r.json()),
      fetch("/api/partner/events", { headers }).then((r) => r.json()),
      fetch("/api/partner/invoices", { headers }).then((r) => r.json()),
    ]);
    setBatches(b.batches || []);
    setExpected(e.expected || []);
    setInvoices(inv.invoices || []);
  }, [apiKey]);

  useEffect(() => {
    fetch("/api/partner/login")
      .then((r) => r.json())
      .then((d) => {
        if (d.partner?.apiKey) {
          setApiKey(d.partner.apiKey);
          setPartnerName(d.partner.name);
        }
      });
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/partner/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (!res.ok) {
      setResult("Login failed");
      return;
    }
    setApiKey(data.partner.apiKey);
    setPartnerName(data.partner.name);
    setResult(`Logged in as ${data.partner.name}`);
  }

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
        notes: notes || undefined,
      }),
    });
    const data = await res.json();
    setResult(
      res.ok
        ? data.duplicate
          ? "Duplicate event ignored (idempotent)"
          : data.matchedSuite
            ? `Matched suite parcel ${data.matchedSuite}`
            : "Event accepted"
        : JSON.stringify(data),
    );
    refresh();
  }

  return (
    <div className="container-bridge space-y-8 py-10">
      <div>
        <h1 className="display text-3xl text-[var(--sea-deep)]">Partner portal</h1>
        <p className="text-sm text-[var(--ink)]/65">
          {partnerName ? `${partnerName} · ` : ""}
          API key <code>{apiKey}</code>
        </p>
      </div>

      <form onSubmit={login} className="panel grid gap-3 p-6 sm:grid-cols-4">
        <input
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Partner email"
        />
        <input
          className="input"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Login code"
        />
        <button className="btn btn-primary" type="submit">
          Partner login
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={async () => {
            const res = await fetch(
              `/api/partner/rates?hub=UAE&kg=${encodeURIComponent(weight)}`,
            );
            const d = await res.json();
            setRatePreview(d.price != null ? `UAE ${weight}kg → $${d.price}` : "No rate");
          }}
        >
          Rate preview
        </button>
        {ratePreview ? (
          <p className="sm:col-span-4 text-sm text-[var(--ok)]">{ratePreview}</p>
        ) : null}
      </form>

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
            {[
              "received",
              "weighed",
              "departed",
              "customs",
              "delivered",
              "exception",
              "discrepancy",
            ].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
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
          {eventType === "discrepancy" ? (
            <input
              className="input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Discrepancy notes"
            />
          ) : null}
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="panel p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="display text-xl">Weekly invoices</h2>
            <button
              className="btn btn-ghost text-xs"
              type="button"
              onClick={async () => {
                await fetch("/api/partner/invoices", {
                  method: "POST",
                  headers: { "x-api-key": apiKey },
                });
                refresh();
              }}
            >
              Generate week
            </button>
          </div>
          <div className="space-y-2 text-sm">
            {invoices.length === 0 ? <p className="text-[var(--ink)]/55">No invoices yet</p> : null}
            {invoices.map((inv) => (
              <div key={inv.id} className="rounded-xl border border-black/5 p-3">
                Week of {inv.weekOf} · ${inv.amountUsd} · {inv.kgTotal} kg · {inv.status}
              </div>
            ))}
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
    </div>
  );
}
