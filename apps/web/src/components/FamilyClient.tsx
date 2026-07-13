"use client";

import { useEffect, useState } from "react";

export function FamilyClient() {
  const [referralCode, setReferralCode] = useState("");
  const [lists, setLists] = useState<
    Array<{ id: string; name: string; items: Array<{ id: string; title: string }> }>
  >([]);
  const [members, setMembers] = useState<
    Array<{ id: string; name: string; phone: string | null; relation: string }>
  >([]);
  const [name, setName] = useState("Family essentials");
  const [itemTitle, setItemTitle] = useState("");
  const [listId, setListId] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");

  async function load() {
    const [ess, fam] = await Promise.all([
      fetch("/api/essentials").then((r) => r.json()),
      fetch("/api/family").then((r) => r.json()),
    ]);
    setLists(ess.lists || []);
    setReferralCode(ess.referralCode || "");
    if (ess.lists?.[0]) setListId(ess.lists[0].id);
    setMembers(fam.members || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="panel p-6">
          <h2 className="display text-xl">Referral code</h2>
          <p className="mt-3 rounded-xl bg-[var(--foam)] p-4 font-mono text-lg font-bold">
            {referralCode || "…"}
          </p>
        </div>
        <div className="panel space-y-3 p-6">
          <h2 className="display text-xl">Family members</h2>
          <form
            className="flex flex-wrap gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              await fetch("/api/family", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ name: memberName, phone: memberPhone }),
              });
              setMemberName("");
              setMemberPhone("");
              load();
            }}
          >
            <input className="input" placeholder="Name" value={memberName} onChange={(e) => setMemberName(e.target.value)} required />
            <input className="input" placeholder="Phone" value={memberPhone} onChange={(e) => setMemberPhone(e.target.value)} />
            <button className="btn btn-primary" type="submit">Add</button>
          </form>
          {members.map((m) => (
            <div key={m.id} className="rounded-xl border border-black/5 p-3 text-sm">
              <strong>{m.name}</strong> · {m.relation}
              {m.phone ? ` · ${m.phone}` : ""}
            </div>
          ))}
        </div>
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
          <button className="btn btn-primary" type="submit">Create</button>
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
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <input className="input" placeholder="Add item" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} />
          <button className="btn btn-ghost" type="submit">Add</button>
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
