# UX Blueprint: Immersive Ocean Design System

- **Status:** Phase 0B Planning Artifact (Not Implemented)
- **Date:** 2026-11-18
- **Anchored Sources:** [DESIGN.md](../../DESIGN.md), [AGENTS.md](../../AGENTS.md), and installed `/antislop` skills (`antislop`, `antislop-ui`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`).

---

## 1. Design Read, Dials & 5 Liveliness Levers

> **Design Read:** Reading this as: public Indonesian subsea-cable learning hub and interactive simulation lab for engineering students and telecom practitioners, in an editorial pelagic-to-abyssal ocean style, dial `ENERGY 2 / RHYTHM 2 / MOTION 1`. `[VERIFIED: DESIGN.md]`

### Three Dials `[VERIFIED: DESIGN.md]`

- **ENERGY `2` (Balanced):** Editorial monograph clarity on Pelagic Light (`#F6F8F9`), punctuated by high-contrast `.abyss-bay` (`#081826`) interactive hardware/simulation bays.
- **RHYTHM `2` (Consistent with purposeful breaks):** Alternates calm `65ch-72ch` prose blocks with framed `.abyss-bay` diagram stages, inset KaTeX formula blocks (`#EAF0F3` / `#132F46`), real case-study callouts, and inline checks. Never repeats uniform multi-card grids back to back (`R-05`, `R-14`).
- **MOTION `1` (Restrained):** UI chrome uses crisp hover/focus transitions (`150ms`) only; zero ambient pulsing, floating, or parallax loops (`R-19`). Physical causal animations (signal trace, attenuation sweep, fault break highlight) trigger only on user action and snap to static discrete states when `prefers-reduced-motion: reduce` is active (`R-39`).

### Five Liveliness Levers `[DERIVED: antislop Part 3]`

1. **One focal point per screen:** Home spotlights the end-to-end architecture entry (`1.3-01`); Lesson Reader centers `65ch-72ch` prose or the anchored `.abyss-bay` schematic; Labs center the instrument stage; Quizzes center one active question card/block at a time.
2. **Hierarchical contrast:** `Source Serif 4` headings, `IBM Plex Sans` Indonesian body/UI, `IBM Plex Mono` (`tabular-nums`) strictly for telemetry readouts, paired with Pelagic paper vs Abyssal dark bays.
3. **Whitespace as structure:** Asymmetric measure jumps (`65ch-72ch` prose vs wider `.abyss-bay` stages) separate lesson stages cleanly without card overload.
4. **One deliberate accent:** `--sedp-accent` (`#096573` Pelagic Light / `#35D0BA` Abyssal Dark & `.abyss-bay`) marks primary CTAs, active fiber paths, current nav states, and `:focus-visible` outlines. Semantic states (`verified`, `partial`, `fault`) always pair hue with text and icon labels.
5. **Identity motif:** Pelagic-to-abyssal depth cross-section, subtly reinforced by low-opacity (`<= 8%`) vector bathymetric contours along section dividers and `.abyss-bay` seabed backdrops.

---

## 2. `R-31` Purpose-Gate Rationale Table `[DERIVED / PROPOSED]`

| Rule            | Visual / UX Choice                                                                                                                                                                                                              | One-Line Purpose Reason (`R-31`)                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `R-01` / `R-29` | 2 core ocean neutrals/surfaces + 1 cyan-teal accent (`--sedp-accent`); solid surfaces over rainbow/purple gradients.                                                                                                            | Separates editorial text from deep-sea instrument bays without generic AI blue-purple gradients.      |
| `R-04`          | Custom domain SVGs for subsea hardware (`CLS`, `BMH`, `SLTE`, `PFE`, `Repeater`, `BU`, `COTDR`); `lucide-react` restricted strictly to tiny UI chrome (`menu`, `search`, `sun/moon`, `chevron`) with labels.                    | Prevents uniform thin-stroke stock-icon look while rendering accurate subsea hardware topology.       |
| `R-06`          | `Source Serif 4` headings, `IBM Plex Sans` prose/UI, `IBM Plex Mono` (`tabular-nums`) strictly for telemetry/units (`dBm`, `km`, `THz`, `kV`).                                                                                  | Balances Indonesian editorial legibility with tabular engineering precision without terminal cosplay. |
| `R-07`          | Vector bathymetric contour curves ONLY inside hero dividers or `.abyss-bay` backdrops (`<= 8%` opacity); zero blueprint grids behind body prose.                                                                                | Establishes archipelago seabed identity without lowering text contrast below `4.5:1` (`R-25`).        |
| `R-08`          | Omit decorative arrows (`->` / `↗`) on standard CTAs; reserve directional chevrons strictly for sequential lesson Prev/Next navigation.                                                                                         | Keeps directional cues informative for sequence navigation rather than button decoration.             |
| `R-09`          | Zero eyebrow pills above `<h1>`; zero pulsing status dots; plain static labels (`Tersedia`, `Sebagian`, `Belum Tersedia`, `Terverifikasi`) used only for factual status.                                                        | Eliminates AI badge noise while reporting real module and fact-check coverage honestly.               |
| `R-10`          | `backdrop-filter` limited to max 1-2 functional overlays (sticky header or mobile drawer); cards, modals, and `.abyss-bay` panels stay opaque.                                                                                  | Preserves foreground hierarchy and low-end mobile scroll performance.                                 |
| `R-11`          | Radius hierarchy: `4px`/`6px` inputs/formulas, `10px` `.abyss-bay`/cards, `9999px` strictly on compact mode toggles/filter chips.                                                                                               | Differentiates inputs, instrument bays, and toggle pills structurally.                                |
| `R-12`          | Crisp `1px` structural borders (`--sedp-border-subtle` / `--sedp-border-control`); drop shadow strictly on ephemeral tooltips/sheets/popovers; zero decorative colored left stripes on callout boxes unless marking real state. | Reinforces technical atlas clarity instead of floating cards.                                         |
| `R-13`          | Bioluminescent cyan (`#35D0BA`) glow capped at 1-2 active focal elements inside `.abyss-bay` (active path or selected node); matte elsewhere.                                                                                   | Guides learner attention along the active optical signal path without neon clutter.                   |
| `R-14`          | Non-uniform section layouts matched to hierarchy (featured vertical-slice card, compact dual-track module list, standalone `.abyss-bay` preview, reference rows).                                                               | Matches layout weight to actual curriculum importance rather than identical card grids.               |
| `R-19`          | Zero endless loops; causal simulator sweeps animate only on explicit trigger and resolve to discrete static states under `prefers-reduced-motion: reduce`.                                                                      | Supports physical comprehension while honoring `MOTION 1` and vestibular accessibility.               |
| `R-21` / `R-34` | Pelagic Light default + working Abyssal Dark toggle persisted via `localStorage` and verified across all components, SVGs, KaTeX, and focus rings.                                                                              | Serves daylight long-form study and low-light lab exploration equally without theme breakage.         |
| `R-22`          | Zero generic stock illustrations (Undraw/Storyset); custom explanatory SVGs with `<title>`/`<desc>` + text tables.                                                                                                              | Ensures every visual teaches subsea mechanisms rather than filling space.                             |

---

## 3. Verified Color Tokens, `.abyss-bay` Scoping & Phase 0A Remediation

### Verified Contrast Matrix `[VERIFIED: contrast-check.py, 2026-11-18]`

| Mode / Context                            | Foreground                                | Background                        | Ratio                           | Threshold & Result  |
| ----------------------------------------- | ----------------------------------------- | --------------------------------- | ------------------------------- | ------------------- |
| Pelagic Light Body                        | `#0F1B24` (`--sedp-text-primary`)         | `#F6F8F9` (`--sedp-bg-canvas`)    | `16.39:1`                       | `>= 4.5:1` **PASS** |
| Pelagic Light Card                        | `#0F1B24` (`--sedp-text-primary`)         | `#FFFFFF` (`--sedp-bg-surface`)   | `17.46:1`                       | `>= 4.5:1` **PASS** |
| Pelagic Light Secondary                   | `#3F5260` (`--sedp-text-secondary`)       | `#F6F8F9` / `#FFFFFF`             | `7.62:1` / `8.12:1`             | `>= 4.5:1` **PASS** |
| Pelagic Light Inset                       | `#3F5260` (`--sedp-text-secondary`)       | `#EAF0F3` (`--sedp-bg-inset`)     | `7.06:1`                        | `>= 4.5:1` **PASS** |
| Pelagic Light Accent Link / CTA           | `#096573` / `#FFFFFF` on `#096573`        | `#F6F8F9` / `#096573`             | `6.32:1` / `6.73:1`             | `>= 4.5:1` **PASS** |
| Pelagic Light Control Border              | `#5A707E` (`--sedp-border-control`)       | `#F6F8F9`                         | `4.86:1`                        | `>= 3.0:1` **PASS** |
| Abyssal Dark / `.abyss-bay` Primary       | `#EDF4F7` (`--sedp-abyss-text-primary`)   | `#081826` / `#0E2436`             | `16.15:1` / `14.26:1`           | `>= 4.5:1` **PASS** |
| Abyssal Secondary                         | `#A7BCC9` (`--sedp-abyss-text-secondary`) | `#081826` / `#0E2436`             | `9.14:1` / `8.06:1`             | `>= 4.5:1` **PASS** |
| Abyssal Inset (`#132F46`)                 | `#EDF4F7` / `#A7BCC9` / `#35D0BA`         | `#132F46` (`--sedp-abyss-inset`)  | `12.40:1` / `7.01:1` / `7.15:1` | `>= 4.5:1` **PASS** |
| Abyssal Accent (`#35D0BA`)                | `#35D0BA` / `#081826` on `#35D0BA`        | `#081826` / `#0E2436`             | `9.31:1` / `8.22:1` / `9.31:1`  | `>= 4.5:1` **PASS** |
| Abyssal Control Border                    | `#618AA3` (`--sedp-abyss-border-control`) | `#081826` / `#0E2436` / `#132F46` | `4.85:1` / `4.28:1` / `3.73:1`  | `>= 3.0:1` **PASS** |
| Semantic Verified (`#116B44` / `#47CD89`) | Light / Dark                              | Light `#F6F8F9` / Dark `#081826`  | `6.14:1` / `8.86:1`             | `>= 4.5:1` **PASS** |
| Semantic Partial (`#944700` / `#F5A623`)  | Light / Dark                              | Light `#F6F8F9` / Dark `#081826`  | `6.24:1` / `8.86:1`             | `>= 4.5:1` **PASS** |
| Semantic Fault (`#B42318` / `#F97066`)    | Light / Dark                              | Light `#F6F8F9` / Dark `#081826`  | `6.17:1` / `6.45:1`             | `>= 4.5:1` **PASS** |

### Required Phase 0A Primitive Fixes Before MVP UI `[VERIFIED Defect -> PROPOSED Fix]`

1. **`.abyss-bay` Variant Coverage (`src/app/globals.css:5`):** Change `@custom-variant dark (&:is(.dark *));` to `@custom-variant dark (&:is(.dark *, .abyss-bay, .abyss-bay *));` so Tailwind `dark:*` utilities match inside Light-mode `.abyss-bay` instrument panels.
2. **Button Touch Target, Disabled Cursor & Focus Ring (`src/components/ui/button.tsx`):** Remove `disabled:pointer-events-none` (replace with `disabled:cursor-not-allowed` + native `disabled` click blocking), drop `outline-none` + `focus-visible:ring-ring/50` in favor of solid `outline: 2px solid var(--ring)` (`>= 3:1` contrast, `outline-offset: 2px`), and enforce `min-h-[44px] min-w-[44px]` across enabled interactive `Button` variants (including `default`, `lg`, and `icon`; remove or disallow sub-44px `xs`/`sm`/`icon-xs`/`icon-sm` touch variants) (`R-03`, `R-32`, `R-39`).
3. **Theme Persistence & Toggle Semantics (`src/components/theme-toggle.tsx` + `src/app/layout.tsx`):** Persist `sedp.theme` (`"light" | "dark"`) in `localStorage` (`try/catch`), apply pre-paint cleanly via CSP Option A (per-request nonce) or Option B (`/theme-init.js` + post-build hydration script hashes per `TECHNICAL_ARCHITECTURE.md` §4) with `<html suppressHydrationWarning>`, and use clear non-conflicting button label + `aria-pressed` semantics.

---

## 4. Three-State Responsive Wireframes Covering Every Primary View `[PROPOSED]`

### A. Global Shell & Home (`/`)

```text
Desktop (> 1024px)
+-------------------------------------------------------------------+
| [Wordmark: SEDP Learning Hub | Catatan Independen]  Nav(5)  [Tema]|
+-------------------------------------------------------------------+
| H1: Pahami Sistem Kabel Laut dari Sejarah hingga Arsitektur        |
| Subcopy + CTA [Buka Pelajaran 1.3-01] [Jelajahi Kurikulum]         |
+---------------------------------+---------------------------------+
| Jalur Belajar (Modul vs Hari)   | Pratinjau .abyss-bay End-to-End |
| 1.1..1.5 dengan status jujur    | SVG PoP -> CLS -> BMH -> Wet    |
+---------------------------------+---------------------------------+
| Lab Simulasi V1 (highlight)     | Pusat Referensi & Sumber        |
+-------------------------------------------------------------------+
| Footer: Tautan Nyata (2 kolom) + Penafian Non-Afiliasi Tegas      |
+-------------------------------------------------------------------+

Tablet (600px-1024px)                   Mobile (< 600px)
+---------------------------------+     +---------------------------+
| Brand  Nav / Drawer     [Tema]  |     | Brand   [Menu] [Tema]     |
+---------------------------------+     +---------------------------+
| Hero + CTA                      |     | Hero + Full-width CTAs    |
+---------------------------------+     | (min-h 44px, gap >= 8px)  |
| 2-col Orientation + Bay Preview |     +---------------------------+
+---------------------------------+     | Stacked 1-col Modules     |
| 2-col Labs & Reference          |     | .abyss-bay Stepper + SVG  |
+---------------------------------+     +---------------------------+
| Compact 2-col Footer            |     | Footer + Penafian         |
+---------------------------------+     +---------------------------+
```

### B. Lesson Reader (`/kurikulum/[moduleSlug]/[lessonSlug]`)

```text
Desktop (> 1024px)
+--------------+----------------------------------+-----------------+
| Sidebar      | Prose Column (65ch-72ch)         | Contextual TOC  |
| [Modul|Hari] | 1. Intuisi Utama                 | - Bagian 1..5   |
| - 1.1..1.5   | 2. .abyss-bay Diagram Terjangkar | - Glosarium     |
| (Collapsible)|    + Tabular Fallback + Notes    |   Terkait       |
|              | 3. Pendalaman (<details>/panel)  |                 |
|              | 4. Kasus Nyata + Kutipan Sumber  |                 |
|              | 5. Uji Pemahaman (Quiz Link/Box) |                 |
|              | [Sebelumnya]        [Berikutnya] |                 |
+--------------+----------------------------------+-----------------+

Tablet (600px-1024px): Sidebar opens via drawer button (aria-expanded), TOC sits
as compact inline jump strip above section 1; prose stays 65ch-72ch centered.
Mobile (< 600px): Top collapsible panel for Module/Day switcher + TOC; single
column prose; wide KaTeX/tables scroll inside bounded overflow-x-auto wrappers.
```

### C. Interactive Lab (`/lab` & `/lab/[simSlug]`)

- **Desktop (`> 1024px`):** Asymmetric 2-column `.abyss-bay` workbench (~62% SVG/Recharts visual stage + ~38% parameter controls, validation alerts, and `IBM Plex Mono` tabular telemetry) + expandable _"Batas Model & Asumsi"_ and _"Ringkasan Tabel Data"_ directly beneath.
- **Tablet (`600px-1024px`):** Full-width `.abyss-bay` stage above 2-column controls + telemetry grid.
- **Mobile (`< 600px`):** Stacked `.abyss-bay` stage -> discrete node stepper buttons (`>= 44x44px`) -> parameter inputs with numeric `-`/`+` steppers and `scroll-margin-bottom` so focused inputs remain clear above the mobile keyboard.

### D. Practice (`/latihan`, `/latihan/[quizId]`), Reference (`/referensi/*`), & Governance (`/tentang/*`)

- **Practice:** Question-by-question or compact list view (`<fieldset>`/`<legend>`/`<label>` radio groups, `>= 44px` option hit area), instant Indonesian diagnostic feedback + deep-link to governing lesson section, plus transparent local progress card with `"Reset Progres Lokal"`.
- **Reference (`/referensi`, `/referensi/glosarium`, `/referensi/rumus`, `/referensi/linimasa`):** Instant client search + category filter chips (`44px`), alphabetical jump bar, bounded horizontal math containers on mobile, and direct lesson citations.
- **Governance (`/tentang`, `/tentang/sumber`, `/tentang/verifikasi-fakta`):** Clear 2-column on desktop / stacked 1-column on mobile tables summarizing source provenance (`rights_status`, `source_type`, `trust_level`), missing sources, fact-check log (`VERIFIED` vs `DISPUTED`/`UNVERIFIED`), non-affiliation statement, and privacy reset control.

---

## 5. Accessibility, Interactions & Explicit UI States (`R-27`, `R-32`, `R-39`)

### Interaction & Zero-Barrier Rules

- **Tap & Keyboard Equivalents for Hover Tooltips (`R-03`, `R-32`):** Hovering an `.abyss-bay` component highlights it visually only; clicking, tapping, or pressing `Enter`/`Space` on the `<button>` node pins the readout into an accessible Inspector Panel (`aria-live="polite"`). Escape dismisses any open popover/drawer and returns focus to the trigger.
- **No Drag-Only Controls (`WCAG 2.5.7`):** Sliders pair with `-`/`+` buttons and direct numeric inputs; graphs require zero drag-panning to inspect values.
- **200% Zoom & `320px` Reflow:** All headings and prose use fluid `clamp()` sizing with body `>= 16px` and zero `overflow: hidden` text containers; KaTeX blocks and data tables scroll within bounded containers with visible captions.

### Mandatory Empty, Loading & Error States (`R-27`)

| Surface                                          | Empty / Unavailable State                                                                                                                                                                                                   | Loading State                                                                                                                     | Error / Validation State                                                                                                                                                          |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Module / Lesson (`1.4`, `1.5`, bad slug)**     | _"Materi Modul 1.4 belum tersedia karena dokumen sumber belum masuk ke repositori. Kami tidak menerbitkan materi tanpa rujukan terverifikasi. Lanjutkan ke Modul 1.3 atau periksa daftar modul."_ + `<a href="/kurikulum">` | Static-rendered via RSC; client fallback shows structural skeleton matching reading width                                         | _"Konten pelajaran gagal dimuat dari berkas lokal. Muat ulang halaman atau kembali ke Daftar Kurikulum."_                                                                         |
| **Simulators (`/lab/[simSlug]`)**                | Initialized cleanly with verified textbook defaults (e.g. `16 FP x 4.4 THz x 4 b/s/Hz`) + one-click _"Atur Ulang Parameter"_                                                                                                | Fixed-aspect `.abyss-bay` container (mencegah pergeseran tata letak saat inisialisasi, `R-40`) + _"Menyiapkan model simulasi..."_ | Inline field alert (`role="alert"`, icon + text, `aria-invalid="true"`): names exact valid unit range + action button                                                             |
| **Glossary & Fact Log (`/referensi/glosarium`)** | _"Tidak ada istilah cocok untuk '<query>'. Coba ejaan Inggris/Indonesia (mis. 'repeater' atau 'stasiun pendaratan') atau hapus filter."_ + _"Hapus Filter"_                                                                 | _"Memuat indeks glosarium..."_                                                                                                    | _"Indeks glosarium gagal dibaca. Muat ulang halaman untuk mencoba lagi."_                                                                                                         |
| **Quiz & LocalStorage (`/latihan/[quizId]`)**    | _"Belum ada riwayat latihan tersimpan di peramban ini. Pilih paket latihan untuk mulai."_                                                                                                                                   | Instant static load; guarded hydration state                                                                                      | Unanswered check focuses first missing question + _"Pilih satu jawaban pada soal nomor X."_ If `localStorage` fails: non-blocking notice that results remain for current tab only |

---

## 6. Indonesian Copywriting Rules (`antislop-copywriting`)

- **Zero `U+2014` em dashes** or double-hyphen (`--`) asides in UI copy or MDX prose (`R-02`).
- **Zero AI marketing clichés** (`revolusioner`, `mutakhir`, `mulus`, `tanpa batas`, `generasi berikutnya`, `cerdas`, `ekosistem terpadu`) (`R-16`).
- **Action-specific CTAs (`R-15`):** `Mulai Modul 1.1`, `Buka Pelajaran 1.3-01`, `Jalankan Simulasi Anggaran Optik`, `Uji Pemahaman 1.3`, `Periksa Log Sumber`.
- **Natural Indonesian + Accurate English Terms:** Keep established subsea terms (`Cable Landing Station`, `Beach Manhole`, `Power Feeding Equipment`, `Repeater`, `Branching Unit`, `COTDR`) intact with plain Indonesian explanations on first appearance; use sentence case in bullet lists and active voice with named actors.
- **Unresolved UX Owner Decisions:**
  1. Confirm wordmark-plus-custom-SVG hero approach vs distinct emblem (`R-23`).
  2. Confirm Pelagic Light first-visit default vs OS `prefers-color-scheme` auto-detect (`R-21`).
  3. Confirm automatic local `localStorage` progress saving (with reset notice) vs explicit opt-in click.
  4. Confirm sharing simulator state via URL query params (`?span=65&loss=0.17`).
