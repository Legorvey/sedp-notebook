import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function hexToLinear(channel: number): number {
  const srgb = channel / 255;
  return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex: string): number {
  const normalized = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error(`Expected 6-digit hex color, received "${hex}"`);
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return 0.2126 * hexToLinear(r) + 0.7152 * hexToLinear(g) + 0.0722 * hexToLinear(b);
}

function contrastRatio(fgHex: string, bgHex: string): number {
  const l1 = relativeLuminance(fgHex);
  const l2 = relativeLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseCssBlockVars(css: string, blockHeaderRegex: RegExp): Record<string, string> {
  const match = css.match(blockHeaderRegex);
  if (!match?.[1]) {
    throw new Error(`Could not locate CSS token block matching ${blockHeaderRegex}`);
  }
  const vars: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const varMatch = line.match(/^\s*(--sedp-[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/);
    if (varMatch?.[1] && varMatch[2]) {
      vars[varMatch[1]] = varMatch[2].toLowerCase();
    }
  }
  return vars;
}

const EXPECTED_SEDP_KEYS = [
  "--sedp-bg-canvas",
  "--sedp-bg-surface",
  "--sedp-bg-inset",
  "--sedp-text-primary",
  "--sedp-text-secondary",
  "--sedp-border-control",
  "--sedp-border-subtle",
  "--sedp-accent",
  "--sedp-accent-hover",
  "--sedp-accent-foreground",
  "--sedp-status-verified",
  "--sedp-status-partial",
  "--sedp-status-fault",
  "--sedp-fault-hover",
] as const;

describe("DESIGN.md CSS token WCAG 2.2 AA contrast ratios", () => {
  const globalsCss = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");
  const light = parseCssBlockVars(globalsCss, /:root\s*\{([\s\S]*?)\}/);
  const dark = parseCssBlockVars(globalsCss, /\.dark,\s*\.abyss-bay\s*\{([\s\S]*?)\}/);

  it("parses every declared --sedp-* hex token in both themes", () => {
    expect(Object.keys(light).sort()).toEqual([...EXPECTED_SEDP_KEYS].sort());
    expect(Object.keys(dark).sort()).toEqual([...EXPECTED_SEDP_KEYS].sort());
    expect(light["--sedp-border-subtle"]).toMatch(/^#[0-9a-f]{6}$/);
    expect(dark["--sedp-border-subtle"]).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("satisfies >= 4.5:1 text and >= 3:1 UI contrast in Pelagic Light (:root)", () => {
    for (const bgKey of ["--sedp-bg-canvas", "--sedp-bg-surface", "--sedp-bg-inset"] as const) {
      expect(contrastRatio(light["--sedp-text-primary"], light[bgKey])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(light["--sedp-text-secondary"], light[bgKey])).toBeGreaterThanOrEqual(
        4.5
      );
      expect(contrastRatio(light["--sedp-accent"], light[bgKey])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(light["--sedp-accent-hover"], light[bgKey])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(light["--sedp-border-control"], light[bgKey])).toBeGreaterThanOrEqual(
        3.0
      );

      for (const statusKey of [
        "--sedp-status-verified",
        "--sedp-status-partial",
        "--sedp-status-fault",
        "--sedp-fault-hover",
      ] as const) {
        expect(contrastRatio(light[statusKey], light[bgKey])).toBeGreaterThanOrEqual(4.5);
      }
    }

    expect(
      contrastRatio(light["--sedp-accent-foreground"], light["--sedp-accent"])
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(light["--sedp-accent-foreground"], light["--sedp-accent-hover"])
    ).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#ffffff", light["--sedp-status-fault"])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#ffffff", light["--sedp-fault-hover"])).toBeGreaterThanOrEqual(4.5);
  });

  it("satisfies >= 4.5:1 text and >= 3:1 UI contrast in Abyssal Dark (.dark, .abyss-bay)", () => {
    for (const bgKey of ["--sedp-bg-canvas", "--sedp-bg-surface", "--sedp-bg-inset"] as const) {
      expect(contrastRatio(dark["--sedp-text-primary"], dark[bgKey])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(dark["--sedp-text-secondary"], dark[bgKey])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(dark["--sedp-accent"], dark[bgKey])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(dark["--sedp-accent-hover"], dark[bgKey])).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(dark["--sedp-border-control"], dark[bgKey])).toBeGreaterThanOrEqual(3.0);

      for (const statusKey of [
        "--sedp-status-verified",
        "--sedp-status-partial",
        "--sedp-status-fault",
        "--sedp-fault-hover",
      ] as const) {
        expect(contrastRatio(dark[statusKey], dark[bgKey])).toBeGreaterThanOrEqual(4.5);
      }
    }

    expect(
      contrastRatio(dark["--sedp-accent-foreground"], dark["--sedp-accent"])
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(dark["--sedp-accent-foreground"], dark["--sedp-accent-hover"])
    ).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#081826", dark["--sedp-status-fault"])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#081826", dark["--sedp-fault-hover"])).toBeGreaterThanOrEqual(4.5);
  });
});
