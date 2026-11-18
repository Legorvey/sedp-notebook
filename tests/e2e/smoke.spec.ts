import { expect, test } from "@playwright/test";

test.describe("Phase 0A baseline smoke test", () => {
  test("renders minimal shell cleanly with DESIGN.md tokens, theme toggle, cursor, and zero console errors", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
    });

    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("lang", "id");
    await expect(page).toHaveTitle(/SEDP Learning Hub/);
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Verify Light Mode DESIGN.md canvas token & embedded .abyss-bay isolation
    const lightBodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(lightBodyBg).toBe("rgb(246, 248, 249)");

    const abyssBgInLightMode = await page.evaluate(() => {
      const bay = document.querySelector(".abyss-bay");
      return bay ? getComputedStyle(bay).backgroundColor : null;
    });
    expect(abyssBgInLightMode).toBe("rgb(8, 24, 38)");

    const toggle = page.getByRole("button", { name: /Tema:/i });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");

    const toggleMetrics = await toggle.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return { height: rect.height, width: rect.width, cursor: style.cursor };
    });
    expect(toggleMetrics.height).toBeGreaterThanOrEqual(44);
    expect(toggleMetrics.width).toBeGreaterThanOrEqual(44);
    expect(toggleMetrics.cursor).toBe("pointer");

    // Verify skip link activates cleanly with keyboard
    const skipLink = page.getByRole("link", { name: /Lewati ke konten utama/i });
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();

    // Exercise keyboard focus + Enter activation and click parity on ThemeToggle
    await toggle.focus();
    await expect(toggle).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    const darkBodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(darkBodyBg).toBe("rgb(8, 24, 38)");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  for (const viewport of [
    { name: "mobile-375", width: 375, height: 812 },
    { name: "tablet-768", width: 768, height: 1024 },
    { name: "desktop-1280", width: 1280, height: 800 },
  ]) {
    test(`has zero horizontal overflow at ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth - document.documentElement.clientWidth;
      });

      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});
