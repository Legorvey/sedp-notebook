# Quality Gates & Verification Strategy: SEDP Learning Hub

- **Status:** Phase 0B Planning Artifact (Not Implemented)
- **Date:** 2026-11-18
- **Active `/antislop` Mode:** `during` (session choice confirmed; all UI/copy work must also attach full Delivery Gate PASS/FAIL evidence per `AGENTS.md` §5 and `R-35`).

---

## 1. Automated Test Pyramid (Vitest 5 vs Playwright)

| Layer                     | Runner & Location                                                                                                           | Required Coverage & Boundaries                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unit & Sync Client**    | **Vitest 5** (`tests/unit/**/*.test.{ts,tsx}`, `vitest.config.mts` with `resolve: { tsconfigPaths: true }`)                 | **1. Pure Simulator Kernels (`node` env):** Exact numerical test vectors (`toBeCloseTo` / explicit epsilon), physical monotonicity invariants, `0`/negative/`NaN`/`Infinity` guards, PFE repeater-step dead-zone diagnostics, OSNR bandwidth scaling, COTDR EFL slack.<br>**2. Content & Provenance Validators:** Zod schemas for `content/lessons/*.mdx`, `sources.json`, `fact-checks.json`, `glossary.json`, `quizzes/*.json`; uniqueness of `lesson_id`/`quiz_id`; dual ordering consistency.<br>**3. Sync Client Components (`jsdom` + RTL + `@testing-library/jest-dom` + `tests/unit/setup.ts`):** Theme toggle persistence, `localStorage` error/reset handling, quiz scoring/feedback, glossary filter/empty states, simulator form errors and synchronized HTML `<table>` parity. **Never test async Server Components in Vitest.**                                                                                                        |
| **E2E, Async RSC & A11y** | **Playwright** (`tests/e2e/**/*.spec.ts`, executed strictly against freshly built **`pnpm build` -> `next start -p 3100`**) | **1. Async RSC & MDX Routes:** Render `/`, `/kurikulum`, `/kurikulum/1-3-arsitektur-sistem/arsitektur-ujung-ke-ujung`, `/kurikulum/1-4-bisnis-konektivitas`, `/lab/*`, `/latihan/*`, `/referensi/*`, `/tentang/*` with 0 console/page errors and 0 third-party network beacons.<br>**2. Automated WCAG (`@axe-core/playwright`):** Run `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa` tags across all core routes in **both Pelagic Light and Abyssal Dark modes**.<br>**3. Keyboard, 3-State Responsive & Zoom:** `Tab`/`Shift+Tab`, `Enter`/`Space`, `Escape` focus return, skip-link `#main-content`, focus-not-obscured (`2.4.11`), `>= 44x44px` tap bounding boxes, `0px` horizontal overflow at `320px`, `375px`, `768px`, and `1280px`, `200%` text zoom without clipping, virtual-keyboard input scroll visibility (`375x420`), `emulateMedia({ reducedMotion: "reduce" })`, and internal link crawler (`status < 400`, zero dead `#` anchors). |

---

## 2. Mandatory CI Release Blockers (`.github/workflows/ci.yml`) `[PROPOSED]`

No PR or milestone merges or ships publicly unless **every** automated check below exits `0`:

1. **`pnpm lint` (`eslint .`):** 0 errors, 0 warnings; block un-audited `dangerouslySetInnerHTML`.
2. **`pnpm format:check` (`prettier --check .`):** Clean formatting parity.
3. **`pnpm typecheck` (`next typegen && tsc --noEmit`):** Strict TypeScript 5 passes on fresh checkout.
4. **`pnpm verify:content` (Custom Build/CI Gate Script):**
   - Validates all MDX frontmatter, `sources.json`, `fact-checks.json`, `glossary.json`, and `quizzes/*.json` via Zod.
   - Fails if any publicly rendered item or `content/sources.json` entry has `rights_status !== "CLEARED"` or `public_reuse_allowed !== true`, or lacks non-empty `ownership`/`license`/`attribution`.
   - Fails if internal deck filenames (`Modul_1.1`, `Modul 1.2`, `Module 1.3`, `NEC Advances`) appear in public routes (`content/` or `/tentang/sumber`).
   - Fails if Module `1.4` or unsourced `1.5` exposes fabricated/complete lessons.
   - Fails if `src/` or `content/` contains em dashes (`U+2014`), Next.js `/api/v1` route handlers, or restricted markers (`"Internal Use Only"`, `"Slides marked confidential"`, `"OSM BDO"`).
5. **`pnpm verify:assets`:** Fails if `.pdf`, `.pptx`, `.ppt`, `.docx`, `.xlsx`, `.env` (other than `.env.example`), or `sources-private/` files appear in `public/` or Git index, or if any file in `public/assets/` lacks a `CLEARED` entry in `content/sources.json`.
6. **`pnpm audit --audit-level=high`:** Fails on unresolved high/critical runtime dependency advisories.
7. **`pnpm test`:** 100% pass across all unit, math, schema, and client component tests.
8. **`pnpm build` + `pnpm test:e2e`:** Clean Turbopack build + full Playwright Desktop (`1280x800`), Mobile Touch (`375x812`), Axe WCAG 2.2 AA Light/Dark, and 200%-zoom verification.

---

## 3. Mandatory `/antislop` Delivery Gate & 5 Skill Checklists (`R-35`)

Every Phase 1+ milestone and final release **must** submit a complete PASS/FAIL Delivery Gate report with recorded element-by-element verification evidence:

### Core Delivery Gate Blocks 1-4 (`antislop`)

- **Block 1 (Hard Gate):** `R-02` (0 em dashes), `R-03` (0 mobile overflow, `>= 44px` tap targets), `R-17` (0 unsourced stats), `R-18` (0 fake testimonials), `R-23` (owner-confirmed/placeholder assets), `R-24` (0 dead nav links), `R-25` (`contrast-check.py` >= `4.5:1` / `3:1` everywhere incl. bathymetry backdrops), `R-26` (all controls functional), `R-27` (explicit empty/loading/error states naming cause + next action), `R-28` (no generic FAQ), `R-32` (keyboard Tab/Enter/Space/Escape + solid `>= 3:1` focus indicator), `R-33` (no external CSS patch scripts), `R-34` (Pelagic Light & Abyssal Dark + `.abyss-bay` all verified), `R-35` (live build + click-through list attached with 0 console errors), `R-36` (0 fabricated claims/metrics), `R-37` (`DESIGN.md` applied), `R-38` (real/honest placeholders), `R-39` (`cursor: pointer` / `cursor: not-allowed`, native `<button>`/`<a>`, `<label>`, `alt`, `lang="id"`, landmarks, `prefers-reduced-motion`), `R-40` (sized media, hero `fetchpriority="high"` & non-lazy if present, 0 render-blocking head scripts, **never report unmeasured Lighthouse/CWV numbers**).
- **Block 2 (Purpose-Gate) & Block 3 (Liveliness):** Explicit `Design Read`, `ENERGY 2 / RHYTHM 2 / MOTION 1`, 5 Liveliness Levers, and `R-31` rationale satisfied for `R-01`, `R-04`, `R-06`, `R-07`, `R-08`, `R-09`, `R-10`, `R-12`, `R-13`, `R-14`, `R-19`, `R-22`.
- **Block 4 (Craftsmanship Locks):** `C-1..C-5` plus `R-05`, `R-11`, `R-15`, `R-16`, `R-20`, `R-21`, `R-29`, `R-30`, `R-31`.

### Supplement: 5 Domain Skill Checklists

1. **`antislop-ui`:** 2-core + 1-accent discipline (`R-29`), focal accent only, zero decorative emojis, `RHYTHM 2` non-uniform composition (`R-05`), no bento/fake-terminal/decorative-left-stripe templates, no H1 eyebrow pills (`R-09`), custom subsea SVGs over Lucide-only strokes (`R-04`), dose caps on blur/glow/shadow/radius, state-only dots, designed mobile nav shell, honest empty/loading/error copy, `R-40` checks.
2. **`antislop-copywriting`:** Attributed facts only, zero buzzwords, zero em dashes (`R-02`), minimal quotes, no paragraph ALL-CAPS emphasis, active voice with named actors, specific Indonesian CTAs (`R-15`), zero AI rhythm tells (rule of three, negative parallelism, staccato drama, theatrical takeaways, aphorisms, false ranges), zero temporal runway clichés, sentence-case bullets, authentic Indonesian field-manual voice.
3. **`antislop-human`:** Mathematical contrast verification (`contrast-check.py`), non-text `3:1` boundary contrast, solid focus rings across all themes, keyboard parity + `Escape`, non-color-only state badges/errors, `200%` zoom without clipping, mobile keyboard scroll-into-view, pointer/disabled cursors, visible form `<label>`, `prefers-reduced-motion` + JS animation stop.
4. **`antislop-layoutmobile`:** Three distinct width layouts (`<600px`, `600px-1024px`, `>1024px`) tested continuously, mobile type/padding scale (`clamp()`), stacked grids, zero overflow/clipping, `>= 44x44px` spaced tap targets, tap + keyboard equivalents for schematic tooltips, discoverable labeled `"Menu"` drawer trigger, zero bottom-bar overlap on inputs/buttons.
5. **`antislop-code`:** Comment hygiene pass only (concise 1-2 line why-comments for physics bounds/constraints/workarounds; zero ASCII banners, signature echoes, step narration, vague TODOs, decorative emojis, or end markers).

---

## 4. Phase 1 Prerequisites Remediated in Quality Gate Checklists `[VERIFIED]`

Before marking the Vertical Slice complete, QA explicitly verifies remediation of the 3 Phase 0A UI primitive defects, runtime Node ADR (`ADR-001`), and `shadcn` dependency classification discovered during Phase 0B review:

- `src/components/ui/button.tsx` updated for `min-h-[44px] min-w-[44px]` across enabled interactive `Button` variants (including `default`, `lg`, and `icon`; disabling sub-44px `xs`/`sm`/`icon-sm` touch variants), `disabled:cursor-not-allowed` (removing `disabled:pointer-events-none`), and solid `>= 3:1` `:focus-visible` outline.
- `src/app/globals.css` `@custom-variant dark` updated to include `.abyss-bay` (`(&:is(.dark *, .abyss-bay, .abyss-bay *));`).
- `ThemeToggle` updated with persistent `localStorage` + non-conflicting accessible label / `aria-pressed` semantics.
- `shadcn` moved from runtime `dependencies` into `devDependencies` (CLI-only dependency), and runtime Node `v22.16.0` vs CI Node `26` compatibility kept documented in `docs/DECISIONS.md` (`ADR-001`) until local workstation upgrades to `>= 22.22.2` / `24.15+` / `26`.
