"use client";

import { useEffect, useState } from "react";

export function FamilyClient() {
  const [referralCode, setReferralCode] = useState("");
  const [lists, setLists] = useState<
    Array<{ id: string; name: string; items: Array<{ id: string; title: string }> }>
  >([]);
  const [name, setName] = useState("Family essentials");
  const [itemTitle, setItemTitle] = useState("");
  const [listId, setListId] = useState("");

  async function load() {
    const res = await fetch("/api/essentials");
    const data = await res.json();
    setLists(data.lists || []);
    setReferralCode(data.referralCode || "");
    if (data.lists?.[0]) setListId(data.lists[0].id);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="panel p-6">
        <h2 className="display text-xl">Referral code</h2>
        <p className="mt-3 rounded-xl bg-[var(--foam)] p-4 font-mono text-lg font-bold">
          {referralCode || "…"}
        </p>
        <p className="mt-2 text-sm text-[var(--ink)]/60">
          Friends enter this at signup for $5 wallet credit each.
        </p>
      </div>
      <div className="panel space-y-3 p-6">
        <h2 className="display text-xl">Essentials lists</h2>
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await fetch("/api/essentials", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ name }),
            });
            load();
          }}
        >
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          <button className="btn btn-primary" type="submit">
            Create
          </button>
        </form>
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!listId) return;
            await fetch("/api/essentials", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ listId, item: { title: itemTitle } }),
            });
            setItemTitle("");
            load();
          }}
        >
          <select className="input" value={listId} onChange={(e) => setListId(e.target.value)}>
            {lists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Add item"
            value={itemTitle}
            onChange={(e) => setItemTitle(e.target.value)}
          />
          <button className="btn btn-ghost" type="submit">
            Add
          </button>
        </form>
        {lists.map((l) => (
          <div key={l.id} className="rounded-xl border border-black/5 p-3 text-sm">
            <strong>{l.name}</strong>
            <ul className="mt-2 list-disc pl-5">
              {l.items.map((i) => (
                <li key={i.id}>{i.title}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
