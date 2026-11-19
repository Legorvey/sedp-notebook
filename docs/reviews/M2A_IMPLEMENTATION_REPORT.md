# SEDP Learning Hub - Milestone M2-A Implementation & Review Report

- **Branch:** `feat/m2a-optical-labs` (branched from verified M1 baseline `59ff1ac`)
- **Milestone Scope:** **M2-A Only** (Optical Engineering Labs `(a)` and `(b)` + `_headers` / CSP Accuracy Hardening)
- **Strict Exclusions Preserved:** M2-B (`/lab/gangguan-redundansi/`, `/lab/linimasa-sejarah/`, `/referensi/rumus/`, `/referensi/linimasa/`), M4a (`content/fact-checks.json` claim verification), M3, M4b, and Phase F (`/api/v1`) remain untouched.
- **M2-A Status:** Ready for Milestone Acceptance (pending post-commit 10-gate run verified on final `HEAD`).

---

## 1. Scope Delivered & Architectural Summary

### Scope A: Optical Capacity Simulator (`/lab/kapasitas-optik/`)

- **Pure TypeScript Engine:** [optical-capacity.ts](../../src/features/simulators/engine/optical-capacity.ts) (zero React/DOM imports) exporting `calculateOpticalCapacity`, `DEFAULT_OPTICAL_CAPACITY_INPUT`, `OPTICAL_CAPACITY_LIMITS`, and 3 verified educational presets (`c-band-modern`, `dwdm-channel-100g`, `c-plus-l-sdm`).
- **Two Calculation Modes & SI Precision:**
  - `spectral`: $C_{\text{FP}} = B_{\text{THz}} \times \text{SE}$ (Tbps per fiber pair per direction).
  - `channel`: $C_{\text{FP}} = (N_{\lambda} \times R_{\lambda}) / 1000$ under decimal SI convention (`1 Tbps = 1000 Gbps`) and slot-occupancy cap $N_{\lambda} \le \lfloor (B_{\text{THz}} \times 1000 + 10^{-9}) / \Delta f \rfloor$.
- **Unidirectional vs Bidirectional Separation:** Explicitly separates **Kapasitas per Fiber Pair (Searah)**, **Total Kapasitas Searah** ($N_{\text{FP}} \times C_{\text{FP}}$), **Agregat Dua Arah Full Duplex** ($2 \times$ total per direction across $2 N_{\text{FP}}$ physical fibers), spectrum occupancy percentage, effective spectral efficiency, and idealized vs real constraints (`OSNR/GSNR`, Kerr nonlinearity, SDM pump power sharing).
- **Accessible `.abyss-bay` UI:** [optical-capacity-lab.tsx](../../src/features/simulators/components/optical-capacity-lab.tsx) renders Recharts `BarChart` synchronized with a keyboard-scrollable semantic HTML `<table>` (`<caption>`, `<th scope="col">`, `<th scope="row">`, `(Aktif)` row marker) plus single-pointer stepper controls ([numeric-stepper-field.tsx](../../src/features/simulators/components/numeric-stepper-field.tsx)).

### Scope B: Attenuation & Optical Power Budget Simulator (`/lab/anggaran-daya/`)

- **Pure TypeScript Engine:** [optical-budget.ts](../../src/features/simulators/engine/optical-budget.ts) (zero React/DOM imports) exporting `calculateOpticalBudget`, `formatLinearPowerFraction`, `DEFAULT_REPEATERED_BUDGET_INPUT`, `DEFAULT_REPEATERLESS_BUDGET_INPUT`, `OPTICAL_BUDGET_LIMITS`, and 3 presets (`repeatered-6000km`, `repeaterless-120km`, `repeaterless-400km-limit`).
- **Dual Launch-Power Input Modes:** Supports both **Per-Kanal ($P\_{\text{ch}}$ in dBm)** and **Total EDFA ($P\_{\text{total}} - 10\log\_{10} N\_{\lambda}$)**.
- **Repeaterless Exponential Power & Guardrails:**
  - Models passive fiber loss $A_{\text{serat}} = \alpha \cdot L$, BOL/EOL total losses ($+A_{\text{term}} + M_{\text{perbaikan}} + M_{\text{penuaan}}$), receiver-end Raman/ROPA gain ($G_{\text{raman}}$), and IEEE-754 underflow protection (`< 1e-30` label past `300 dB`, numeric clamp to `0` past `3000 dB`).
- **Repeatered EDFA ASE Accumulation (`BOL` vs `EOL`):**
  - Span count $N_{\text{span}} = \max(1, \lceil L / L_{\text{rep}} - 10^{-9} \rceil)$ (guarding IEEE-754 exact-multiple drift such as `120.9 / 40.3 = 3`), span loss $L_{\text{span}} = \alpha \cdot L_{\text{rep}}$, quantum noise floor `-58 dBm / 0.1 nm`, BOL `OSNR_ASE`, EOL `OSNR_ASE`, and high launch power Kerr nonlinearity warning (`P_ch > +2.0 dBm`).
  - Explicitly states that **linear `OSNR_ASE` is NOT complete `GSNR`** ($1/\text{GSNR} = 1/\text{OSNR}_{\text{ASE}} + 1/\text{SNR}_{\text{NLI}}$), must never be used to declare real modem feasibility, and ships [educational-disclaimer.tsx](../../src/features/simulators/components/educational-disclaimer.tsx) (`Penafian Pemodelan Edukatif`).

### Scope C: Route Isolation, `_headers` Accuracy & Strict CSP Hardening

- **Dedicated Static App Router Pages:** Replaced monolithic `src/app/lab/[simSlug]/page.tsx` with [lab-workbench-shell.tsx](../../src/features/simulators/components/lab-workbench-shell.tsx) plus separate static pages for `/lab/eksplorer-sistem/`, `/lab/kapasitas-optik/`, and `/lab/anggaran-daya/`.
  - Measured raw JS chunk size dropped on `/lab/eksplorer-sistem/` from `~1.33 MB` (`[simSlug]` coupled bundle) to **`783,624` bytes** (`11` chunks; zero Recharts/D3/Redux code), and removing `motion/react` from both M2-A labs reduced `/lab/kapasitas-optik/` to **`1,113,890` bytes** (`13` chunks) and `/lab/anggaran-daya/` to **`1,118,677` bytes** (`13` chunks).
- **Updated ADR-008 & Manifest Tracking:** [docs/DECISIONS.md](../DECISIONS.md) and [scripts/generate-csp-hashes.mjs](../../scripts/generate-csp-hashes.mjs) distinguish per-route `_headers` line limits (`maxRouteHeaderLineChars` <= `2,000` characters) and header rule caps (`estimatedRuleCount` <= `100` rules) from multi-route `aggregateHeaderBytes`, keep hosting provider-neutral (`[OWNER_HOSTING]`, `hostingProviderSelected: false`), catalog flattened RSC `.txt` assets (`19` normalized, `80` total), narrow style policy to `style-src-elem 'self'; style-src-attr 'unsafe-inline'` (blocking `<style>` element injection while allowing KaTeX/Recharts inline attributes), and fail closed in [scripts/serve-export-with-csp.mjs](../../scripts/serve-export-with-csp.mjs) against `buildFingerprintSha256` and per-route `htmlSha256`.

---

## 2. Verified Mathematical Vectors & CSP Telemetry

### Mathematical Test Vectors (Observed in Vitest 5.1.0)

| Simulator | Scenario / Input                                                                                      | Expected & Observed Output                                                                 | Verification                  |
| --------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------- |
| Lab (a)   | `DEFAULT_OPTICAL_CAPACITY_INPUT` (`spectral`, `16 FP`, `4.4 THz`, `4.0 bit/s/Hz`)                     | `32` fibers, `17.60` Tbps/FP/dir, `281.60` Tbps/dir, `563.20` Tbps bi-dir                  | `m2a-optical-engines.test.ts` |
| Lab (a)   | `dwdm-channel-100g` (`channel`, `4 FP`, `80 ch`, `100 Gbps`, `4.4 THz`, `50 GHz`)                     | `8` fibers, `maxSlotsPerPair=88`, `8.00 / 32.00 / 64.00 Tbps`, SE `1.818 bit/s/Hz`         | `m2a-optical-engines.test.ts` |
| Lab (a)   | IEEE-754 grid fit (`2.01 THz`, `67 GHz`, `30 ch`) vs overflow (`90 ch @ 50 GHz`)                      | `maxSlotsPerPair=30` (`100%` fit passes); `90 > 88` rejects cleanly                        | `m2a-optical-engines.test.ts` |
| Lab (b)   | `DEFAULT_REPEATERED_BUDGET_INPUT` (`6000 km`, `60 km` rep, `0.17 dB/km`, `-2 dBm`, `NF 5`, `M 2+1.5`) | `100` spans (`10.20 dB/span`), BOL `20.80 dB`, EOL `17.30 dB` (`+3.30 dB` margin)          | `m2a-optical-engines.test.ts` |
| Lab (b)   | IEEE-754 exact multiple (`120.9 km`, `40.3 km` rep)                                                   | `spanCount === 3` (no false `+1` jump)                                                     | `m2a-optical-engines.test.ts` |
| Lab (b)   | `repeaterless-120km` & `repeaterless-400km-limit` (`G_raman=24 dB`)                                   | `120 km`: BOL `-26.00 dBm`, EOL `-29.50 dBm`; `400 km`: `0 km=-2.00 dBm`, Rx `=-58.00 dBm` | `m2a-optical-engines.test.ts` |
| Lab (b)   | Linear fraction boundaries (`20 / 80 / 300 / 300.01 / 4500 dB`, `-1`, `NaN`)                          | `1.000%`, `1.00e-8`, `1.00e-30`, `< 1e-30`, `0` (`< 1e-30`), `"Tidak valid"`               | `m2a-optical-engines.test.ts` |

### `.csp-manifest.json` Build Measurements (Build preceding documentation commit)

- `routeCount`: `22`
- `estimatedRuleCount`: `26` (within `100` flat-rule reference)
- `maxRouteHeaderLineChars`: `835` (within `2,000`-character flat header line cap; `maxRouteHeaderBytes = 808`)
- `aggregateHeaderBytes`: `1,834` across `29` unique script hashes (`aggregateHeaderChars = 1834`)
- `rscAssetCount`: `80` (`normalizedRscCount = 19`)
- `limitsReference.hostingProviderSelected`: `false`

---

## 3. Visual Inspection & Screenshot Review

All 11 full-page PNG screenshots were captured against `scripts/serve-export-with-csp.mjs` at `1280x800` (desktop Light & Dark), `768x1024` (tablet Light), and `390x844` (mobile Light) with zero console errors, zero page errors, and `0px` horizontal overflow:

- Hub & Navigation: [m2a-lab-hub-desktop.png](./screenshots/m2a-lab-hub-desktop.png), [m2a-lab-hub-mobile.png](./screenshots/m2a-lab-hub-mobile.png)
- Lab (a) Optical Capacity: [m2a-capacity-desktop-light.png](./screenshots/m2a-capacity-desktop-light.png), [m2a-capacity-desktop-dark.png](./screenshots/m2a-capacity-desktop-dark.png), [m2a-capacity-tablet-light.png](./screenshots/m2a-capacity-tablet-light.png), [m2a-capacity-mobile-light.png](./screenshots/m2a-capacity-mobile-light.png)
- Lab (b) Optical Budget: [m2a-budget-repeatered-desktop-light.png](./screenshots/m2a-budget-repeatered-desktop-light.png), [m2a-budget-repeatered-desktop-dark.png](./screenshots/m2a-budget-repeatered-desktop-dark.png), [m2a-budget-repeaterless-desktop-light.png](./screenshots/m2a-budget-repeaterless-desktop-light.png), [m2a-budget-repeatered-tablet-light.png](./screenshots/m2a-budget-repeatered-tablet-light.png), [m2a-budget-repeatered-mobile-light.png](./screenshots/m2a-budget-repeatered-mobile-light.png)

### Concrete Visual Defects Caught & Fixed After First Screenshot Inspection

1. `Margin Perbaikan` and `Margin Penuaan` used a nested 2-column grid inside `lg:col-span-5`, crushing inputs on `1280px`/`1024px` desktop; fixed by stacking cleanly (`grid-cols-1`) and verified visible in updated desktop screenshots and E2E `1024px` bounding-box checks.
2. Long explanatory `<table>` `<caption>` text clipped horizontally on `390px` mobile inside `overflow-x-auto`; moved assumptions above the scroll region with concise `sr-only` `<caption>` tags.
3. Recharts `<ReferenceLine>` label (`Ambang`) overlapped curve endpoints near the bottom-right axis and lacked `.toFixed(1)` formatting; repositioned to `insideTopLeft` with `dy: -14` and `.toFixed(1)`.
4. Fixed `"4.00 bit/s/Hz"` line wrapping and duplicate closing parentheses `))` on Lab `(a)` chart subtitle.

---

## 4. Six Independent Read-Only Specialist Reviews & Resolutions

Six independent `research` subagent reviews audited commit `dfb8356`. Key findings and concrete code fixes committed in `21a7828`, `f8d84c5`, and `07ed62c`:

| Specialist Lens                         | Key Findings Raised                                                                                                                                                                                                                                            | Status & Resolution                                                                                                                                                                                                                                                                                          |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Subsea Optical Engineering           | (H) `NaN` DOM leak on cleared margins/target; (H) unphysical `+22 dBm` Raman at `0 km` in `profileSeries`; (M) duplicate `stepLabel` below `8 km`, Kerr wording in Repeaterless/1-ch mode, uniform `M_repair` & `L < L_rep` note                               | **Fixed (`21a7828`, `f8d84c5`):** Guarded finite formatting in UI; moved Raman boost to receiver endpoint (`idx === pointCount`) in `profileSeries`; `distanceKm < 10` uses 1-decimal labels; updated warnings & `limitationsNoteId`                                                                         |
| 2. Numerical Validation & Vectors       | (H) IEEE-754 `Math.ceil(120.9 / 40.3)` off-by-one span jump (`4` vs `3`); (H) `NaN` UI formatting; (M) missing preset/boundary/mode-isolation unit vectors                                                                                                     | **Fixed (`21a7828`, `07ed62c`):** Added `- 1e-9` epsilon guard in `optical-budget.ts`; expanded `m2a-optical-engines.test.ts` with preset, IEEE-754, and boundary tests                                                                                                                                      |
| 3. Immersive Ocean UI & Clarity         | (H) Crushed desktop margin steppers; (H) clipped mobile `<caption>`; (H) hardcoded `"OSNR ASE vs GSNR Nyata"` heading in Repeaterless mode; (M) double `))`, Recharts collision, focus drop on alert reset                                                     | **Fixed (`f8d84c5`):** Stacked margin inputs; conditional Repeaterless right-card heading; `resetButtonRef` focus restoration; removed unused `extraSpanLossDb` draft plumbing; `text-sedp-partial` token usage                                                                                              |
| 4. Accessibility & Responsive QA        | (H) Recharts `accessibilityLayer` exposed unlabeled `role="application"` `tabIndex={0}` stop; (M) `overflow-x-hidden` hid `200%`-zoom button overflow; `"bit/s/Hz"` suffix collision; missing slider `aria-invalid`/`aria-valuetext`; live-region recovery gap | **Fixed (`f8d84c5`):** Passed `accessibilityLayer={false}` + wrapper `aria-hidden="true"`; separated unit suffix cleanly in flex wrapper + hid native spinbuttons; `h-[44px] w-[44px]` icon buttons + `flex-wrap`; added slider `aria-invalid`/`aria-describedby`/`aria-valuetext`; announced valid recovery |
| 5. Static Export, CSP & Performance     | (H) Broad `style-src 'self' 'unsafe-inline'`; (H) `[simSlug]` forced 509 KB Recharts chunk onto `/lab/eksplorer-sistem/` + `motion/react` overhead; (M) fail-open fingerprint checks & protocol-relative `//` redirect                                         | **Fixed (`21a7828`, `f8d84c5`):** Narrowed CSP to `style-src-elem 'self'; style-src-attr 'unsafe-inline'`; split `/lab/` static routes cleanly (`eksplorer-sistem` reduced to `783,624` bytes); fail-closed manifest & SHA-256 checks in `serve-export-with-csp.mjs`                                         |
| 6. Test Coverage, Rights & Architecture | (P) M2-B / M4a / Phase F boundaries strictly clean; (M) missing `OpticalBudgetLab` table parity in tests, cleared-input `NaN` component tests, `1024px` E2E check, alert reset focus check                                                                     | **Fixed (`07ed62c`):** Expanded `m2a-components.test.tsx` & `smoke.spec.ts` covering table parity, `Total EDFA`, cleared-input zero-`NaN`, `1024px` input width, tap targets, and focus return                                                                                                               |

_Deferred low-severity item for M3:_ `src/app/kurikulum/[moduleSlug]/[lessonSlug]/page.tsx` currently renders `"Buka Lab Eksplorer Sistem"` for `related_labs` links (accurate for M1 Lesson `1.3-01` which only references `"eksplorer-sistem"`, and will be parameterized per lab slug before M3 authors `1.3-02..04`). `docs/plans/INFORMATION_ARCHITECTURE.md` / `SIMULATION_SPECS.md` remain aligned with `eksplorer-sistem` only on `1.3-01`.

---

## 5. Release-Only Conditions vs M2-A Engineering Blockers

- **M2-A Engineering Blockers:** **None.**
- **Release-Only Conditions (Public Deployment / Subsequent Milestones):**
  1. Manual assistive-technology keyboard & screen-reader walkthrough (NVDA / VoiceOver) and real-device mobile touch pass before public hosting.
  2. Owner hosting provider selection (`[OWNER_HOSTING]`) and HTTP header deployment adapter consuming `.csp-manifest.json` (`estimatedRuleCount=26`, `maxRouteHeaderLineChars=835`, `aggregateHeaderBytes=1834`).
  3. Owner relocation of archival restricted root PDF (`NEC Advances in Subsea Cable System  Deployment.pdf`) outside repository workspace prior to public/team distribution (`scripts/verify-assets.ts` continues guarding).
  4. Milestone M4a independent public fact-verification of remaining `content/fact-checks.json` claims (intentionally out of M2-A scope).
  5. Core Web Vitals field measurements (RUM): not measured yet (static export; no backend telemetry installed).

---

## 6. Antislop Delivery Gate (`during` Mode)

- **Hard-Rule Audit:** `R-02` zero `U+2014` em dashes verified across M2-A UI, copy, code, and docs; `R-17`/`R-18`/`R-36`/`R-38` zero fabricated stats, testimonials, or unverified factual claims; `R-24` only shipped routes linked (M2-B routes honestly labeled `Belum Tersedia pada M2-A`); `R-25`/`R-32`/`R-34` WCAG 2.2 AA contrast in Pelagic Light & Abyssal Dark, `:focus-visible`, keyboard navigation, focus restoration, and zero Recharts `role="application"` traps; `R-26`/`R-27` working steppers/sliders/presets/modes and explicit invalid/recovery states with zero `NaN`/`Infinity` leaks; `R-39` `prefers-reduced-motion: reduce` respected cleanly.
- **Verification Scope & Local Commits:**
  - Feature/Fix Commits on `feat/m2a-optical-labs`: `1d20732`, `ba3fae4`, `ee3cd3d`, `052e3bc`, `32dd3f5`, `dfb8356`, `21a7828`, `f8d84c5`, `07ed62c` (plus documentation/screenshot commit following this report, after which all 10 verification gates execute on final `HEAD`).
