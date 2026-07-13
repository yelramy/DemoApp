"use client";

import { useEffect, useState } from "react";

export default function AdminConsolePage() {
  const [tab, setTab] = useState<
    "kanban" | "users" | "claims" | "config" | "cms" | "ops"
  >("kanban");
  const [kanban, setKanban] = useState<
    Record<string, Array<{ id: string; publicId: string; itemTitle: string }>>
  >({});
  const [users, setUsers] = useState<
    Array<{ id: string; name: string | null; phone: string | null; riskScore: number; role: string }>
  >([]);
  const [claims, setClaims] = useState<
    Array<{ id: string; reason: string; status: string; order: { publicId: string } }>
  >([]);
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [cms, setCms] = useState<{
    posts: Array<{ slug: string; title: string }>;
    macros: Array<{ id: string; title: string; body: string }>;
    contacts: Array<{ id: string; email: string; message: string }>;
  } | null>(null);
  const [obs, setObs] = useState<{
    events: Array<{ id: string; level: string; source: string; message: string }>;
    audits: Array<{ id: string; action: string; entity: string }>;
  } | null>(null);
  const [affiliates, setAffiliates] = useState<
    Array<{ code: string; label: string; clicks: number; creditUsd: number }>
  >([]);
  const [quoteId, setQuoteId] = useState("");
  const [overrideTotal, setOverrideTotal] = useState("");
  const [overrideMsg, setOverrideMsg] = useState<string | null>(null);
  const [blogSlug, setBlogSlug] = useState("");
  const [blogTitle, setBlogTitle] = useState("");
  const [affCode, setAffCode] = useState("");

  async function load() {
    if (tab === "kanban")
      setKanban((await (await fetch("/api/admin/kanban")).json()).columns || {});
    if (tab === "users")
      setUsers((await (await fetch("/api/admin/users")).json()).users || []);
    if (tab === "claims")
      setClaims((await (await fetch("/api/admin/claims")).json()).claims || []);
    if (tab === "config") setConfig(await (await fetch("/api/admin/config")).json());
    if (tab === "cms") {
      setCms(await (await fetch("/api/admin/cms")).json());
      setAffiliates((await (await fetch("/api/affiliates")).json()).links || []);
    }
    if (tab === "ops") setObs(await (await fetch("/api/observability")).json());
  }

  useEffect(() => {
    load();
  }, [tab]);

  return (
    <div className="container-bridge py-10">
      <h1 className="display mb-4 text-3xl text-[var(--sea-deep)]">Admin console</h1>
      <div className="mb-6 flex flex-wrap gap-2">
        {(["kanban", "users", "claims", "config", "cms", "ops"] as const).map((t) => (
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
          Finance ops
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
                  <td className="py-2">{u.name || u.phone}</td>
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
                          body: JSON.stringify({
                            userId: u.id,
                            riskScore: Math.min(1, u.riskScore + 0.1),
                          }),
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
        <div className="space-y-6">
          <pre className="panel overflow-auto p-4 text-xs">
            {JSON.stringify(config, null, 2)}
          </pre>
          <form
            className="panel grid gap-2 p-4 sm:grid-cols-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const res = await fetch("/api/admin/quotes/override", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  quoteId,
                  total: Number(overrideTotal),
                  reason: "admin console override",
                }),
              });
              setOverrideMsg(res.ok ? "Quote overridden" : "Override failed");
            }}
          >
            <h2 className="display sm:col-span-3 text-xl">Quote override</h2>
            <input
              className="input"
              placeholder="Quote id"
              value={quoteId}
              onChange={(e) => setQuoteId(e.target.value)}
              required
            />
            <input
              className="input"
              placeholder="New total USD"
              value={overrideTotal}
              onChange={(e) => setOverrideTotal(e.target.value)}
              required
            />
            <button className="btn btn-primary" type="submit">
              Override
            </button>
            {overrideMsg ? (
              <p className="sm:col-span-3 text-sm text-[var(--ok)]">{overrideMsg}</p>
            ) : null}
          </form>
        </div>
      ) : null}

      {tab === "cms" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="panel space-y-3 p-4">
            <h2 className="display text-xl">Blog / macros</h2>
            <form
              className="space-y-2"
              onSubmit={async (e) => {
                e.preventDefault();
                await fetch("/api/admin/cms", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({
                    type: "blog",
                    slug: blogSlug,
                    title: blogTitle,
                    excerpt: blogTitle,
                    body: blogTitle,
                  }),
                });
                setBlogSlug("");
                setBlogTitle("");
                load();
              }}
            >
              <input
                className="input"
                placeholder="slug"
                value={blogSlug}
                onChange={(e) => setBlogSlug(e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="title"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                required
              />
              <button className="btn btn-primary text-xs" type="submit">
                Upsert post
              </button>
            </form>
            <ul className="text-sm">
              {(cms?.posts || []).map((p) => (
                <li key={p.slug}>
                  {p.title} · <code>{p.slug}</code>
                </li>
              ))}
            </ul>
            <h3 className="pt-2 text-sm font-bold">Macros</h3>
            <ul className="space-y-2 text-xs">
              {(cms?.macros || []).map((m) => (
                <li key={m.id} className="rounded-lg bg-[var(--foam)] p-2">
                  <strong>{m.title}</strong>
                  <div>{m.body}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel space-y-3 p-4">
            <h2 className="display text-xl">Affiliates</h2>
            <form
              className="flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                await fetch("/api/affiliates", {
                  method: "POST",
                  headers: { "content-type": "application/json" },
                  body: JSON.stringify({ code: affCode, label: affCode }),
                });
                setAffCode("");
                load();
              }}
            >
              <input
                className="input"
                placeholder="CREATOR2"
                value={affCode}
                onChange={(e) => setAffCode(e.target.value)}
                required
              />
              <button className="btn btn-primary text-xs" type="submit">
                Add
              </button>
            </form>
            <ul className="text-sm">
              {affiliates.map((a) => (
                <li key={a.code}>
                  {a.code} · {a.clicks} clicks · ${a.creditUsd}
                </li>
              ))}
            </ul>
            <h3 className="pt-2 text-sm font-bold">Contact inbox</h3>
            <ul className="max-h-60 space-y-2 overflow-auto text-xs">
              {(cms?.contacts || []).map((c) => (
                <li key={c.id} className="rounded-lg border border-black/5 p-2">
                  {c.email}: {c.message}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {tab === "ops" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="panel p-4">
            <h2 className="display mb-3 text-xl">Observability</h2>
            <ul className="max-h-96 space-y-2 overflow-auto text-xs">
              {(obs?.events || []).map((e) => (
                <li key={e.id} className="rounded-lg bg-[var(--foam)] p-2">
                  <strong>{e.level}</strong> · {e.source}: {e.message}
                </li>
              ))}
            </ul>
          </div>
          <div className="panel p-4">
            <h2 className="display mb-3 text-xl">Audit log</h2>
            <ul className="max-h-96 space-y-2 overflow-auto text-xs">
              {(obs?.audits || []).map((a) => (
                <li key={a.id}>
                  {a.action} · {a.entity}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
