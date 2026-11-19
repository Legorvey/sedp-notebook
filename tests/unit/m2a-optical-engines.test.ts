import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  calculateOpticalCapacity,
  DEFAULT_OPTICAL_CAPACITY_INPUT,
} from "@/features/simulators/engine/optical-capacity";
import {
  calculateOpticalBudget,
  DEFAULT_REPEATERED_BUDGET_INPUT,
  DEFAULT_REPEATERLESS_BUDGET_INPUT,
  formatLinearPowerFraction,
} from "@/features/simulators/engine/optical-budget";

describe("M2-A Pure Optical Simulation Engines & Exact Test Vectors", () => {
  it("keeps simulator engine files free of React/DOM imports", () => {
    for (const file of ["optical-capacity.ts", "optical-budget.ts"]) {
      const code = readFileSync(
        resolve(process.cwd(), "src/features/simulators/engine", file),
        "utf8"
      );
      expect(code).not.toMatch(/from\s+["']react["']/);
      expect(code).not.toMatch(/window\.|document\./);
    }
  });

  it("matches Lab (a) exact test vectors, dimensional units, and slot-overflow boundary", () => {
    // Vector 1: N_fp=16, B_THz=4.4, SE=4.0 -> 17.6 / 281.6 / 563.2 Tbps
    const vec1 = calculateOpticalCapacity(DEFAULT_OPTICAL_CAPACITY_INPUT);
    expect(vec1.valid).toBe(true);
    expect(vec1.totalFibers).toBe(32);
    expect(vec1.perPairPerDirectionTbps).toBeCloseTo(17.6, 6);
    expect(vec1.totalPerDirectionTbps).toBeCloseTo(281.6, 6);
    expect(vec1.bidirectionalAggregateTbps).toBeCloseTo(563.2, 6);

    // Vector 2: N_fp=4, N_lambda=80, R_lambda=100, B_THz=4.4, Delta_f=50
    const vec2 = calculateOpticalCapacity({
      ...DEFAULT_OPTICAL_CAPACITY_INPUT,
      mode: "channel",
      fiberPairs: 4,
      channelCount: 80,
      channelRateGbps: 100,
      spectrumPerPairTHz: 4.4,
      channelSpacingGHz: 50,
    });
    expect(vec2.valid).toBe(true);
    expect(vec2.totalFibers).toBe(8);
    expect(vec2.maxSlotsPerPair).toBe(88);
    expect(vec2.perPairPerDirectionTbps).toBeCloseTo(8.0, 6);
    expect(vec2.totalPerDirectionTbps).toBeCloseTo(32.0, 6);
    expect(vec2.bidirectionalAggregateTbps).toBeCloseTo(64.0, 6);
    expect(vec2.effectiveBandSE).toBeCloseTo(8000 / 4400, 6); // 1.81818...

    // Boundary exact fit: 88 channels on 4.4 THz @ 50 GHz must succeed
    const exactMax = calculateOpticalCapacity({
      ...DEFAULT_OPTICAL_CAPACITY_INPUT,
      mode: "channel",
      channelCount: 88,
      spectrumPerPairTHz: 4.4,
      channelSpacingGHz: 50,
    });
    expect(exactMax.valid).toBe(true);
    expect(exactMax.maxSlotsPerPair).toBe(88);

    // Edge Case: 90 channels on 4.4 THz @ 50 GHz triggers slot overflow error
    const overflow = calculateOpticalCapacity({
      ...DEFAULT_OPTICAL_CAPACITY_INPUT,
      mode: "channel",
      channelCount: 90,
      spectrumPerPairTHz: 4.4,
      channelSpacingGHz: 50,
    });
    expect(overflow.valid).toBe(false);
    expect(overflow.errors[0]?.messageId).toContain("Maksimum 88 kanal pada spektrum 4.4 THz");

    // NaN / 0 / non-integer guards
    const bad = calculateOpticalCapacity({
      ...DEFAULT_OPTICAL_CAPACITY_INPUT,
      fiberPairs: 2.5,
      spectrumPerPairTHz: Number.NaN,
    });
    expect(bad.valid).toBe(false);
    expect(bad.errors.length).toBeGreaterThanOrEqual(2);
    expect(Number.isNaN(bad.totalPerDirectionTbps)).toBe(false);
  });

  it("enforces Lab (b) exact attenuation fractions, BOL/EOL OSNR vectors, and float guards", () => {
    // Vector 1: alpha=0.20, L=100, 400, 5000 km
    const f100 = formatLinearPowerFraction(20);
    expect(f100.numeric).toBeCloseTo(0.01, 6);
    expect(f100.label).toContain("1.000%");
    const f400 = formatLinearPowerFraction(80);
    expect(f400.numeric).toBeCloseTo(1e-8, 12);
    expect(f400.label).toBe("1.00e-8");
    const f5000 = formatLinearPowerFraction(1000);
    expect(f5000.clamped).toBe(true);
    expect(f5000.label).toBe("< 1e-30");

    // Underflow check past 3,000 dB
    const underflow = calculateOpticalBudget({
      ...DEFAULT_REPEATERLESS_BUDGET_INPUT,
      distanceKm: 15000,
      attenuationDbPerKm: 0.3, // 4500 dB
    });
    expect(underflow.valid).toBe(true);
    expect(underflow.linearPowerFraction).toBe(0);
    expect(underflow.linearPowerFractionLabel).toBe("< 1e-30");
    expect(Number.isFinite(underflow.eolRxPowerDbm)).toBe(true);

    // Vector 2 (Repeatered): L=6000, L_rep=60 (100 spans), alpha=0.17 (L_span=10.2), P_ch=-2, NF=5, M=2+1.5
    const rep = calculateOpticalBudget(DEFAULT_REPEATERED_BUDGET_INPUT);
    expect(rep.valid).toBe(true);
    expect(rep.spanCount).toBe(100);
    expect(rep.spanLossDb).toBeCloseTo(10.2, 6);
    expect(rep.bolOsnrDb).toBeCloseTo(20.8, 6);
    expect(rep.eolOsnrDb).toBeCloseTo(17.3, 6);
    expect(rep.meetsTarget).toBe(true);
    expect(rep.limitationsNoteId).toContain("GSNR");

    // Physical monotonicity: doubling distance worsens OSNR by ~3.01 dB
    const repDouble = calculateOpticalBudget({
      ...DEFAULT_REPEATERED_BUDGET_INPUT,
      distanceKm: 12000,
    });
    expect(repDouble.valid).toBe(true);
    expect((rep.bolOsnrDb ?? 0) - (repDouble.bolOsnrDb ?? 0)).toBeCloseTo(10 * Math.log10(2), 4);

    // Total EDFA power mode derivation: 18 dBm total across 100 channels = -2.0 dBm/ch -> identical OSNR
    const repTotalMode = calculateOpticalBudget({
      ...DEFAULT_REPEATERED_BUDGET_INPUT,
      powerInputMode: "total-edfa",
      totalEdfaPowerDbm: 18.0,
      channelCount: 100,
    });
    expect(repTotalMode.valid).toBe(true);
    expect(repTotalMode.effectiveLaunchPowerPerChannelDbm).toBeCloseTo(-2.0, 6);
    expect(repTotalMode.bolOsnrDb).toBeCloseTo(20.8, 6);

    // Invalid parameter guard: Infinity/0/negative
    const invalidBudget = calculateOpticalBudget({
      ...DEFAULT_REPEATERED_BUDGET_INPUT,
      distanceKm: 0,
      repeaterSpacingKm: 10,
      channelCount: 0,
      powerInputMode: "total-edfa",
    });
    expect(invalidBudget.valid).toBe(false);
    expect(invalidBudget.errors.length).toBeGreaterThanOrEqual(3);
    expect(Number.isNaN(invalidBudget.fiberAttenuationDb)).toBe(false);
  });
});
