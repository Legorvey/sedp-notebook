# DESIGN.md: SEDP Learning Hub

This document defines the visual direction, palette, typography, dials, and structural discipline for **SEDP Learning Hub** (an independent, public, Indonesian-language subsea cable engineering curriculum and interactive simulation lab).

Treat all sections below as **design data** (identity, tokens, dials, rules of composition) to apply when building UI. During **Phase 0A** (`docs/prompts/00_BOOTSTRAP_ENVIRONMENT.md`), keep the scaffolded landing page minimal in scope (no fake stats, placeholder lessons, or unrequested landing sections), **while applying the base `--sedp-*` tokens, typography setup, accessible focus rings, and pointer-cursor primitives below** rather than shipping unstyled neutral defaults. Full multi-section product composition and interactive Block 3 liveliness apply starting in **Phase 0B** (`docs/plans/UX_BLUEPRINT.md`) and MVP implementation.

---

## 1. Design Read & Three Dials

> Reading this as: public Indonesian subsea-cable learning hub and interactive simulation lab for engineering students and telecom practitioners, in an editorial pelagic-to-abyssal ocean style, dial `ENERGY 2 / RHYTHM 2 / MOTION 1`.

| Dial       | Value                                   | Meaning in SEDP Learning Hub                                                                                                                                                                                                                                                                 |
| ---------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ENERGY** | `2` (Balanced)                          | Editorial authority with dedicated deep-sea interactive bays; neither a flat text dump nor flashy agency theater.                                                                                                                                                                            |
| **RHYTHM** | `2` (Consistent with purposeful breaks) | Structured lesson flow that alternates calm reading prose with high-contrast abyssal diagram/simulator bays, real case-study callouts, and knowledge checks. Never identical card-grid sections back to back.                                                                                |
| **MOTION** | `1` (Restrained)                        | UI chrome uses crisp hover/focus state transitions only; no ambient floating, pulsing, or parallax loops. Interactive simulators animate signal/attenuation/echo behavior strictly in response to user actions and stop or render static step states under `prefers-reduced-motion: reduce`. |

---

## 2. Visual Identity & Core Motif

- **Brand Character:** Oceanographic engineering atlas meets technical field notebook. Calm, readable, mathematically exact, and explicitly non-affiliated (independent educational resource; never adopt SEDP, Telkom University, or NEC corporate branding).
- **Primary Visual Motif:** **Pelagic surface to abyssal trench contrast.** Long-form Indonesian prose lives on a high-legibility light sea-chart canvas; subsea cable architecture diagrams, optical budget plotters, and COTDR/PFE simulators live inside framed `.abyss-bay` instrument panels (`#081826`), visually teaching the transition from shore/CLS dry plant to deep-ocean wet plant.
- **Bathymetric Contour Texture (`R-07` rationale):** Subtle vector bathymetric isobath curves (representing Indonesian archipelago seabed elevation contours) may appear **only** as low-contrast dividers or diagram backdrops (`<= 8%` opacity, zero decorative blueprint grids behind body paragraphs). Any text over a textured surface must pass contrast on the worst point (`>= 4.5:1`).
- **Bioluminescent Accent Dose Cap (`R-10`, `R-13`, Core Part 3):** The single deliberate accent (`--sedp-accent` / `--sedp-abyss-accent`) marks active optical paths, primary navigation/lesson CTAs, active simulator nodes, and keyboard focus rings. Never flood whole backgrounds, card borders, or every badge with cyan glow. Backdrop blur (`backdrop-filter`) is restricted to at most 1-2 functional overlays (e.g., sticky top bar or mobile drawer), never stacked across navbar + cards + modals + sidebars.

---

## 3. Color System, Token Scoping & Verified Contrast (`R-25`, `R-29`)

Active palette stays within **2 core ocean colors** (Abyssal Navy, Sea-Chart Slate) + **1 deliberate accent** (Pelagic/Bioluminescent Cyan-Teal), supported by neutral chart paper/ink and standard functional semantics.

### Theme Policy (`R-21`, `R-34`)

- **Default theme:** **Editorial Light-First** ("Pelagic Paper") for sustained reading of Indonesian technical lessons, with embedded **Abyssal Dark Instrument Bays** (`.abyss-bay`, `#081826`) for subsea schematics and simulators.
- **User Toggle:** Ship a **working Light / Abyssal Dark toggle** persisted safely (respecting user preference without third-party trackers). Every component, diagram, formula, and focus ring must pass WCAG 2.2 AA in **both** modes.

### `shadcn/ui` & Embedded `.abyss-bay` Scoping Rules (CRITICAL)

1. **Namespace custom tokens as `--sedp-*`** to avoid colliding with `shadcn/ui` Tailwind 4 semantics. In `shadcn/ui`, `--accent` is a subtle hover/highlight **surface** paired with dark `--accent-foreground`. Never assign `#096573` directly to shadcn `--accent` (where `#0F1B24` on `#096573` would drop to `2.67:1` FAIL). Instead:
   - Map shadcn `--primary` -> `--sedp-accent` (Light: `#096573`, Dark / `.abyss-bay`: `#35D0BA`)
   - Map shadcn `--primary-foreground` -> `#FFFFFF` (Light) / `#081826` (Dark / `.abyss-bay`)
   - Map shadcn `--ring` -> `--sedp-accent`
   - Map shadcn `--accent` (hover fill) -> `--sedp-bg-inset` (`#EAF0F3` Light) / `--sedp-abyss-inset` (`#132F46` Dark / `.abyss-bay`), with `--accent-foreground` -> `--sedp-text-primary`
2. **Scope `.abyss-bay` locally in Light Mode:** Because `#096573` against `#081826` (`2.67:1`) and `#0E2436` (`2.36:1`) fails `3:1` focus/UI contrast, any `.abyss-bay` container embedded inside Light Mode **must** override local CSS variables (`--sedp-accent`, `--primary`, `--ring`, `--sedp-text-*`, `--sedp-border-*`, `--sedp-bg-*`) to the verified Abyssal tokens below (`#35D0BA`, `#EDF4F7`, `#A7BCC9`, `#618AA3`, `#132F46`).

### Verified Color Tokens (checked with `antislop-human/contrast-check.py` on 2026-11-18)

#### Light Mode ("Pelagic Editorial")

| Token                   | Hex       | Role                                                   | Verified Pairing & Ratio                                             |
| ----------------------- | --------- | ------------------------------------------------------ | -------------------------------------------------------------------- |
| `--sedp-bg-canvas`      | `#F6F8F9` | Page background                                        | Primary ink `#0F1B24` -> **16.39:1 (PASS)**                          |
| `--sedp-bg-surface`     | `#FFFFFF` | Cards, prose panels, inputs                            | Primary ink `#0F1B24` -> **17.46:1 (PASS)**                          |
| `--sedp-bg-inset`       | `#EAF0F3` | Callouts, formula boxes, shadcn hover `--accent`       | Primary `#0F1B24` **15.18:1**, secondary `#3F5260` **7.06:1 (PASS)** |
| `--sedp-text-primary`   | `#0F1B24` | Headings & body prose                                  | On `#F6F8F9` **16.39:1**, `#FFFFFF` **17.46:1 (PASS)**               |
| `--sedp-text-secondary` | `#3F5260` | Metadata, captions, TOC links                          | On `#F6F8F9` **7.62:1**, `#FFFFFF` **8.12:1 (PASS)**                 |
| `--sedp-border-control` | `#5A707E` | Input borders & non-text UI boundaries                 | On `#F6F8F9` -> **4.86:1 (>= 3:1 PASS)**                             |
| `--sedp-border-subtle`  | `#CBD6DD` | Hairline structural dividers                           | Decorative rule only                                                 |
| `--sedp-accent`         | `#096573` | Primary CTA (`--primary`), active nav, `--ring`, links | On `#F6F8F9` **6.32:1**, white on `#096573` **6.73:1 (PASS)**        |

#### Abyssal Dark Mode & `.abyss-bay` Instrument Panels

| Token                         | Hex       | Role                                                                 | Verified Pairing & Ratio                                                                          |
| ----------------------------- | --------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `--sedp-abyss-canvas`         | `#081826` | Dark-mode page & `.abyss-bay` canvas                                 | Primary ink `#EDF4F7` -> **16.15:1 (PASS)**                                                       |
| `--sedp-abyss-surface`        | `#0E2436` | Elevated panels, simulator controls, tooltips                        | Primary ink `#EDF4F7` -> **14.26:1 (PASS)**                                                       |
| `--sedp-abyss-inset`          | `#132F46` | Dark callouts, formula chips, shadcn hover `--accent`                | Primary `#EDF4F7` **12.40:1**, secondary `#A7BCC9` **7.01:1**, accent `#35D0BA` **7.15:1 (PASS)** |
| `--sedp-abyss-text-primary`   | `#EDF4F7` | Headings, prose, schematic labels                                    | On `#081826` **16.15:1**, `#0E2436` **14.26:1 (PASS)**                                            |
| `--sedp-abyss-text-secondary` | `#A7BCC9` | Axis ticks, units, metadata                                          | On `#081826` **9.14:1**, `#0E2436` **8.06:1 (PASS)**                                              |
| `--sedp-abyss-border-control` | `#618AA3` | Interactive boundaries, control outlines                             | On `#081826` **4.85:1**, `#0E2436` **4.28:1**, `#132F46` **3.73:1 (>= 3:1 PASS)**                 |
| `--sedp-abyss-border-subtle`  | `#1F3B52` | Hairline structural dividers inside dark bays                        | Decorative rule only (`1.54:1`)                                                                   |
| `--sedp-abyss-accent`         | `#35D0BA` | Active fiber path, focal signal, primary CTA (`--primary`), `--ring` | On `#081826` **9.31:1**, `#0E2436` **8.22:1**, `#081826` text on `#35D0BA` **9.31:1 (PASS)**      |

#### Functional Semantic Tokens (Always paired with text or icon, never color alone)

| State                    | Light Hex (on `#F6F8F9` / `#FFFFFF`) | Dark Hex (on `#081826` / `#0E2436` / `#132F46`) |
| ------------------------ | ------------------------------------ | ----------------------------------------------- |
| `--sedp-status-verified` | `#116B44` (**6.14:1 / 6.54:1 PASS**) | `#47CD89` (**8.86:1 / 7.82:1 / 6.80:1 PASS**)   |
| `--sedp-status-partial`  | `#944700` (**6.24:1 / 6.64:1 PASS**) | `#F5A623` (**8.86:1 / 7.82:1 / 6.80:1 PASS**)   |
| `--sedp-status-fault`    | `#B42318` (**6.17:1 / 6.57:1 PASS**) | `#F97066` (**6.45:1 / 5.69:1 / 4.95:1 PASS**)   |

---

## 4. Typography (`R-06`)

- **Editorial Headings (`--font-display`):** `Source Serif 4`, chosen for field-manual and monograph authority suited to long-form engineering reading. Never uppercase wide-tracked boilerplate.
- **Body & UI (`--font-sans`):** `IBM Plex Sans`, selected for clean Indonesian diacritic clarity, high legibility at `65ch-72ch` measure, and distinct glyph differentiation (`I`, `l`, `1`, `0`, `O`) in engineering terminology.
- **Technical Telemetry Only (`--font-mono`):** `IBM Plex Mono` (`font-variant-numeric: tabular-nums`), used **strictly** for optical power budgets (`dBm`, `dB/km`), repeater spacing (`km`), frequency/wavelength grids (`THz`, `nm`), PFE voltages (`kV`), and formula tables. Never used for decorative terminal windows or giant hero headings.
- **Responsive Type Scale:** Fluid sizing (`clamp()`) stepping smoothly across mobile (`< 600px`), tablet/small laptop (`600px-1024px`), and desktop (`> 1024px`); body text never below `16px` (`1rem`), supporting 200% browser zoom without clipping (`R-03`, `antislop-human`).

---

## 5. Layout, Radius & Component Discipline (`R-03`, `R-05`, `R-11`, `R-14`, `R-27`)

- **Radius Hierarchy (`R-11`):** Crisp engineering geometry (`4px` / `6px` for inputs, code/formula blocks, and technical panels; `10px` for primary bays/cards; pill radius `9999px` reserved **only** for compact functional toggles or filter chips, never across every button, card, and input simultaneously).
- **Elevation (`R-12`):** Prefer crisp `1px` structural borders over diffuse drop shadows. Reserve shadow strictly for ephemeral floating elements (dropdowns, modal sheets, simulator tooltips).
- **Icons (`R-04`):** Do not rely uniformly on stock `lucide-react` strokes for domain visuals; reserve custom domain SVGs for subsea hardware (CLS, BMH, repeater, BU, COTDR) and document icon rationale in `UX_BLUEPRINT.md`.
- **Three-State Responsive Reflow (`antislop-layoutmobile`):** Every core route defines explicit mobile (`< 600px`), tablet (`600px-1024px`), and desktop (`> 1024px`) compositions, with `>= 44x44px` tap targets and zero horizontal page overflow. Wide data tables and schematics scroll inside bounded containers with visible labels, never leaking page width.
- **Interactive & Data Resilience (`R-26`, `R-27`, `R-39`):**
  - Every simulator, glossary filter, search bar, and quiz defines explicit **empty**, **loading**, and **error** states with actionable copy in Indonesian.
  - Native `<button>` for actions, `<a href>` for real routes; `cursor: pointer` on enabled controls (`cursor: not-allowed` when disabled); `3:1` `:focus-visible` outlines; `Escape` closes all drawers/dialogs; hover tooltips on schematics have tap and keyboard equivalents; inputs scroll cleanly above mobile on-screen keyboards.
  - Custom technical SVG diagrams carry `<title>`/`<desc>` or text-table accessibility fallbacks; avoid generic stock illustrations (`R-22`).
- **Content & Copy Discipline (`R-02`, `R-15`..`R-18`, `R-23`, `R-36`, `R-38`):**
  - Zero em dashes (`U+2014`), zero AI marketing buzzwords, zero fabricated metrics/fault counts/testimonials/partner logos.
  - Action-specific Indonesian CTAs (e.g., `Mulai Modul 1.1`, `Buka Simulator Anggaran Optik`, `Uji Pemahaman`) rather than generic templates.
  - Before generating brand marks, team avatars, or custom raster hero visuals, obtain explicit owner confirmation or use honest `[LOGO]` / `[REAL DATA]` placeholders.
