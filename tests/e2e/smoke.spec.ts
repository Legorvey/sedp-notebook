import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function attachRuntimeGuards(page: Page, options?: { allow404ConsoleError?: boolean }) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const cspViolations: string[] = [];
  const thirdPartyRequests: string[] = [];
  const failedAssetRequests: string[] = [];

  await page.exposeFunction("__reportCspViolation", (violation: string) => {
    cspViolations.push(violation);
  });

  await page.addInitScript(() => {
    window.addEventListener("securitypolicyviolation", (event) => {
      const reporter = (window as unknown as { __reportCspViolation?: (v: string) => void })
        .__reportCspViolation;
      if (typeof reporter === "function") {
        reporter(`${event.violatedDirective} blocked ${event.blockedURI || "inline"}`);
      }
    });
  });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      if (options?.allow404ConsoleError && msg.text().includes("404 (Not Found)")) {
        return;
      }
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => {
    pageErrors.push(err.message);
  });
  page.on("request", (req) => {
    const url = req.url();
    if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("about:")) {
      return;
    }
    const parsed = new URL(url);
    const isLocalHost = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost";
    const isAllowedScheme = parsed.protocol === "http:" || parsed.protocol === "https:";
    if (!isAllowedScheme || !isLocalHost || parsed.port !== "3100") {
      thirdPartyRequests.push(url);
    }
  });
  page.on("response", (res) => {
    const status = res.status();
    if (status >= 400 && !res.url().includes("/nonexistent-m0-check")) {
      failedAssetRequests.push(`${status} ${res.url()}`);
    }
  });

  return {
    assertClean: () => {
      expect(cspViolations).toEqual([]);
      expect(consoleErrors).toEqual([]);
      expect(pageErrors).toEqual([]);
      expect(thirdPartyRequests).toEqual([]);
      expect(failedAssetRequests).toEqual([]);
    },
  };
}

function assertStrictCspHeaders(headers: Record<string, string>) {
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
}

test.describe("M0 baseline shell and static export + CSP PoC", () => {
  test("verifies / baseline tokens, skip link, theme reload persistence, HTTP CSP headers, and axe WCAG 2.2 AA", async ({
    page,
  }, testInfo) => {
    const guards = await attachRuntimeGuards(page);
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    assertStrictCspHeaders(response?.headers() ?? {});

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
    if (testInfo.project.name === "mobile-touch") {
      await toggle.tap();
    } else {
      await toggle.click();
    }
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

    guards.assertClean();
  });

  test("verifies /poc-m0/ MDX+KaTeX rendering, hydration, disabled guards, 44px touch targets, and axe under CSP", async ({
    page,
  }, testInfo) => {
    const guards = await attachRuntimeGuards(page);
    const response = await page.goto("/poc-m0/");
    expect(response?.status()).toBe(200);
    assertStrictCspHeaders(response?.headers() ?? {});

    const mathRegion = page.locator('.katex-display[role="region"][tabindex="0"]');
    await expect(mathRegion).toBeVisible();
    await expect(page.locator("span.katex")).toBeVisible();

    const skipLink = page.getByRole("link", { name: /Lewati ke konten utama/i });
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();

    const liveCount = page.getByTestId("poc-live-count");
    await expect(liveCount).toContainText("Status hitung aktif: 0");

    const incrementBtn = page.getByTestId("poc-increment-btn");
    await incrementBtn.focus();
    await page.keyboard.press("Enter");
    await expect(liveCount).toContainText("Status hitung aktif: 1");

    await page.keyboard.press("Space");
    await expect(liveCount).toContainText("Status hitung aktif: 2");

    if (testInfo.project.name === "mobile-touch") {
      await incrementBtn.tap();
      await expect(liveCount).toContainText("Status hitung aktif: 3");
    }

    await page.getByRole("button", { name: /Atur Ulang Penghitung/i }).click();
    await expect(liveCount).toContainText("Status hitung aktif: 0");

    const disabledBtn = page.getByRole("button", { name: /Status Nonaktif/i });
    const ariaDisabledBtn = page.getByRole("button", { name: /Aksi Terkunci/i });
    await expect(disabledBtn).toBeDisabled();
    await expect(ariaDisabledBtn).toBeDisabled();
    await ariaDisabledBtn.click({ force: true });
    await ariaDisabledBtn.focus();
    await page.keyboard.press("Enter");
    await expect(liveCount).toContainText("Status hitung aktif: 0");

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
    expect(buttonAudit!.length).toBeGreaterThanOrEqual(4);
    for (const metric of buttonAudit!) {
      expect(metric.width).toBeGreaterThanOrEqual(44);
      expect(metric.height).toBeGreaterThanOrEqual(44);
    }

    expect(await disabledBtn.evaluate((el) => getComputedStyle(el).cursor)).toBe("not-allowed");
    expect(await ariaDisabledBtn.evaluate((el) => getComputedStyle(el).cursor)).toBe("not-allowed");
    expect(await incrementBtn.evaluate((el) => getComputedStyle(el).cursor)).toBe("pointer");

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
    await page.mouse.move(0, 0);
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(8, 24, 38)");
    await expect(themeToggle).toHaveCSS("background-color", "rgb(14, 36, 54)");
    await expect(themeToggle).toHaveCSS("color", "rgb(237, 244, 247)");
    const darkAxe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(darkAxe.violations).toEqual([]);

    guards.assertClean();
  });

  test("serves 404 with strict CSP headers cleanly", async ({ page }) => {
    const guards = await attachRuntimeGuards(page, { allow404ConsoleError: true });
    const response = await page.goto("/nonexistent-m0-check/");
    expect(response?.status()).toBe(404);
    assertStrictCspHeaders(response?.headers() ?? {});
    guards.assertClean();
  });

  test("honors prefers-reduced-motion: reduce strictly without animation hang", async ({
    page,
  }) => {
    const guards = await attachRuntimeGuards(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/poc-m0/");

    const styles = await page.getByTestId("poc-increment-btn").evaluate((el) => {
      const btnStyle = getComputedStyle(el);
      const htmlStyle = getComputedStyle(document.documentElement);
      return {
        transitionDuration: Number.parseFloat(btnStyle.transitionDuration),
        animationDuration: Number.parseFloat(btnStyle.animationDuration),
        scrollBehavior: htmlStyle.scrollBehavior,
      };
    });

    expect(styles.transitionDuration).toBeLessThanOrEqual(0.001);
    expect(styles.animationDuration).toBeLessThanOrEqual(0.001);
    expect(styles.scrollBehavior).toBe("auto");

    await page.getByTestId("poc-increment-btn").click();
    await expect(page.getByTestId("poc-live-count")).toContainText("Status hitung aktif: 1");
    guards.assertClean();
  });

  for (const route of ["/", "/poc-m0/"]) {
    for (const viewport of [
      { name: "mobile-320", width: 320, height: 568 },
      { name: "mobile-375", width: 375, height: 812 },
      { name: "tablet-768", width: 768, height: 1024 },
      { name: "desktop-1280", width: 1280, height: 800 },
    ]) {
      test(`has zero horizontal overflow on ${route} at ${viewport.name}`, async ({ page }) => {
        const guards = await attachRuntimeGuards(page);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(route);

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow).toBeLessThanOrEqual(0);
        guards.assertClean();
      });
    }
  }
});
