# M1 Acceptance Report & M2 / M4a Readiness Handoff

- **Product:** SEDP Learning Hub (Independent Indonesian Subsea Cable Learning Resource)
- **Reviewed Baseline Commit:** `0cb56fb` -> **Acceptance Fix Code Head:** `f4d3fde` (local branch `feat/m1-vertical-slice`; zero push / zero remote sync)
- **Date:** 2026-11-19
- **Roles Executed:** Principal Engineering Lead, Educational Product QA Reviewer, plus 5 independent read-only specialist reviews (Subsea Engineering, Curriculum & Provenance, Accessible UX & Antislop, Static Export/CSP & Cross-Platform, Regression Testing)
- **Phase F Isolation:** Verified clean (zero `/api/v1` handlers, zero auth, zero DB, zero runtime trackers, zero secrets)

---

## 1. Acceptance Verdict & Recommendation

**M1 Acceptance Recommendation: ACCEPT M1 WITH RELEASES-ONLY CONDITIONS (`PASS` on all M1 vertical-slice engineering, pedagogy, automated QA, and CSP gates; `CONDITIONAL` strictly on pre-public-launch Manual Screen-Reader Sign-Off and Production Host CSP Header Adapter).**

All three CRITICAL/HIGH runtime bugs discovered during this acceptance audit (a stale-write `localStorage` fallback race in `progress.ts`, `Sea Earth (+V/2)` / `BMH` bypass / `Shore End = Light Weight` schematic defects in `SystemExplorerLab`, and `FactCheckTable` empty-reset focus drop / `1024px` header wrapping / short-viewport drawer clipping / `.csp-manifest.json` SHA-256 freshness coupling) have been narrowly fixed and re-verified on `HEAD` with **26/26 Vitest unit tests** and **116/116 Playwright + `@axe-core/playwright` E2E checks** passing cleanly.

Do **not** gate M2 physics engine or M4a primary source verification behind M1 any further; promote M1 to accepted baseline while gating **public production launch** on the Section 7 Release-Only Blockers.

---

## 2. Inspected Routes & Visual Evidence (Desktop & Mobile)

Captured against the production static export served through `scripts/serve-export-with-csp.mjs` with enforced HTTP `Content-Security-Policy` headers (`issues: []`, 0 CSP violations, 0 console/page errors):

| Route                                                         | Viewports & Themes Captured                                                    | Evidence Screenshot                                                                                                                                                                                                                                                                              | Key Visual Verification Result                                                                                                                                                                                                        |
| :------------------------------------------------------------ | :----------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/` (Beranda)                                                 | Desktop `1280x800` Light & Dark; Mobile `390x844` Light                        | [home-desktop-light.png](./screenshots/home-desktop-light.png), [home-desktop-dark.png](./screenshots/home-desktop-dark.png), [home-mobile-light.png](./screenshots/home-mobile-light.png)                                                                                                       | Clear Pelagic Editorial typography (`Source Serif 4` + `IBM Plex Sans`), `.abyss-bay` spotlight panel, 5-stage narrative, honest `1.1-1.5` module status badges, 0px overflow.                                                        |
| `/kurikulum/1-3-arsitektur-sistem/arsitektur-ujung-ke-ujung/` | Desktop `1280x800` Light; Mobile `390x844` Light                               | [lesson-1.3-01-desktop.png](./screenshots/lesson-1.3-01-desktop.png), [lesson-1.3-01-mobile.png](./screenshots/lesson-1.3-01-mobile.png)                                                                                                                                                         | Real MDX + GFM table + KaTeX display formulas, embedded `<SystemExplorerBay>`, mobile collapsible TOC + glossary chips, clean disclosure controls.                                                                                    |
| `/lab/eksplorer-sistem/`                                      | Desktop `1280x800` (Repeatered Light, ROPA Light, ROPA Dark); Mobile `390x844` | [explorer-repeatered-desktop.png](./screenshots/explorer-repeatered-desktop.png), [explorer-ropa-desktop.png](./screenshots/explorer-ropa-desktop.png), [explorer-ropa-dark-desktop.png](./screenshots/explorer-ropa-dark-desktop.png), [explorer-mobile.png](./screenshots/explorer-mobile.png) | Corrected `PFE (+V/2)` / `PFE (-V/2)` vs `Sea Earth (~0 V)` earth glyphs, optical + DC pass-through inside `BMH`, `1480 nm` pump legend, `ROPA` bypass around inactive `BU`, synchronized 9-row table, mobile horizontal scroll cues. |

Additional automated coverage ran across all **17 static M1 HTML routes** at `320px`, `768px`, `1024px` (header single-row check), `1280px`, `200%` root font scaling, and `375x420` soft-keyboard framing in both Pelagic Light and Abyssal Dark.

---

## 3. Severity-Ranked Acceptance Findings & Dispositions

### CRITICAL

1. **[FIXED] Stale-overwrite bug in `readLocalProgress()` after `setItem` quota/privacy failure** (`src/lib/storage/progress.ts`)
   - **Defect at `0cb56fb`:** If `localStorage` held an older saved state (`raw !== null`) and a later `saveQuizProgress()` threw `QuotaExceededError` (`storageWriteFailed = true`, `cachedRawJson = null`), the subsequent `readLocalProgress()` read the stale `raw` JSON from `localStorage` before checking `storageWriteFailed`, overwriting `memoryFallbackProgress`. Masked in unit tests by calling `resetLocalProgress()` before mocking `setItem`.
   - **Fix:** Checked `if (storageWriteFailed) { return memoryFallbackProgress; }` before reading `window.localStorage.getItem(...)`, and added regression tests seeding prior storage state before throwing `QuotaExceededError` and `SecurityError`.

2. **[FIXED - Coverage Gap] Client-side `<Link>` soft navigation & Windows RSC `.txt` payloads untested over HTTP; CSP helper untested in Vitest** (`tests/e2e/smoke.spec.ts`, `tests/unit/verify-gates.test.ts`)
   - **Defect at `0cb56fb`:** `smoke.spec.ts` mostly tested `page.goto()` hard document loads and never asserted HTTP `200` on `__next.*.txt` RSC prefetch payloads; `normalizeWindowsRscSegmentFiles` and `extractInlineScriptHashes` had zero unit tests.
   - **Fix:** Added response listener verifying `new URL(url).pathname` matching `__next.*.txt` returns HTTP `200` during quiz-to-lesson `<Link>` soft navigation, plus direct temp-dir unit tests on `normalizeWindowsRscSegmentFiles` (including stale-file overwrite) and script hash rejection.

### HIGH

3. **[FIXED] Misleading `Sea Earth (+V/2)` / `(-V/2)` polarity labels & `12 px` disconnected ground wire** (`src/features/simulators/components/system-explorer-lab.tsx`)
   - **Defect at `0cb56fb`:** SVG labeled ocean return electrodes `Sea Earth A (+V/2)` and `Sea Earth B (-V/2)` while `CLS A` `PFE` omitted `(+V/2)`, and Sea Earth A's wire started at `y=244` (`12 px` below `PFE`'s `y=232` edge) without a ground glyph. Physically, `±V_total/2` applies to the **PFE line feeds**, whereas **Sea Earth** sits near `~0 V` ocean reference.
   - **Fix:** Relabeled CLS A box to `PFE (+V/2)`, electrodes to `Sea Earth A (~0 V)` and `Sea Earth B (~0 V)`, connected Sea Earth A wire cleanly from `y=232`, and drew standard 3-bar earth symbols at both ends.

4. **[FIXED] Optical & DC PFE paths bypassed `BMH` in schematic SVG** (`src/features/simulators/components/system-explorer-lab.tsx`)
   - **Defect at `0cb56fb`:** DC PFE path ran `38 px` beneath `BMH` (`y=226` vs `y=132..188`) and optical path clipped `4 px` above `BMH`'s top edge (`y=128`), contradicting Lesson `1.3-01` and `glossary.json`.
   - **Fix:** Routed optical (`y=148`), ROPA pump (`y=156`), and DC PFE (`y=172`) straight through `BMH` into `Shore End`.

5. **[FIXED] Empty-state reset focus drop in `FactCheckTable` (`WCAG 2.4.3`)** (`src/components/about/fact-check-table.tsx`)
   - **Defect at `0cb56fb`:** Clicking `"Tampilkan Semua Status"` inside the unmounted `<div role="status">` dropped focus to `document.body`; filter count updates lacked `aria-live="polite"`.
   - **Fix:** Restored focus via `requestAnimationFrame` to `"Semua Status"` button ref + added `sr-only` `aria-live="polite"` announcement and E2E `toBeFocused()` check.

6. **[FIXED] Sticky mobile drawer lacked `max-height` scroll on short viewports & `1024px` header wrapped past `scroll-padding-top`** (`src/components/layout/site-header.tsx`)
   - **Defect at `0cb56fb`:** Open `#mobile-nav-drawer` clipped `"Tutup Menu"` and `ThemeToggle` on `375x420` / `200%` text zoom, and at `1024px` (`lg:`), the desktop navbar + subtitle + `ThemeToggle` wrapped to `85px`, crowding `scroll-padding-top: 6rem` (`96px`).
   - **Fix:** Added `max-h-[calc(100dvh-4.5rem)] overflow-y-auto` on `#mobile-nav-drawer`, hid brand subtitle at `lg` (`hidden sm:inline lg:hidden xl:inline`), tightened nav padding (`px-2 xl:px-3 whitespace-nowrap`) dropping `1024px` header height `<= 72px`, and added E2E checks for both.

7. **[FIXED] `.csp-manifest.json` was not hash-coupled to exported `out/` HTML** (`scripts/generate-csp-hashes.mjs`, `scripts/serve-export-with-csp.mjs`)
   - **Defect at `0cb56fb`:** Running `pnpm build` without re-running `pnpm csp:hashes` allowed `serve-export-with-csp.mjs` to serve newly built `out/` HTML with stale CSP hashes. Also, `maxRouteHeaderBytes > 2000` only warned.
   - **Fix:** Stored `htmlSha256` per route in `.csp-manifest.json`, enforced strict digest equality (`HTTP 500` fail-closed on mismatch) inside `serve-export-with-csp.mjs`, upgraded `maxRouteHeaderBytes > 2000` to hard exit `1`, and allowed secondary standalone `$RC(...)` Suspense boundaries.

8. **[OPEN - M4a / Release Blocker] Source provenance granularity & `Kepmen KP 14/2021` direct permalink** (`content/sources.json`, `content/lessons/1.3-01-arsitektur-ujung-ke-ujung.mdx`)
   - **Detail:** See Section 5 below.

9. **[OPEN - Production Deployment Blocker] Static-host CSP deployment adapter & `aggregateHeaderBytes` scaling (`1705 / 2000` bytes)**
   - **Detail:** See Section 6 below.

10. **[OPEN - Pre-M2 QA Coverage] Negative CLI execution tests for `verify-content.ts` / `verify-assets.ts` and `FactCheckTable` `primary_source_id`/`checked_at` columns** (`scripts/verify-content.ts`, `src/components/about/fact-check-table.tsx`, `tests/unit/verify-gates.test.ts`)
    - **Disposition:** Scheduled at start of `M4a` (when `FactCheckRecord` rows begin transitioning from `null` to verified records) and before M2 CI expansion.

### MEDIUM

- **[FIXED] `"Shore End"` mislabeled as `"Light Weight"` under deep-sea preset (`((...))` double parens too)** (`src/features/simulators/engine/system-explorer.ts`, `src/features/simulators/components/system-explorer-lab.tsx`): Separated coastal `"Shore End"` label from active deep-sea route profile (`"Profil Rute: Light Weight (LW)"`).
- **[FIXED] Optical path cut through inactive dashed `BU`/`Repeater` in repeaterless modes & missing ROPA pump legend** (`system-explorer-lab.tsx`, `1.3-01.mdx`, `glossary.json`): Bypassed inactive boxes (`y=154`), hid `BU` branch line when `BU` inactive, added green dashed `~1480 nm` pump legend + lesson/glossary alignment + `"pita ~1550 nm (pita-C / C+L)"` qualification, and added `via BMH B` label at `UJUNG B`.
- **[FIXED] Missing `color-scheme: light/dark` on native inputs/scrollbars in `globals.css`** (`src/app/globals.css`).
- **[FIXED] `4px` (`gap-1`/`space-y-1`) inter-target vertical spacing below `8px` target in breadcrumbs, footer links, and lesson TOC** (updated to `gap-2` / `space-y-2` across shell and breadcrumbs).
- **[FIXED] Quiz validation inline feedback & reset `aria-live`** (`src/features/practice/components/quiz-runner.tsx`): Added `aria-invalid`, `aria-describedby`, border highlight, inline error text inside the unanswered question `<fieldset>`, and reset status announcement.
- **[FIXED] Unconditional overwrite on Windows RSC `copyFileSync`** (`scripts/generate-csp-hashes.mjs`): Replaced `if (!existsSync(flatPath))` guard so non-clean `out/` directories cannot retain stale `.txt` RSC payloads.
- **[OPEN - Post-M1 Polish]** Full pairwise button spacing sweep outside `.abyss-bay [role="group"]`, `ThemeToggle` / `SiteHeader` constant-label decoupled state (`SiteHeader` mobile drawer background `inert` / focus trap), and `SystemExplorer` `variant="embedded"` Vitest test.

### LOW

- **[FIXED]** Sequential `aria-live` simulation counter (`Simulasi ke-N`), numbered KaTeX region `aria-label` (`Persamaan matematika 1, 2, ...`), fenced-code exclusion in `extractLessonHeadings`, and hardware-neutral BU switching phrasing (`"sakelar relai daya bertegangan tinggi"`).
- **[OPEN - M2/M3 Polish]** Dynamic source-registry caption (removing `"sintesis materi M1"` in `src/app/tentang/sumber/page.tsx:62`), linking `fact_check_ids` directly from Lesson Reader header metadata badge, reading `unavailable_reason_id` directly in `[moduleSlug]/page.tsx`, and reviewing minor `font-mono` eyebrow typography tokens against `DESIGN.md` §4 (`R-06`).

---

## 4. Educational & Engineering Accuracy Review

- **Lesson `1.3-01` ([1.3-01-arsitektur-ujung-ke-ujung.mdx](file:///C:/Codes/SEDP%20Notebook%20Live/content/lessons/1.3-01-arsitektur-ujung-ke-ujung.mdx)):**
  - Cleanly structured in 5 pedagogical stages (`Intuisi Utama` -> `Diagram Terjangkar` -> `Pendalaman Teknis` -> `Kasus Nyata Bersumber` -> `Uji Pemahaman`).
  - Correctly explains `Dry Plant` (`PoP`, `CLS` with `SLTE`, `CTB`, `PFE`, `LME/NMS`, `COTDR`) vs `Transisi Pantai` (`BMH`, shore end armour) vs `Wet Plant` (`Repeater EDFA`, `Equalizer`, `Branching Unit`, passive `ROPA`).
  - Accurately models **Repeaterless (`G.973`)** vs **Repeatered (`G.977`)** vs **Open Cable (`G.977.1` partial transverse compatibility)** and dual-end opposite-polarity DC series feeding (`+V_total/2` at Station A, `-V_total/2` at Station B, virtual mid-route zero-volt point, `Sea Earth (~0 V)` return, and `V_total = I*(2*R_out + r*L) + 2*V_earth + N_rep*V_rep`).
  - Explicitly distinguishes optical paths (`~1550 nm C/C+L` plus `~1480 nm` optical ROPA pumping) from electrical copper DC paths, confirming **0 V PFE / zero sea earth** in both `repeaterless-edfa` and `repeaterless-ropa` modes.
  - Withholds unverified meter-depth armour transitions (`fc-armour-depths`) behind an explicit technical caveat and qualitative armour presets (`DA`, `SA/LWP`, `LW`).
- **Original Quiz & Glossary ([quiz-1.3-01-arch.json](file:///C:/Codes/SEDP%20Notebook%20Live/content/quizzes/quiz-1.3-01-arch.json), [glossary.json](file:///C:/Codes/SEDP%20Notebook%20Live/content/glossary.json)):** Zero copied closed-course items; all 5 quiz distractors and rationales anchor directly to `1.3-01` sections, and all 8 glossary records resolve bidirectionally.

---

## 5. Source Provenance Audit (`content/sources.json`)

1. **Quarantine & Rights Hygiene:** `verify:content` and `verify:assets` pass cleanly; zero restricted NEC `"Internal Use Only"` PDFs, zero SubCom `[Restricted]` slides, zero TeleGeography screenshots, and zero trainer PII exist anywhere in repository or `sources-private/`.
2. **Audit of the 7 `CLEARED` Sources (`content/sources.json`):**
   - `src-itu-g971`, `src-itu-g972`, `src-itu-g973`, `src-itu-g977`, `src-itu-g977-1`: Legitimate ITU-T Recommendation metadata, verified `G.977.1` (`10/2020`, _"Transverse compatible DWDM applications..."_). **Provenance Gap:** URLs point to series landing pages (`/rec/T-REC-G.97*`) without pinned Recommendation edition dates or clause numbers.
   - `src-chesnoy-ufcs`: Valid monograph metadata (2nd Ed., ISBN `978-0-12-804269-4`, Elsevier). **Provenance Gap:** Cites book root URL without chapter numbers for `gls-pop` interface concepts, typical `~25 tahun` wet-plant life, `1550 nm` band, and `1480 nm` ROPA pumping.
   - `src-kepmen-kp-14-2021`: Public Indonesian Ministerial Decree (signed 18 Feb 2021) establishing **217 cable corridor segments**, **209 BMH**, and **4 national landing hubs (Batam, Kupang, Manado, Jayapura)** (cross-confirmed via `setkab.go.id` / `kkp.go.id` web verification during M1 review). **Provenance Gap:** `external_url` points to `"https://jdih.kkp.go.id/"` portal root rather than the direct regulation document/PDF URL and Diktum/Lampiran citation.
   - **Rule for Next Milestone:** M4a must backfill edition dates, direct JDIH permalink, and clause/chapter granularity alongside verifying the 12 open claims in `content/fact-checks.json`.

---

## 6. CSP, Static Export & Cross-Platform Reliability Analysis

1. **Upstream Windows Bug Verified (`vercel/next.js` Issue `#92339` / `#85374`):** Confirmed directly in `node_modules/next/dist/export/index.js:754-807` (`collectSegmentPathsImpl`) and `segment-value-encoding.js:82-84` (`convertSegmentPathToStaticExportFilename`): Next.js 16.4.6 on Windows joins segment paths with `\`, creating nested `out/.../__next.<seg>/<subseg>/__PAGE__.txt` folders whereas Next's client router requests dotted flat URLs (`/__next.<seg>.<subseg>.__PAGE__.txt`).
2. **Cross-Platform Parity (`Windows` vs Linux `ubuntu-latest` CI):**
   - `normalizeWindowsRscSegmentFiles` copies nested `.txt` payloads to flat aliases with unconditional overwrite (`copyFileSync` without stale-file skip). On POSIX/Linux builds (or once upstream patches `#92339`), nested directories are absent and `normalizeWindowsRscSegmentFiles` returns `0` harmlessly.
   - Remaining non-blocking artifact detail: on Windows builds, nested `__next.*` directories stay alongside the 17 flattened `.txt` files inside `out/` (larger artifact tree, harmless over HTTP).
3. **Production Host CSP Scaling Risk (`_headers` 2,000-byte Cap):**
   - Current M1 single-route CSP max is `787` bytes (`<= 2000`), while `aggregateHeaderBytes` across all 20 HTML files is already **`1,705` bytes** (`27` unique hashes), leaving only `295` bytes of headroom on a flat `/*` static `_headers` rule. Adding M2/M3 routes will exceed 2,000 bytes on flat `/*`, requiring either **per-route CSP headers** driven by `.csp-manifest.json` (remembering static host rule-count limits such as Cloudflare Pages' 100 `_headers` rules) or a lightweight **CDN Edge Worker / Cloudflare Function** reading `.csp-manifest.json` before public deployment.

---

## 7. Accessibility Audit: Automated vs Manual Gap Boundary

- **Automated Verification (`0` `@axe-core/playwright` WCAG 2.0/2.1/2.2 A/AA violations across all 17 routes x Light & Dark):**
  - Verifies DOM ARIA validity, color contrast (`tests/unit/contrast.test.ts` + `contrast-check.py`), single `<h1>`, heading hierarchy, landmarks, table semantics (`<caption>`/`<th scope>`), Skip Link target focus, `Escape` drawer closure, empty-reset focus recovery (Glossary & FactCheckTable), Q1 validation focus jump, `.abyss-bay` button `>= 44x44px` & `>= 7.5-8px` spacing, `1024px` header height (`<= 72px`), `0px` horizontal overflow (`320/768/1280` & `200%` text scaling), and `prefers-reduced-motion: reduce`.
- **Mandatory Manual Matrix Gaps (`QUALITY_GATES.md` §1B - Required Before Public Release Only):**
  1. **Human Screen-Reader Pass (NVDA / Narrator / VoiceOver / TalkBack):** Live reading cadence of `aria-live="polite"` node selection, sequential `Simulasi ke-N` triggers, `FactCheckTable` filter counts, `QuizRunner` error association, and `<caption>`/`<th scope>` navigation.
  2. **Exploratory Full-App Keyboard & Drawer Focus Trap Audit:** Verifying full Tab navigation across long MDX tables, mobile drawer focus containment (`inert` background not yet enforced if Tabbing past `"Tutup Menu"`), and `WCAG 2.4.11` sticky-header clearance at arbitrary intermediate widths (`600px-1279px`).
  3. **Browser `WCAG 1.4.12` Text-Spacing & True 200% Text-Only Zoom:** Playwright root `fontSize = "200%"` does not override line-height/letter/word spacing (`1.4.12`) or test Safari/iOS zoom behavior.
  4. **Physical Touch & Real Soft-Keyboard Testing:** Checking `>= 8px` inter-target gaps across secondary footer/TOC/pill clusters on real mobile devices and virtual keyboards beyond emulated `375x420`.

---

## 8. Local Fix Commits & Release-Only Blockers

- **Commits Landed During M1 Acceptance (`feat/m1-vertical-slice`, local only):**
  - Baseline reviewed: `0cb56fb`
  - `eb32cb1` (`fix(eng,content)`): SVG Sea Earth `(~0 V)` & `PFE (+V/2)` polarity, `BMH` pass-through, `Shore End` vs deep-sea profile separation, `ROPA` bypass + `1480 nm` pump legend, `1.3-01` & glossary technical precision.
  - `83bbd10` (`fix(a11y,storage)`): `readLocalProgress()` `storageWriteFailed` precedence bug, `FactCheckTable` empty-reset focus restoration + `aria-live`, `SiteHeader` `1024px` single-row layout + `#mobile-nav-drawer` max-height scroll, `color-scheme: light/dark`, `QuizRunner` inline `aria-invalid` + reset feedback, `8px` spacing, MDX code-fence heading guard & numbered math regions.
  - `f4d3fde` (`fix(csp,tests)`): `.csp-manifest.json` per-route `htmlSha256` freshness verification, unconditional Windows RSC `copyFileSync` overwrite, fail on `>2000`-byte route CSP header, + unit & Playwright E2E regression tests (`normalizeWindowsRscSegmentFiles`, `<Link>` RSC HTTP `200`, `localStorage` fallback overwrite bug, retry quiz scoring, `1024px` header, `375x420` drawer close focus return).
- **Remaining Release-Only Blockers (Before Public Production Launch, NOT Blocking M2/M4a):**
  1. Complete and sign off `QUALITY_GATES.md` §1B Manual Accessibility Matrix (human NVDA/VoiceOver/TalkBack + physical touch device).
  2. Build deployment adapter converting `.csp-manifest.json` per-route `csp` headers for the chosen static CDN/host (e.g., `_headers` / Edge Worker) so CSP enforcement persists beyond local `serve-export-with-csp.mjs`.
  3. Complete `M4a` primary verification for any cited statistics or `fact-checks.json` items before promoting them into public lessons/labs, and close provenance granularity on the 7 M1 sources.

---

## 9. Next Milestone Execution Boundary: M2 vs Parallel M4a

**Strict Rule:** Execute **M2 Simulators** and **M4a Fact Verification** as strictly decoupled tracks. **Do NOT implement M3, M4b, M5a (`f-i`), M5b (`1.5`/`j`), or Phase F (`/api/v1`) until their explicit gates pass.**

### Track A: Parallel Workstream `M4a` (Primary Fact Verification & Source Hardening)

_Depends on: M0 cleanly passed (already met). Can run concurrently with M2 Track B without touching simulator math._

1. **Harden M1 Source Provenance (`content/sources.json` & `content/lessons/1.3-01-arsitektur-ujung-ke-ujung.mdx`):**
   - Replace `src-kepmen-kp-14-2021` portal root with direct JDIH KKP regulation permalink and cite exact Diktum/Lampiran for `217`, `209`, and 4 hubs.
   - Add official Recommendation editions/approval dates (`10/2020`, etc.) and section/chapter references across ITU-T (`G.971`, `G.972`, `G.973`, `G.977`, `G.977.1`) and Chesnoy (`~25 tahun`, `C-band ~1550 nm`, `1480 nm` pump, `PoP` interfaces).
   - Upgrade `FactCheckTable` (`src/components/about/fact-check-table.tsx`) to display linked `primary_source_id` (linking to `/tentang/sumber/`) and `checked_at` date columns.
2. **Verify 12 Open Claims in `content/fact-checks.json` from Primary Public Releases Only:**
   - **Priority for M2 Lab `(d)` & `(e)`:** First verify `fc-fault-causes` (ICPC public studies), `fc-geo-latency` (ITU/orbital mechanics reference), `fc-palapa-ring` (BAKTI/Komdigi official release), `fc-tat8-rate` (historical public archive/IEEE/Chesnoy), and `fc-modern-cables-rfs` (`SEA-US`, `Echo`, `Bifrost` operator announcements). Update `checked_at` (`YYYY-MM-DD`) and `primary_source_id` in `sources.json` / `fact-checks.json`, keeping any still-unverified figure strictly withheld.
   - **Batch for M4b (`1.1`/`1.2`) & M3 (`1.3-02`):** Verify `fc-traffic-share`, `fc-tg-counts` (pinning TeleGeography edition date), `fc-apjii-denom`, `fc-ri-sg-2026`, `fc-insica-2026`, `fc-mkcs-434`, and `fc-armour-depths` (keep `UNVERIFIED`/qualitative if industry thresholds remain project-specific).
3. **Add Automated Negative Gate Integration Tests (`tests/unit/verify-gates.test.ts`):**
   - Execute `verify-content.ts` and `verify-assets.ts` failure modes against temp fixtures cleanly (tracked binaries, NEC quarantine regex, duplicate module codes, unshipped `related_labs`, `RETRACTED` claim usage).

### Track B: Milestone `M2` (V1 Simulators `a, b, d, e` & Reference Hub)

_Depends on: M1 baseline (complete). Do NOT block Labs `(a)` and `(b)` on `M4a`; DO gate any quantitative numbers inside Labs `(d)` and `(e)` on verified `M4a` statuses._

1. **Shared `.abyss-bay` Numeric Controls & Recharts Primitives (`src/features/simulators/components/`):**
   - Build accessible paired Slider + Direct Numeric Input + `-`/`+` Stepper (`>= 44x44px`, `>= 8px` gap), shared Educational Approximation Disclaimer, and synchronized Recharts v3 + keyboard-scrollable HTML `<table>` shell honoring `MOTION 1` / `prefers-reduced-motion: reduce`.
2. **Lab `(a)`: Optical Capacity Calculator (`/lab/kapasitas-optik/`):**
   - Pure TS kernel (`src/features/simulators/engine/optical-capacity.ts`) + Vitest exact vectors (`N_fp=16, B_THz=4.4, SE=4.0` -> `17.6 / 281.6 / 563.2 Tbps`; `N_fp=4, N_lambda=80` -> `8 / 32 / 64 Tbps`, slot overflow `N_lambda > maxSlots`).
3. **Lab `(b)`: Attenuation & Optical Power Budget (`/lab/anggaran-daya/`):**
   - Pure TS kernel (`src/features/simulators/engine/optical-budget.ts`) + Vitest exact vectors (`A_fiber` + `1e-30` / IEEE-754 underflow clamps; Repeatered `L=6000, L_rep=60, alpha=0.17, P_ch=-2, NF=5` -> `BOL OSNR 20.80 dB`, `EOL OSNR 17.30 dB`; Raman/ROPA `<= 30 dB` bound + `GSNR` caveat).
4. **Lab `(d)`: Route Fault & Redundancy Simulator (`/lab/gangguan-redundansi/`):**
   - Pure TS kernel (`Point-to-Point`, `Festoon`, `Trunk & Branch`, `Ring / Mesh`; `Protection < 50 ms` vs `Restoration`; one-way `4.90 ms/1000 km` & `9.80 ms/1000 km` RTT at `204,000 km/s`). **M4a Gate:** Withhold `fc-fault-causes` (`86%`, `>$1M`, duration) & `fc-geo-latency` numbers unless `M4a` promotes them to `VERIFIED`.
5. **Lab `(e)`: Interactive Historical Timeline (`/lab/linimasa-sejarah/`) & Reference Hub (`/referensi/rumus/`, `/referensi/linimasa/`):**
   - Typed milestones (`words/min`, `voice channels`, `Mbps`, `Tbps`), era chips, Nusantara spotlight (**withholding `fc-tat8-rate`, `fc-palapa-ring`, `fc-modern-cables-rfs` until `M4a` marks them `VERIFIED`**), plus KaTeX formula reference sheet (`/referensi/rumus/`) and glossary expansion (`>= 20` cleared entries).
   - Register shipped M2 slugs in `SHIPPED_LAB_SLUGS` (`src/lib/content/validation.ts`), activate real `/lab/*` and `/referensi/*` links across `SiteFooter`, `/lab/`, and `/referensi/` (`R-24`), and implement the deployment CSP header manifest generator for `_headers` / static host parity.
6. **Exit Verification for M2 (`QUALITY_GATES.md` §1 & §3):**
   - Extend unit suites, `@axe-core/playwright` (`Light` / `Dark` / `.abyss-bay`), RSC soft-nav tests across all new M2 routes, `pnpm verify:content`, `pnpm verify:assets`, `pnpm audit --audit-level=high`, `csp:hashes`, and full `/antislop` Delivery Gate before beginning `M3` or `M4b`.
