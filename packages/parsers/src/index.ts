export type ParsedProduct = {
  url: string;
  store: string;
  title: string;
  priceUsd: number | null;
  currency: string | null;
  imageUrl: string | null;
  estimatedWeightKg: number;
  confidence: number;
  hubHint: "UAE" | "US" | "TR";
  notes?: string;
};

function detectStore(url: string): {
  store: string;
  hubHint: "UAE" | "US" | "TR";
} {
  const host = new URL(url).hostname.replace(/^www\./, "");
  if (host.includes("amazon.ae") || host.includes("noon.com")) {
    return { store: host.includes("noon") ? "noon" : "amazon.ae", hubHint: "UAE" };
  }
  if (host.includes("amazon.com") || host.includes("iherb.com")) {
    return {
      store: host.includes("iherb") ? "iherb" : "amazon.com",
      hubHint: "US",
    };
  }
  if (host.includes("trendyol.com")) {
    return { store: "trendyol", hubHint: "TR" };
  }
  return { store: host, hubHint: "UAE" };
}

function extractMeta(html: string, property: string) {
  const re = new RegExp(
    `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']+)["']`,
    "i",
  );
  const re2 = new RegExp(
    `<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${property}["']`,
    "i",
  );
  return html.match(re)?.[1] ?? html.match(re2)?.[1] ?? null;
}

function parsePrice(raw: string | null): { price: number | null; currency: string | null } {
  if (!raw) return { price: null, currency: null };
  const currency = raw.includes("AED")
    ? "AED"
    : raw.includes("USD") || raw.includes("$")
      ? "USD"
      : raw.includes("EUR") || raw.includes("€")
        ? "EUR"
        : null;
  const num = raw.replace(/[^0-9.,]/g, "").replace(/,/g, "");
  const price = Number.parseFloat(num);
  return { price: Number.isFinite(price) ? price : null, currency };
}

function toUsd(price: number | null, currency: string | null) {
  if (price == null) return null;
  if (!currency || currency === "USD") return price;
  if (currency === "AED") return Math.round(price * 0.27 * 100) / 100;
  if (currency === "EUR") return Math.round(price * 1.08 * 100) / 100;
  return price;
}

export async function parseProductUrl(url: string): Promise<ParsedProduct> {
  const { store, hubHint } = detectStore(url);
  let html = "";
  let fetchOk = false;
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; BridgeBot/1.0; +https://bridge.lb)",
        accept: "text/html",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      html = await res.text();
      fetchOk = true;
    }
  } catch {
    fetchOk = false;
  }

  const title =
    extractMeta(html, "og:title") ||
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ||
    "Product from link";
  const imageUrl = extractMeta(html, "og:image");
  const priceMeta =
    extractMeta(html, "product:price:amount") ||
    extractMeta(html, "og:price:amount");
  const currencyMeta = extractMeta(html, "product:price:currency");
  const parsed = parsePrice(
    priceMeta
      ? `${currencyMeta ?? ""} ${priceMeta}`
      : extractMeta(html, "og:description"),
  );

  const priceUsd = toUsd(parsed.price, parsed.currency ?? currencyMeta);
  const confidence = fetchOk
    ? priceUsd
      ? 0.75
      : 0.45
    : 0.2;

  return {
    url,
    store,
    title: title.slice(0, 200),
    priceUsd,
    currency: parsed.currency ?? currencyMeta,
    imageUrl,
    estimatedWeightKg: hubHint === "US" ? 0.9 : 0.7,
    confidence,
    hubHint,
    notes: fetchOk
      ? undefined
      : "Could not fetch live page; confirm price manually.",
  };
}

export function parseManualItem(input: {
  url?: string;
  title: string;
  priceUsd: number;
  estimatedWeightKg?: number;
  imageUrl?: string;
}): ParsedProduct {
  return {
    url: input.url ?? "manual://entry",
    store: "manual",
    title: input.title,
    priceUsd: input.priceUsd,
    currency: "USD",
    imageUrl: input.imageUrl ?? null,
    estimatedWeightKg: input.estimatedWeightKg ?? 0.7,
    confidence: 1,
    hubHint: "UAE",
  };
}
