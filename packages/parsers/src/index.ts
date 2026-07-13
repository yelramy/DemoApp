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

function extractJsonLdProduct(html: string): {
  title?: string;
  price?: string;
  currency?: string;
  imageUrl?: string;
} | null {
  const blocks = html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  for (const block of blocks) {
    try {
      const data = JSON.parse(block[1]);
      const nodes: unknown[] = Array.isArray(data)
        ? data
        : Array.isArray((data as { "@graph"?: unknown[] })["@graph"])
          ? (data as { "@graph": unknown[] })["@graph"]
          : [data];
      for (const node of nodes) {
        const n = node as {
          "@type"?: string | string[];
          name?: string;
          image?: string | string[];
          offers?:
            | { price?: string | number; priceCurrency?: string }
            | Array<{ price?: string | number; priceCurrency?: string }>;
        };
        const type = Array.isArray(n["@type"]) ? n["@type"] : [n["@type"]];
        if (!type.includes("Product")) continue;
        const offer = Array.isArray(n.offers) ? n.offers[0] : n.offers;
        return {
          title: n.name,
          price: offer?.price != null ? String(offer.price) : undefined,
          currency: offer?.priceCurrency,
          imageUrl: Array.isArray(n.image) ? n.image[0] : n.image,
        };
      }
    } catch {
      continue;
    }
  }
  return null;
}

function extractStorePrice(html: string): string | null {
  // Amazon buy-box markup; first a-offscreen span carries "AED49.00" style text
  const offscreen = html.match(
    /class="a-offscreen">\s*((?:AED|USD|EUR|SAR|\$|€)\s?[\d.,]+)\s*</,
  );
  if (offscreen) return offscreen[1];
  const priceAmount = html.match(/"priceAmount"\s*:\s*([\d.]+)/);
  const priceCurrency = html.match(/"currencyCode"\s*:\s*"([A-Z]{3})"/);
  if (priceAmount) {
    return `${priceCurrency?.[1] ?? ""} ${priceAmount[1]}`;
  }
  return null;
}

function assertSafeUrl(raw: string | URL): URL {
  const parsedUrl = new URL(raw);
  if (parsedUrl.protocol !== "https:") {
    throw new Error("Only HTTPS product URLs are supported");
  }
  const hostname = parsedUrl.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    hostname === "::1" ||
    hostname.endsWith(".local") ||
    /^(10|127)\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^169\.254\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  ) {
    throw new Error("Private network URLs are not supported");
  }
  return parsedUrl;
}

async function fetchWithSafeRedirects(startUrl: URL, maxHops = 3) {
  let current = startUrl;
  for (let hop = 0; hop <= maxHops; hop++) {
    const res = await fetch(current.toString(), {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "upgrade-insecure-requests": "1",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(8000),
    });
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      current = assertSafeUrl(new URL(location, current));
      continue;
    }
    return { res, finalUrl: current };
  }
  throw new Error("Too many redirects");
}

export async function parseProductUrl(url: string): Promise<ParsedProduct> {
  const parsedUrl = assertSafeUrl(url);

  let normalizedUrl = parsedUrl.toString();
  let html = "";
  let fetchOk = false;
  try {
    const { res, finalUrl } = await fetchWithSafeRedirects(parsedUrl);
    normalizedUrl = finalUrl.toString();
    if (res.ok) {
      html = await res.text();
      fetchOk = true;
    }
  } catch {
    fetchOk = false;
  }
  const { store, hubHint } = detectStore(normalizedUrl);

  const botBlocked =
    fetchOk &&
    /captcha|robot check|are you a human|access denied|automated access/i.test(
      html.slice(0, 4000),
    );
  if (botBlocked) {
    fetchOk = false;
    html = "";
  }

  const ldProduct = extractJsonLdProduct(html);
  const title =
    ldProduct?.title ||
    extractMeta(html, "og:title") ||
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ||
    "Product from link";
  const imageUrl = ldProduct?.imageUrl ?? extractMeta(html, "og:image");
  const priceMeta =
    ldProduct?.price ??
    extractMeta(html, "product:price:amount") ??
    extractMeta(html, "og:price:amount");
  const currencyMeta =
    ldProduct?.currency ?? extractMeta(html, "product:price:currency");
  const storePrice = priceMeta ? null : extractStorePrice(html);
  const parsed = parsePrice(
    priceMeta
      ? `${currencyMeta ?? ""} ${priceMeta}`
      : (storePrice ?? extractMeta(html, "og:description")),
  );

  const priceUsd = toUsd(parsed.price, parsed.currency ?? currencyMeta);
  const confidence = fetchOk
    ? priceUsd
      ? ldProduct?.price
        ? 0.85
        : 0.75
      : 0.45
    : 0.2;

  return {
    url: normalizedUrl,
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
