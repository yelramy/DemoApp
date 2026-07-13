"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function QuoteForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [hub, setHub] = useState("");
  const [category, setCategory] = useState("");
  const [variantLabel, setVariantLabel] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState(false);
  const [pasteHint, setPasteHint] = useState<string | null>(null);

  async function pasteLink() {
    setPasteHint(null);
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (!text) {
        setPasteHint("Clipboard empty — copy a product link first");
        return;
      }
      setUrl(text);
      setManual(false);
      setPasteHint("Pasted");
    } catch {
      setPasteHint("Allow clipboard access, or long-press to paste");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const extras = {
        promoCode: promoCode || undefined,
        hub: hub || undefined,
        category: category || undefined,
        variantLabel: variantLabel || undefined,
        screenshotUrl: screenshotUrl || undefined,
      };
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
                ...extras,
              }
            : { url, ...extras },
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
        <div className="mt-1 flex gap-2">
          <input
            className="input"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            enterKeyHint="go"
            placeholder="https://amazon.ae/product…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required={!manual}
          />
          <button
            type="button"
            className="btn btn-ghost shrink-0 px-3 text-sm"
            onClick={pasteLink}
          >
            Paste
          </button>
        </div>
      </label>
      {pasteHint ? (
        <p className="text-xs font-semibold text-[var(--sea)]">{pasteHint}</p>
      ) : null}
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
            inputMode="decimal"
            min="1"
            step="0.01"
            value={priceUsd}
            onChange={(e) => setPriceUsd(e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="Screenshot URL (if parser fails)"
            value={screenshotUrl}
            onChange={(e) => setScreenshotUrl(e.target.value)}
          />
        </>
      ) : null}
      {!compact ? (
        <details className="rounded-2xl border border-black/5 bg-white/60 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-[var(--sea-deep)]">
            Add size, color, promo, or shipping preference
          </summary>
          <div className="mt-3 grid gap-2">
            <input
              className="input"
              placeholder="Size / variant"
              value={variantLabel}
              onChange={(e) => setVariantLabel(e.target.value)}
            />
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Category (optional)</option>
              <option value="beauty">Beauty</option>
              <option value="supplements">Supplements</option>
              <option value="fashion">Fashion</option>
              <option value="electronics">Electronics</option>
            </select>
            <input
              className="input"
              placeholder="Promo (BRIDGE10)"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              autoCapitalize="characters"
            />
            <select className="input" value={hub} onChange={(e) => setHub(e.target.value)}>
              <option value="">Auto hub</option>
              <option value="UAE">UAE</option>
              <option value="US">US</option>
              <option value="TR">TR</option>
              <option value="CN">CN</option>
            </select>
          </div>
        </details>
      ) : null}
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button className="btn btn-primary w-full" disabled={loading} type="submit">
          {loading ? "Building your quote…" : "See my delivered price"}
        </button>
        {!compact ? (
          <button
            type="button"
            className="btn btn-ghost w-full sm:w-auto"
            onClick={() => setManual((v) => !v)}
          >
            {manual ? "Use a product link" : "I don’t have a link"}
          </button>
        ) : null}
      </div>
    </form>
  );
}
