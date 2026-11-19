import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function attachRuntimeGuards(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const cspViolations: string[] = [];
  const thirdPartyRequests: string[] = [];
  const failedAssetRequests: string[] = [];

  await page.addInitScript(() => {
    window.addEventListener("securitypolicyviolation", (event) => {
      const globalTarget = window as unknown as { __cspViolations?: string[] };
      globalTarget.__cspViolations = globalTarget.__cspViolations ?? [];
      globalTarget.__cspViolations.push(
        `${event.violatedDirective} blocked ${event.blockedURI || "inline"}`
      );
    });
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });
  page.on("request", (req) => {
    const parsed = new URL(req.url());
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      if (parsed.hostname !== "127.0.0.1" && parsed.hostname !== "localhost") {
        thirdPartyRequests.push(req.url());
      }
    }
  });
  page.on("response", (res) => {
    const status = res.status();
    if (status >= 400 && !res.url().endsWith("/404")) {
      failedAssetRequests.push(`${status} ${res.url()}`);
    }
  });

  return {
    assertClean: async () => {
      const captured = await page.evaluate(() => {
        const globalTarget = window as unknown as { __cspViolations?: string[] };
        return globalTarget.__cspViolations ?? [];
      });
      cspViolations.push(...captured);

      expect(cspViolations).toEqual([]);
      expect(consoleErrors).toEqual([]);
      expect(pageErrors).toEqual([]);
      expect(thirdPartyRequests).toEqual([]);
      expect(failedAssetRequests).toEqual([]);
    },
  };
}

test.describe("M0 baseline shell and static export + CSP PoC", () => {
  test("verifies / baseline tokens, skip link, theme reload persistence, HTTP CSP headers, and axe WCAG 2.2 AA", async ({
    page,
  }) => {
    const guards = await attachRuntimeGuards(page);
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    const headers = response?.headers() ?? {};
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["content-security-policy"]).toContain("font-src 'self'");
    const scriptSrcDirective = headers["content-security-policy"]
      ?.split(";")
      .find((part) => part.trim().startsWith("script-src"));
    expect(scriptSrcDirective).toBeDefined();
    expect(scriptSrcDirective).not.toContain("'unsafe-inline'");
    expect(scriptSrcDirective).not.toContain("'unsafe-eval'");

    await expect(page.locator("html")).toHaveAttribute("lang", "id");
    await expect(page).toHaveTitle(/SEDP Learning Hub/);
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();

    const lightBodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(lightBodyBg).toBe("rgb(246, 248, 249)");

    const abyssBgInLightMode = await page.evaluate(() => {
      const bay = document.querySelector(".abyss-bay");
      return bay ? getComputedStyle(bay).backgroundColor : null;
    });
    expect(abyssBgInLightMode).toBe("rgb(8, 24, 38)");

    const blockingHeadScripts = await page.evaluate(() => {
      const scripts = Array.from(document.head.querySelectorAll("script[src]"));
      return scripts
        .filter(
          (el) =>
            !el.hasAttribute("async") &&
            !el.hasAttribute("defer") &&
            !el.hasAttribute("nomodule") &&
            el.getAttribute("type") !== "module"
        )
        .map((el) => el.getAttribute("src"));
    });
    expect(blockingHeadScripts).toEqual([]);

    const lightAxe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(lightAxe.violations).toEqual([]);

    const skipLink = page.getByRole("link", { name: /Lewati ke konten utama/i });
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();

    const toggle = page.getByRole("button", { name: /Mode Abyssal Dark/i });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    await expect(page.getByRole("button", { name: /Mode Abyssal Dark/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    const persistedDarkBg = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor
    );
    expect(persistedDarkBg).toBe("rgb(8, 24, 38)");

    const darkAxe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(darkAxe.violations).toEqual([]);

    await page.getByRole("button", { name: /Mode Abyssal Dark/i }).click();
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);
    await page.reload();
    await expect(page.locator("html")).not.toHaveClass(/\bdark\b/);

    await guards.assertClean();
  });

  test("verifies /poc-m0/ MDX+KaTeX rendering, hydration, disabled cursors, 44px touch targets, and axe under CSP", async ({
    page,
  }) => {
    const guards = await attachRuntimeGuards(page);
    const response = await page.goto("/poc-m0/");
    expect(response?.status()).toBe(200);
    expect(response?.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");

    await expect(page.locator("span.katex")).toBeVisible();

    const liveCount = page.getByTestId("poc-live-count");
    await expect(liveCount).toContainText("Status hitung aktif: 0");

    const incrementBtn = page.getByTestId("poc-increment-btn");
    await incrementBtn.focus();
    await page.keyboard.press("Enter");
    await expect(liveCount).toContainText("Status hitung aktif: 1");

    await page.keyboard.press("Space");
    await expect(liveCount).toContainText("Status hitung aktif: 2");

    await page.getByRole("button", { name: /Atur Ulang Penghitung/i }).click();
    await expect(liveCount).toContainText("Status hitung aktif: 0");

    const disabledBtn = page.getByRole("button", { name: /Status Nonaktif/i });
    const ariaDisabledBtn = page.getByRole("button", { name: /Aksi Terkunci/i });

    const buttonAudit = await page.evaluate(() => {
      const bay = document.querySelector(".abyss-bay");
      if (!bay) return null;
      const buttons = Array.from(bay.querySelectorAll("button"));
      return buttons.map((btn) => {
        const rect = btn.getBoundingClientRect();
        const style = getComputedStyle(btn);
        return {
          text: btn.textContent?.trim() ?? "",
          width: rect.width,
          height: rect.height,
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          cursor: style.cursor,
        };
      });
    });

    expect(buttonAudit).not.toBeNull();
    for (const metric of buttonAudit!) {
      expect(metric.width).toBeGreaterThanOrEqual(44);
      expect(metric.height).toBeGreaterThanOrEqual(44);
    }

    expect(await disabledBtn.evaluate((el) => getComputedStyle(el).cursor)).toBe("not-allowed");
    expect(await ariaDisabledBtn.evaluate((el) => getComputedStyle(el).cursor)).toBe("not-allowed");
    expect(await incrementBtn.evaluate((el) => getComputedStyle(el).cursor)).toBe("pointer");

    // Confirm >= 8px horizontal/vertical gap between adjacent buttons in .abyss-bay
    const rects = buttonAudit!;
    for (let i = 0; i < rects.length; i += 1) {
      for (let j = i + 1; j < rects.length; j += 1) {
        const a = rects[i];
        const b = rects[j];
        const horizontalGap = Math.max(a.left - b.right, b.left - a.right);
        const verticalGap = Math.max(a.top - b.bottom, b.top - a.bottom);
        expect(Math.max(horizontalGap, verticalGap)).toBeGreaterThanOrEqual(8);
      }
    }

    const lightAxe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(lightAxe.violations).toEqual([]);

    const themeToggle = page.getByRole("button", { name: /Mode Abyssal Dark/i });
    await themeToggle.click();
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(8, 24, 38)");
    await expect(themeToggle).toHaveCSS(
      "background-color",
      /(rgb\(14, 36, 54\)|rgb\(19, 47, 70\))/
    );
    const darkAxe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(darkAxe.violations).toEqual([]);

    await guards.assertClean();
  });

  test("honors prefers-reduced-motion: reduce without animation hang", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/poc-m0/");
    const transitionDuration = await page
      .getByTestId("poc-increment-btn")
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(parseFloat(transitionDuration)).toBeLessThanOrEqual(0.05);
  });

  for (const route of ["/", "/poc-m0/"]) {
    for (const viewport of [
      { name: "mobile-320", width: 320, height: 568 },
      { name: "mobile-375", width: 375, height: 812 },
      { name: "tablet-768", width: 768, height: 1024 },
      { name: "desktop-1280", width: 1280, height: 800 },
    ]) {
      test(`has zero horizontal overflow on ${route} at ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(route);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  }
});
