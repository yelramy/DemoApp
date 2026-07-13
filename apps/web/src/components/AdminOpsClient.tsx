"use client";

import { useEffect, useState } from "react";

export function AdminOpsClient() {
  const [recon, setRecon] = useState<Record<string, unknown> | null>(null);
  const [analytics, setAnalytics] = useState<Record<string, unknown> | null>(null);
  const [nudge, setNudge] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/reconciliation")
      .then((r) => r.json())
      .then(setRecon);
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setAnalytics);
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="panel p-6">
        <h2 className="display text-xl">7-day reconciliation</h2>
        <pre className="mt-4 overflow-auto text-xs">
          {JSON.stringify(recon, null, 2)}
        </pre>
        <button
          className="btn btn-primary mt-4"
          type="button"
          onClick={async () => {
            const res = await fetch("/api/admin/abandoned-quotes", { method: "POST" });
            const d = await res.json();
            setNudge(`Nudged ${d.nudged} abandoned quotes`);
          }}
        >
          Run abandoned quote nudges
        </button>
        {nudge ? <p className="mt-2 text-sm text-[var(--ok)]">{nudge}</p> : null}
      </div>
      <div className="panel p-6">
        <h2 className="display text-xl">Analytics</h2>
        <pre className="mt-4 overflow-auto text-xs">
          {JSON.stringify(analytics, null, 2)}
        </pre>
      </div>
    </div>
  );
}
