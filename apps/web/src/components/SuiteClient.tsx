"use client";

import { useEffect, useState } from "react";

type SuiteData = {
  suite: { code: string; uae: string; us: string; tr: string };
  parcels: Array<{
    id: string;
    description: string;
    status: string;
    tracking: string | null;
    storageFeeUsd: number;
  }>;
};

export function SuiteClient() {
  const [data, setData] = useState<SuiteData | null>(null);
  const [description, setDescription] = useState("");
  const [tracking, setTracking] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/suite");
    setData(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function addParcel(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/suite", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ description, tracking }),
    });
    setDescription("");
    setTracking("");
    load();
  }

  async function consolidate() {
    const res = await fetch("/api/suite/consolidate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ parcelIds: selected }),
    });
    const json = await res.json();
    setMsg(json.message + (json.storageFeeUsd ? ` Storage $${json.storageFeeUsd}` : ""));
    load();
  }

  async function dispose(status: "abandoned" | "donate" | "discard") {
    for (const id of selected) {
      await fetch("/api/suite/dispose", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    }
    setMsg(`Marked ${selected.length} parcel(s) as ${status}`);
    setSelected([]);
    load();
  }

  if (!data) return <p>Loading suite…</p>;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="panel space-y-4 p-6">
        <h2 className="display text-xl text-[var(--sea-deep)]">Addresses</h2>
        {(["uae", "us", "tr"] as const).map((hub) => (
          <pre
            key={hub}
            className="whitespace-pre-wrap rounded-xl bg-[var(--foam)] p-4 text-xs"
          >
            {data.suite[hub]}
          </pre>
        ))}
      </div>
      <div className="panel p-6">
        <h2 className="display mb-3 text-xl text-[var(--sea-deep)]">Expected packages</h2>
        <form onSubmit={addParcel} className="mb-4 space-y-2">
          <input
            className="input"
            placeholder="What did you order?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="Retailer tracking (optional)"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">
            Mark expected
          </button>
        </form>
        <div className="space-y-2">
          {data.parcels.map((p) => (
            <label
              key={p.id}
              className="flex items-start gap-3 rounded-xl border border-black/5 p-3 text-sm"
            >
              <input
                type="checkbox"
                checked={selected.includes(p.id)}
                onChange={(e) =>
                  setSelected((s) =>
                    e.target.checked ? [...s, p.id] : s.filter((x) => x !== p.id),
                  )
                }
              />
              <span>
                <strong>{p.description}</strong>
                <br />
                {p.status}
                {p.tracking ? ` · ${p.tracking}` : ""}
              </span>
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="btn btn-ghost"
            type="button"
            disabled={!selected.length}
            onClick={consolidate}
          >
            Consolidate selected
          </button>
          <button
            className="btn btn-ghost text-xs"
            type="button"
            disabled={!selected.length}
            onClick={() => dispose("donate")}
          >
            Donate
          </button>
          <button
            className="btn btn-ghost text-xs"
            type="button"
            disabled={!selected.length}
            onClick={() => dispose("abandoned")}
          >
            Abandon
          </button>
          <button
            className="btn btn-ghost text-xs text-[var(--danger)]"
            type="button"
            disabled={!selected.length}
            onClick={() => dispose("discard")}
          >
            Discard
          </button>
        </div>
        {msg ? <p className="mt-3 text-sm text-[var(--ok)]">{msg}</p> : null}
      </div>
    </div>
  );
}
