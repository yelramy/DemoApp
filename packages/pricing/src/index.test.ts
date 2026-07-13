import { describe, expect, it } from "vitest";
import { computeQuote, DEFAULT_UAE_AIR, chargeableWeightKg } from "./index";

describe("pricing", () => {
  it("ceils weight to half kg", () => {
    expect(chargeableWeightKg({ estimatedWeightKg: 1.1, divisor: 5000 })).toBe(
      1.5,
    );
  });

  it("computes all-in quote with margin", () => {
    const q = computeQuote(
      [
        {
          title: "Vitamin C",
          itemPriceUsd: 40,
          estimatedWeightKg: 0.8,
        },
      ],
      DEFAULT_UAE_AIR,
    );
    expect(q.itemSubtotal).toBe(40);
    expect(q.buyFee).toBe(6);
    expect(q.total).toBeGreaterThan(40);
    expect(q.marginOk).toBe(true);
  });
});
