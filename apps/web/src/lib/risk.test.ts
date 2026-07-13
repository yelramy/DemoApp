import { describe, expect, it } from "vitest";
import { codRiskAllowed } from "./risk";

const base = {
  riskScore: 0,
  codFails: 0,
  amountUsd: 50,
  areaCodAllowed: true,
  areaMax: 200,
};

describe("codRiskAllowed", () => {
  it("allows low-risk COD", () => {
    expect(codRiskAllowed(base)).toEqual({ ok: true });
  });

  it("blocks when area disallows COD", () => {
    expect(codRiskAllowed({ ...base, areaCodAllowed: false }).ok).toBe(false);
  });

  it("blocks above area max", () => {
    expect(codRiskAllowed({ ...base, amountUsd: 201 }).ok).toBe(false);
  });

  it("blocks repeat COD failures", () => {
    expect(codRiskAllowed({ ...base, codFails: 2 }).ok).toBe(false);
  });

  it("blocks high risk score", () => {
    expect(codRiskAllowed({ ...base, riskScore: 0.7 }).ok).toBe(false);
  });
});
