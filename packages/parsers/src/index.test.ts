import { describe, expect, it, vi } from "vitest";
import { parseManualItem, parseProductUrl } from "./index";

describe("product parser", () => {
  it("creates a normalized manual item", () => {
    expect(parseManualItem({ title: "Phone", priceUsd: 100 })).toMatchObject({
      store: "manual",
      currency: "USD",
      priceUsd: 100,
      confidence: 1,
    });
  });

  it.each([
    "http://example.com/item",
    "https://localhost/item",
    "https://127.0.0.1/item",
    "https://10.0.0.1/item",
    "https://192.168.1.1/item",
    "https://172.16.0.1/item",
  ])("rejects unsafe URL %s", async (url) => {
    await expect(parseProductUrl(url)).rejects.toThrow();
  });

  it("extracts product metadata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () =>
          '<meta property="og:title" content="Shoes"><meta property="product:price:amount" content="100"><meta property="product:price:currency" content="AED">',
      }),
    );
    await expect(parseProductUrl("https://amazon.ae/item")).resolves.toMatchObject({
      title: "Shoes",
      priceUsd: 27,
      currency: "AED",
      hubHint: "UAE",
    });
    vi.unstubAllGlobals();
  });
});
