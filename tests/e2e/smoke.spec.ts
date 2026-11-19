import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const M1_ROUTES = [
  "/",
  "/kurikulum/",
  "/kurikulum/1-1-sejarah-evolusi/",
  "/kurikulum/1-2-nadi-global/",
  "/kurikulum/1-3-arsitektur-sistem/",
  "/kurikulum/1-4-bisnis-konektivitas/",
  "/kurikulum/1-5-siklus-survei-laut/",
  "/kurikulum/1-3-arsitektur-sistem/arsitektur-ujung-ke-ujung/",
  "/lab/",
  "/lab/eksplorer-sistem/",
  "/latihan/",
  "/latihan/quiz-1.3-01-arch/",
  "/referensi/",
  "/referensi/glosarium/",
  "/tentang/",
  "/tentang/sumber/",
  "/tentang/verifikasi-fakta/",
] as const;

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
    if (status >= 400 && !res.url().includes("/nonexistent-m1-check")) {
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
  expect(scriptSrcDirective).toContain("'sha256-");
  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["content-security-policy"]).toContain("object-src 'none'");
  expect(headers["content-security-policy"]).toContain("base-uri 'self'");
}

test.describe("M1 Vertical Slice: Shell, MDX Lesson 1.3-01, Explorer, Quiz, Reference, A11y & CSP", () => {
  test("verifies global shell, skip link, mobile/tablet drawer Escape focus return, theme persistence, and internal link integrity", async ({
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
    expect(await page.locator("h1").count()).toBe(1);

    const blockingHeadScripts = await page.evaluate(() => {
      const scripts = Array.from(
        document.head.querySelectorAll("script[src]")
      ) as HTMLScriptElement[];
      return scripts
        .filter(
          (el) =>
            !el.async &&
            !el.hasAttribute("async") &&
            !el.defer &&
            !el.hasAttribute("defer") &&
            !el.noModule &&
            !el.hasAttribute("nomodule") &&
            el.type !== "module"
        )
        .map((el) => el.getAttribute("src"));
    });
    expect(blockingHeadScripts).toEqual([]);

    const skipLink = page.getByRole("link", { name: /Lewati ke konten utama/i });
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();

    if (testInfo.project.name === "mobile-touch") {
      const menuBtn = page.getByRole("button", { name: /Buka menu navigasi/i });
      await expect(menuBtn).toBeVisible();
      await menuBtn.tap();
      await expect(page.locator("#mobile-nav-drawer")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.locator("#mobile-nav-drawer")).toBeHidden();
      await expect(menuBtn).toBeFocused();

      await menuBtn.tap();
      const toggle = page.getByRole("button", { name: /Mode Abyssal Dark/i });
      await toggle.tap();
      await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    } else {
      const toggle = page.getByRole("button", { name: /Mode Abyssal Dark/i });
      await toggle.click();
      await expect(page.locator("html")).toHaveClass(/\bdark\b/);
    }

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/);

    const internalHrefs = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll("a[href]"));
      return Array.from(
        new Set(
          anchors
            .map((a) => a.getAttribute("href") ?? "")
            .filter((href) => href.startsWith("/") && !href.startsWith("//"))
            .map((href) => href.split("#")[0] || "/")
        )
      );
    });
    expect(internalHrefs.length).toBeGreaterThanOrEqual(8);
    for (const href of internalHrefs) {
      const res = await page.request.get(href);
      expect(res.status(), `Dead internal link: ${href}`).toBeLessThan(400);
    }

    guards.assertClean();
  });

  test("verifies real MDX Lesson 1.3-01 rendering, KaTeX math, table wrapper, embedded explorer, and progress persistence", async ({
    page,
  }) => {
    const guards = await attachRuntimeGuards(page);
    const response = await page.goto("/kurikulum/1-3-arsitektur-sistem/arsitektur-ujung-ke-ujung/");
    expect(response?.status()).toBe(200);
    assertStrictCspHeaders(response?.headers() ?? {});

    await expect(page.locator("h1")).toContainText("Arsitektur Ujung-ke-Ujung Sistem Kabel Laut");
    await expect(page.locator(".katex-display[role='region'][tabindex='0']").first()).toBeVisible();
    await expect(page.locator("span.katex").first()).toBeVisible();

    const comparisonTable = page.getByRole("region", {
      name: /Tabel data teknis pelajaran/i,
    });
    await expect(comparisonTable).toBeVisible();

    const ctbSummary = page.locator("summary", { hasText: /Peran CTB dan LME\/NMS/i });
    await ctbSummary.click();
    await expect(page.getByText(/Cable Terminating Box/i).first()).toBeVisible();

    const markBtn = page.getByRole("button", { name: "Tandai Selesai" });
    await markBtn.click();
    await expect(page.getByText("Selesai Dibaca")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Selesai Dibaca")).toBeVisible();

    // Exercise the embedded SystemExplorerLab inside Lesson 1.3-01.
    const embeddedInspector = page.getByTestId("explorer-inspector");
    await expect(embeddedInspector).toContainText("Repeater: Repeater EDFA");
    await page.getByRole("button", { name: "Repeaterless ROPA" }).click();
    await expect(embeddedInspector).toContainText("ROPA: Remote Optically Pumped Amplifier");

    guards.assertClean();
  });

  test("verifies Lab (c) System Explorer SVG/table parity, repeatered vs ROPA DC PFE toggle, >=44px targets and >=8px gaps", async ({
    page,
  }, testInfo) => {
    const guards = await attachRuntimeGuards(page);
    const response = await page.goto("/lab/eksplorer-sistem/");
    expect(response?.status()).toBe(200);
    assertStrictCspHeaders(response?.headers() ?? {});

    const svg = page.getByRole("img");
    await expect(svg).toBeVisible();

    const inspector = page.getByTestId("explorer-inspector");
    await expect(inspector).toContainText("Repeater: Repeater EDFA");

    // Verify touch target dimensions (>= 44x44px) and pairwise spacing (>= 8px) inside .abyss-bay controls.
    const controlGroups = await page.evaluate(() => {
      const groups = Array.from(document.querySelectorAll('.abyss-bay [role="group"]'));
      return groups.map((group) =>
        Array.from(group.querySelectorAll("button")).map((btn) => {
          const rect = btn.getBoundingClientRect();
          return {
            text: btn.textContent?.trim() ?? "",
            width: rect.width,
            height: rect.height,
            top: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            right: rect.right,
            cursor: getComputedStyle(btn).cursor,
          };
        })
      );
    });

    expect(controlGroups.length).toBeGreaterThanOrEqual(3);
    for (const groupButtons of controlGroups) {
      for (const btn of groupButtons) {
        expect(btn.width, `Button too narrow: ${btn.text}`).toBeGreaterThanOrEqual(44);
        expect(btn.height, `Button too short: ${btn.text}`).toBeGreaterThanOrEqual(44);
        expect(btn.cursor, `Button missing pointer cursor: ${btn.text}`).toBe("pointer");
      }
      for (let i = 0; i < groupButtons.length; i += 1) {
        for (let j = i + 1; j < groupButtons.length; j += 1) {
          const a = groupButtons[i];
          const b = groupButtons[j];
          const horizontalGap = Math.max(a.left - b.right, b.left - a.right);
          const verticalGap = Math.max(a.top - b.bottom, b.top - a.bottom);
          expect(Math.max(horizontalGap, verticalGap)).toBeGreaterThanOrEqual(7.5);
        }
      }
    }

    await page.getByRole("button", { name: "Open Cable" }).click();
    await expect(svg).toContainText("Open G.977.1");
    await page.getByRole("button", { name: "Repeaterless EDFA" }).click();
    await expect(inspector).toContainText("BMH: Beach Manhole");

    const ropaModeBtn = page.getByRole("button", { name: "Repeaterless ROPA" });
    if (testInfo.project.name === "mobile-touch") {
      await ropaModeBtn.tap();
    } else {
      await ropaModeBtn.click();
    }

    await expect(inspector).toContainText("BMH: Beach Manhole");
    await page.getByRole("button", { name: /^ROPA$/ }).click();
    await expect(inspector).toContainText("ROPA: Remote Optically Pumped Amplifier");
    const summaryTable = page.getByRole("region", {
      name: /Tabel ringkasan komponen arsitektur sistem kabel laut/i,
    });
    await expect(summaryTable).toContainText(
      "Tidak aktif pada mode repeaterless (0 V daya DC PFE)."
    );

    await page.getByRole("button", { name: "Simulasikan Sinyal" }).click();
    await expect(page.getByTestId("signal-status-badge")).toBeVisible();
    await page.getByRole("button", { name: "Atur Ulang Parameter" }).click();
    await expect(inspector).toContainText("Repeater: Repeater EDFA");
    await expect(page.getByTestId("signal-status-badge")).toHaveCount(0);

    guards.assertClean();
  });

  test("verifies 5-question quiz validation focus jump, scoring, lesson fragment resolution, and local progress reset", async ({
    page,
  }) => {
    const guards = await attachRuntimeGuards(page);
    const rscOk: string[] = [];
    page.on("response", (res) => {
      const reqPath = new URL(res.url()).pathname;
      if (reqPath.includes("__next.") && reqPath.endsWith(".txt")) {
        expect(res.status(), `Broken RSC segment prefetch: ${res.url()}`).toBe(200);
        rscOk.push(reqPath);
      }
    });
    await page.goto("/latihan/quiz-1.3-01-arch/");

    await page.getByRole("button", { name: "Periksa Jawaban" }).click();
    const alertBox = page.locator('[role="alert"]:not(#__next-route-announcer__)');
    await expect(alertBox).toContainText("Pilih satu jawaban pada soal nomor 1.");
    await expect(page.locator('input[name="q-1.3-01-01"][value="a"]')).toBeFocused();

    const correctChoices = [
      { name: "q-1.3-01-01", value: "a" },
      { name: "q-1.3-01-02", value: "b" },
      { name: "q-1.3-01-03", value: "b" },
      { name: "q-1.3-01-04", value: "b" },
      { name: "q-1.3-01-05", value: "b" },
    ];
    for (const choice of correctChoices) {
      await page.locator(`input[name="${choice.name}"][value="${choice.value}"]`).check();
    }

    await page.getByRole("button", { name: "Periksa Jawaban" }).click();
    await expect(page.getByText(/Skor Anda: 5 dari 5 benar \(100%\)/i)).toBeVisible();

    // Verify retry reset clears score and supports client-side soft Link back to lesson.
    await page.getByRole("button", { name: "Ulangi Latihan" }).click();
    await expect(page.getByText(/Skor Anda:/i)).toHaveCount(0);
    await page.locator('input[name="q-1.3-01-01"][value="b"]').check();
    for (const choice of correctChoices.slice(1)) {
      await page.locator(`input[name="${choice.name}"][value="${choice.value}"]`).check();
    }
    await page.getByRole("button", { name: "Periksa Jawaban" }).click();
    await expect(page.getByText(/Skor Anda: 4 dari 5 benar \(80%\)/i)).toBeVisible();
    await expect(page.getByText(/Perlu Tinjauan \(Kunci: A\)/i)).toBeVisible();

    const backLink = page.getByRole("link", { name: /Tinjau Bagian Materi Terkait/i }).first();
    const href = await backLink.getAttribute("href");
    expect(href).toMatch(/\/kurikulum\/1-3-arsitektur-sistem\/arsitektur-ujung-ke-ujung\/#/);
    await backLink.click();
    const fragmentId = href!.split("#")[1];
    await expect(page.locator(`#${fragmentId}`)).toBeVisible();
    expect(rscOk.length).toBeGreaterThanOrEqual(1);

    await page.goto("/latihan/");
    await expect(page.getByText(/Tersimpan secara lokal:/i)).toBeVisible();
    await page.getByRole("button", { name: "Reset Progres Lokal" }).click();
    await expect(
      page.getByText(/Belum ada riwayat latihan tersimpan di peramban ini/i)
    ).toBeVisible();

    guards.assertClean();
  });

  test("verifies dual curriculum order (?urut=hari), glossary search/focus recovery, honest 1.4/1.5/404, and governance registries", async ({
    page,
  }) => {
    const guards = await attachRuntimeGuards(page, { allow404ConsoleError: true });

    await page.goto("/kurikulum/");
    await page.getByRole("button", { name: /Urutan Hari/i }).click();
    expect(page.url()).toContain("urut=hari");
    const moduleHeadings = await page.locator("ol li h2").allTextContents();
    expect(moduleHeadings[3]).toContain("Siklus Proyek dan Survei Kelautan");
    expect(moduleHeadings[4]).toContain("Bisnis dan Ekonomi Konektivitas");

    await page.goto("/kurikulum/1-4-bisnis-konektivitas/");
    await expect(page.getByText(/Materi Modul 1.4 belum tersedia/i)).toBeVisible();

    await page.goto("/kurikulum/1-5-siklus-survei-laut/");
    await expect(
      page.getByRole("heading", { name: /Menunggu Audit Sumber Hari 3/i })
    ).toBeVisible();

    await page.goto("/referensi/glosarium/");
    const searchInput = page.getByLabel(/Cari istilah Inggris atau Indonesia/i);
    await searchInput.fill("manhole pantai");
    await expect(page.getByText(/BMH: Beach Manhole/i)).toBeVisible();
    await searchInput.fill("istilah-fiktif-xyz");
    await expect(page.getByText(/Tidak ada istilah cocok/i)).toBeVisible();
    await page.getByRole("button", { name: "Hapus Filter" }).click();
    await expect(searchInput).toBeFocused();
    await expect(page.getByText(/PoP: Point of Presence/i)).toBeVisible();

    await page.goto("/tentang/sumber/");
    await expect(page.getByText("src-itu-g977-1")).toBeVisible();

    await page.goto("/tentang/verifikasi-fakta/");
    const factTableRegion = page.getByRole("region", {
      name: "Tabel log verifikasi fakta klaim publik",
    });
    await expect(factTableRegion.getByText("fc-armour-depths")).toBeVisible();
    await page.getByRole("button", { name: "Terverifikasi", exact: true }).click();
    await expect(page.getByText(/Tidak ada catatan verifikasi fakta/i)).toBeVisible();
    await page.getByRole("button", { name: "Tampilkan Semua Status" }).click();
    await expect(page.getByRole("button", { name: "Semua Status" })).toBeFocused();
    await expect(factTableRegion.getByText("fc-armour-depths")).toBeVisible();

    // Verify 1024px breakpoint keeps desktop header on one line below scroll-padding-top clearance.
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/");
    const headerHeight = await page
      .locator("header")
      .evaluate((el) => el.getBoundingClientRect().height);
    expect(headerHeight).toBeLessThanOrEqual(72);

    const notFoundRes = await page.goto("/nonexistent-m1-check/");
    expect(notFoundRes?.status()).toBe(404);
    assertStrictCspHeaders(notFoundRes?.headers() ?? {});
    await expect(
      page.getByRole("heading", { name: /Halaman Pelajaran atau Modul Tidak Ditemukan/i })
    ).toBeVisible();

    guards.assertClean();
  });

  test("runs axe WCAG 2.2 AA across all 17 M1 routes in Pelagic Light and Abyssal Dark", async ({
    page,
  }) => {
    const guards = await attachRuntimeGuards(page);

    for (const route of M1_ROUTES) {
      await page.goto(route);
      await page.evaluate(() => {
        document.documentElement.classList.remove("dark");
      });
      await page.waitForFunction(
        () => getComputedStyle(document.body).backgroundColor === "rgb(246, 248, 249)"
      );
      await page.waitForTimeout(180);

      const lightAxe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(lightAxe.violations, `Light axe violations on ${route}`).toEqual([]);

      await page.evaluate(() => {
        document.documentElement.classList.add("dark");
      });
      await page.waitForFunction(
        () => getComputedStyle(document.body).backgroundColor === "rgb(8, 24, 38)"
      );
      await page.waitForTimeout(180);

      const darkAxe = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(darkAxe.violations, `Dark axe violations on ${route}`).toEqual([]);
    }

    guards.assertClean();
  });

  test("honors prefers-reduced-motion: reduce, 200% text scaling, and short virtual-keyboard viewport", async ({
    page,
  }) => {
    const guards = await attachRuntimeGuards(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/lab/eksplorer-sistem/");

    const scrollBehavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior
    );
    expect(scrollBehavior).toBe("auto");

    await page.getByRole("button", { name: "Simulasikan Sinyal" }).click();
    await expect(page.getByTestId("signal-status-badge")).toBeVisible();
    // Under reduced motion, animated m.circle must not mount.
    expect(await page.locator("svg circle").count()).toBe(0);

    for (const route of [
      "/",
      "/kurikulum/1-3-arsitektur-sistem/arsitektur-ujung-ke-ujung/",
      "/lab/eksplorer-sistem/",
      "/latihan/quiz-1.3-01-arch/",
      "/referensi/glosarium/",
    ]) {
      await page.goto(route);
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      const zoomOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(zoomOverflow, `200% zoom overflow on ${route}`).toBeLessThanOrEqual(0);
    }

    // Soft-keyboard height check on glossary search input + scrollable mobile drawer clearance.
    await page.setViewportSize({ width: 375, height: 420 });
    await page.goto("/referensi/glosarium/");
    const searchInput = page.getByLabel(/Cari istilah Inggris atau Indonesia/i);
    await searchInput.focus();
    const visibleBox = await searchInput.boundingBox();
    expect(visibleBox).not.toBeNull();
    expect(visibleBox!.y + visibleBox!.height).toBeLessThanOrEqual(420);

    await page.getByRole("button", { name: /Buka menu navigasi/i }).click();
    const drawer = page.locator("#mobile-nav-drawer");
    await expect(drawer).toBeVisible();
    const closeBtn = drawer.getByRole("button", { name: "Tutup Menu" });
    await closeBtn.scrollIntoViewIfNeeded();
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(page.getByRole("button", { name: /Buka menu navigasi/i })).toBeFocused();

    guards.assertClean();
  });

  for (const route of M1_ROUTES) {
    for (const viewport of [
      { name: "mobile-320", width: 320, height: 568 },
      { name: "tablet-768", width: 768, height: 1024 },
      { name: "desktop-1280", width: 1280, height: 800 },
    ]) {
      test(`has 0px overflow and strict CSP on ${route} at ${viewport.name}`, async ({ page }) => {
        const guards = await attachRuntimeGuards(page);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        const res = await page.goto(route);
        expect(res?.status()).toBe(200);
        assertStrictCspHeaders(res?.headers() ?? {});

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow).toBeLessThanOrEqual(0);
        guards.assertClean();
      });
    }
  }
});
