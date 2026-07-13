"use client";

import { useEffect, useState } from "react";

export default function AdminConsolePage() {
  const [tab, setTab] = useState<"kanban" | "users" | "claims" | "config">("kanban");
  const [kanban, setKanban] = useState<Record<string, Array<{ id: string; publicId: string; itemTitle: string }>>>({});
  const [users, setUsers] = useState<Array<{ id: string; name: string | null; phone: string | null; riskScore: number; role: string }>>([]);
  const [claims, setClaims] = useState<Array<{ id: string; reason: string; status: string; order: { publicId: string } }>>([]);
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);

  async function load() {
    if (tab === "kanban") setKanban((await (await fetch("/api/admin/kanban")).json()).columns || {});
    if (tab === "users") setUsers((await (await fetch("/api/admin/users")).json()).users || []);
    if (tab === "claims") setClaims((await (await fetch("/api/admin/claims")).json()).claims || []);
    if (tab === "config") setConfig(await (await fetch("/api/admin/config")).json());
  }

  useEffect(() => {
    load();
  }, [tab]);

  return (
    <div className="container-bridge py-10">
      <h1 className="display mb-4 text-3xl text-[var(--sea-deep)]">Admin console</h1>
      <div className="mb-6 flex flex-wrap gap-2">
        {(["kanban", "users", "claims", "config"] as const).map((t) => (
          <button
            key={t}
            className={`btn text-xs ${tab === t ? "btn-primary" : "btn-ghost"}`}
            type="button"
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
        <a className="btn btn-ghost text-xs" href="/admin">
          Buy queue
        </a>
        <a className="btn btn-ghost text-xs" href="/admin/ops">
          Ops
        </a>
      </div>

      {tab === "kanban" ? (
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          {Object.entries(kanban).map(([col, orders]) => (
            <div key={col} className="panel p-3">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--sea)]">
                {col} ({orders.length})
              </h2>
              <div className="space-y-2">
                {orders.map((o) => (
                  <div key={o.id} className="rounded-lg bg-white/80 p-2 text-xs">
                    <div className="font-semibold">{o.publicId}</div>
                    <div className="truncate">{o.itemTitle}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "users" ? (
        <div className="panel overflow-x-auto p-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[var(--ink)]/55">
                <th className="py-2">User</th>
                <th>Role</th>
                <th>Risk</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-black/5">
                  <td className="py-2">
                    {u.name || u.phone}
                  </td>
                  <td>{u.role}</td>
                  <td>{u.riskScore.toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-ghost text-xs"
                      type="button"
                      onClick={async () => {
                        await fetch("/api/admin/users", {
                          method: "PATCH",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ userId: u.id, riskScore: Math.min(1, u.riskScore + 0.1) }),
                        });
                        load();
                      }}
                    >
                      +risk
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === "claims" ? (
        <div className="space-y-3">
          {claims.map((c) => (
            <div key={c.id} className="panel flex items-center justify-between p-4 text-sm">
              <div>
                <strong>{c.order.publicId}</strong> · {c.reason} · {c.status}
              </div>
              {c.status === "open" ? (
                <button
                  className="btn btn-primary text-xs"
                  type="button"
                  onClick={async () => {
                    await fetch("/api/admin/claims", {
                      method: "PATCH",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({ claimId: c.id, status: "resolved" }),
                    });
                    load();
                  }}
                >
                  Resolve
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {tab === "config" ? (
        <pre className="panel overflow-auto p-4 text-xs">{JSON.stringify(config, null, 2)}</pre>
      ) : null}
    </div>
  );
}
