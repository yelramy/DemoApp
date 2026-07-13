import { describe, expect, it } from "vitest";
import { STATUS_LABELS, money } from "./format";

describe("format", () => {
  it("formats USD", () => {
    expect(money(1234.5)).toBe("$1,234.50");
  });

  it("labels every core order status", () => {
    for (const s of ["quoted", "paid", "delivered", "refunded", "cancelled"]) {
      expect(STATUS_LABELS[s]).toBeTruthy();
    }
  });
});
