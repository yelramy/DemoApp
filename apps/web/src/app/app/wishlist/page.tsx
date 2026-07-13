"use client";

import { useEffect, useState } from "react";
import { money } from "@/lib/format";

export default function WishlistPage() {
  const [items, setItems] = useState<
    Array<{ id: string; title: string; url: string; priceUsd: number | null; targetPriceUsd: number | null }>
  >([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [target, setTarget] = useState("");

  async function load() {
    const res = await fetch("/api/wishlist");
    const d = await res.json();
    setItems(d.items || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="container-bridge py-10">
      <h1 className="display mb-6 text-3xl text-[var(--sea-deep)]">Wishlist</h1>
      <form
        className="panel mb-6 grid gap-2 p-6 md:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await fetch("/api/wishlist", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              title,
              url,
              priceUsd: priceUsd ? Number(priceUsd) : null,
              targetPriceUsd: target ? Number(target) : null,
            }),
          });
          setTitle("");
          setUrl("");
          setPriceUsd("");
          setTarget("");
          load();
        }}
      >
        <input className="input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <input className="input" placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} required />
        <input className="input" placeholder="Current USD" value={priceUsd} onChange={(e) => setPriceUsd(e.target.value)} />
        <input className="input" placeholder="Alert below USD" value={target} onChange={(e) => setTarget(e.target.value)} />
        <button className="btn btn-primary md:col-span-2" type="submit">
          Save item
        </button>
      </form>
      <div className="space-y-3">
        {items.map((i) => (
          <div key={i.id} className="panel p-4 text-sm">
            <a href={i.url} className="font-semibold text-[var(--sea)]" target="_blank" rel="noreferrer">
              {i.title}
            </a>
            <p>
              {i.priceUsd != null ? money(i.priceUsd) : "—"}
              {i.targetPriceUsd != null ? ` · alert ≤ ${money(i.targetPriceUsd)}` : ""}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
