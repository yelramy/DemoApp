"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function QuoteForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          manual
            ? {
                manual: {
                  title,
                  priceUsd: Number(priceUsd),
                  url: url || undefined,
                },
              }
            : { url },
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Quote failed");
      router.push(`/app/quote/${data.quoteId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Quote failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm font-semibold text-[var(--sea-deep)]">
        Product link
        <input
          className="input mt-1"
          placeholder="https://www.noon.com/... or amazon.ae/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required={!manual}
        />
      </label>
      {manual ? (
        <>
          <input
            className="input"
            placeholder="Item title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="Price in USD"
            type="number"
            min="1"
            step="0.01"
            value={priceUsd}
            onChange={(e) => setPriceUsd(e.target.value)}
            required
          />
        </>
      ) : null}
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" disabled={loading} type="submit">
          {loading ? "Calculating…" : "Get all-in quote"}
        </button>
        {!compact ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setManual((v) => !v)}
          >
            {manual ? "Use link only" : "Enter manually"}
          </button>
        ) : null}
      </div>
    </form>
  );
}
