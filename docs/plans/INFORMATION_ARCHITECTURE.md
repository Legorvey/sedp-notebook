# Information Architecture (IA): SEDP Learning Hub

- **Status:** Phase 0B Planning Artifact (Not Implemented)
- **Date:** 2026-11-18
- **Design Alignment:** Grounded in [PROJECT_BRIEF_SEDP_Learning_Hub.md](../../PROJECT_BRIEF_SEDP_Learning_Hub.md), [AGENTS.md](../../AGENTS.md), and `/antislop` `R-24` (zero dead links).

---

## 1. Navigation Principles & Phase F Reservations

1. **Every Link Resolves (`R-24`):** Top-level navbar, secondary menus, breadcrumbs, and footer contain **zero** links to unbuilt modules or disabled "Coming Soon" shells. Future V1.1 labs and unavailable modules (`1.4`, un-sourced `1.5`) appear either as transparent status notices on index pages (without dead launch links) or deterministic status routes (`/kurikulum/1-4-bisnis-konektivitas`).
2. **Indonesian Canonical Routes `[PROPOSED]`:** Primary paths use clear Indonesian slugs matching UI prose (`/kurikulum`, `/lab`, `/latihan`, `/referensi`, `/tentang`).
3. **Dual Sequence Without Duplicate URLs `[PROPOSED]`:** Canonical lesson URLs remain `/kurikulum/[moduleSlug]/[lessonSlug]`. Switching between **Urutan Modul (`1.1 -> 1.2 -> 1.3 -> 1.4 -> 1.5`)** and **Urutan Hari (`Hari 1 -> Hari 2 -> Hari 3`, jumping `1.3 -> 1.5`)** updates index grouping and `?urut=modul|hari` Prev/Next lesson links without duplicating MDX content.
4. **Reserved Deferred Phase F Paths `[VERIFIED: docs/future/README.md]`:**
   - Never register Next.js handlers under `/api/v1/**`.
   - Reserve `/studio/**` and `/artikel/**` (neither linked from MVP navigation).

---

## 2. Canonical Route Map

### Global Navigation Structure

- **Primary Header (5 links + Theme Toggle):**
  1. `Beranda` -> `/`
  2. `Kurikulum` -> `/kurikulum`
  3. `Lab Simulasi` -> `/lab`
  4. `Latihan` -> `/latihan`
  5. `Referensi` -> `/referensi`
     _(Plus mobile drawer / desktop utility access to `Tentang & Sumber` `/tentang`.)_
- **Global Footer (Milestone-Gated Real Links Only `R-24` + Non-Affiliation Disclaimer):**
  - _Belajar & Eksplorasi (M1):_ `/kurikulum`, `/lab`, `/latihan`, `/referensi/glosarium` _(links to `/referensi/rumus` and `/referensi/linimasa` are added in M2 strictly when those routes ship)_
  - _Transparansi & Sumber (M1):_ `/tentang`, `/tentang/sumber`, `/tentang/verifikasi-fakta`, `/tentang#penafian`, `/tentang#privasi`

### Full Route Inventory `[PROPOSED]`

_(Note: `Static SSG` below describes the zero-backend data model where every route uses `generateStaticParams` and local `content/` data. Under `TECHNICAL_ARCHITECTURE.md` §4, actual HTTP serving is either **Option B** pure static HTML export [`output: "export"`, hypothesis tested first in M0 PoC] or **Option A** dynamic request-time SSR if per-request `proxy.ts` CSP nonces are adopted.)_

| Route Pattern                          | Page Role                                                                                                                                                                        | Rendering                           | MVP Phase                                            |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------- |
| `/`                                    | Home: value proposition, learning loop, vertical slice spotlight (`1.3-01`), dual-pathway orientation, non-affiliation summary                                                   | Static SSG                          | M1 (Vertical Slice)                                  |
| `/kurikulum`                           | Curriculum Index with `?urut=modul` / `?urut=hari` switcher and coverage badges (`Tersedia`, `Sebagian`, `Belum Tersedia`)                                                       | Static SSG + Client Switcher        | M1 (Vertical Slice)                                  |
| `/kurikulum/[moduleSlug]`              | Module Overview (`1.1`, `1.2`, `1.3` plus honest unavailable/gated status pages for `1.4` & `1.5`)                                                                               | Static SSG (`generateStaticParams`) | M1 (`1.3`, `1.4`/`1.5` status stubs)                 |
| `/kurikulum/[moduleSlug]/[lessonSlug]` | 5-Stage Lesson Reader (`Intuisi -> Diagram -> Pendalaman -> Kasus -> Cek Pemahaman`) + contextual TOC + Glossary popovers                                                        | Static SSG (Async RSC + MDX)        | M1 (`1.3-01`)                                        |
| `/lab`                                 | Interactive Simulation Lab Hub separating live V1 simulators from upcoming simulator roadmap (no dead links `R-24`)                                                              | Static SSG                          | M1 (lists live `eksplorer-sistem`; upcoming labeled) |
| `/lab/[simSlug]`                       | Dedicated `.abyss-bay` workbench (`/lab/eksplorer-sistem` in M1; `kapasitas-optik`, `anggaran-daya`, `gangguan-redundansi`, `linimasa-sejarah` in M2; V1.1 in M5)                | Static Shell + Client Lab           | M1 (`eksplorer-sistem`)                              |
| `/latihan`                             | Original Practice Quiz Bank grouped by available module + optional local progress summary & `Reset Progres Lokal`                                                                | Static SSG + Client Progress        | M1 (Vertical Slice)                                  |
| `/latihan/[quizId]`                    | Interactive Quiz Runner (`quiz-1.3-01-arch`, etc.) with diagnostic Indonesian feedback & lesson section back-links                                                               | Static SSG + Client Runner          | M1 (`quiz-1.3-01-arch`)                              |
| `/referensi`                           | Reference Hub linking strictly to shipped reference views (Glossary only in M1; Formula Sheet & Timeline added in M2)                                                            | Static SSG                          | M1 (`glosarium` link live)                           |
| `/referensi/glosarium`                 | Searchable/filterable bilingual glossary (`gls-*` entries + EN/ID aliases + cross-links)                                                                                         | Static SSG + Client Filter          | M1 (8 seed terms -> M2 full)                         |
| `/referensi/rumus`                     | KaTeX formula sheet with variable units, assumptions, and approximation bounds                                                                                                   | Static SSG                          | M2 (Reference Rollout)                               |
| `/referensi/linimasa`                  | Chronological submarine cable evolution (`1850 -> 2025+`) synchronized with verified sources                                                                                     | Static SSG                          | M2 (Reference Rollout)                               |
| `/tentang`                             | Project mission, learning methodology, non-affiliation statement (`#penafian`), local-only privacy notice (`#privasi`)                                                           | Static SSG                          | M1 (Vertical Slice)                                  |
| `/tentang/sumber`                      | Public Source Registry showing strictly `CLEARED` (`public_reuse_allowed: true`) primary sources plus missing-module summary (never internal deck filenames or restricted files) | Static SSG                          | M1 (Vertical Slice)                                  |
| `/tentang/verifikasi-fakta`            | Fact-Check Log (`VERIFIED`, `DISPUTED`, `UNVERIFIED`, `RETRACTED`) tracking reconciled figures & dated public claims                                                             | Static SSG                          | M1 (Vertical Slice)                                  |

---

## 3. Module & Lesson Taxonomy (Dual Ordering)

### Module Catalog & Status (`[VERIFIED]` against workspace inventory)

| `module_code` | `moduleSlug`              | Indonesian Title                   | `canonical_order` | `delivery_order`                       | `coverage_status`     | Notes                                                                                                                               |
| ------------- | ------------------------- | ---------------------------------- | ----------------- | -------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `1.1`         | `1-1-sejarah-evolusi`     | Sejarah dan Evolusi Kabel Laut     | `1`               | `1` (Hari 1)                           | `COVERED_IN_SOURCE`   | Sourced from `Modul_1.1` (40p); verify Oct 2026 case (`p.33`) before full launch.                                                   |
| `1.2`         | `1-2-nadi-global`         | Jaringan Nadi Global dan Indonesia | `2`               | `2` (Hari 2)                           | `COVERED_IN_SOURCE`   | Sourced from `Modul 1.2` (47p); exclude restricted `p.34`/`p.46` slides.                                                            |
| `1.3`         | `1-3-arsitektur-sistem`   | Arsitektur Sistem Kabel Laut       | `3`               | `3` (Hari 2-3)                         | `COVERED_IN_SOURCE`   | Sourced from `Module 1.3` (72p); hosts Vertical Slice `1.3-01`.                                                                     |
| `1.4`         | `1-4-bisnis-konektivitas` | Bisnis dan Ekonomi Konektivitas    | `4`               | `5` (Belum Diajarkan / Belum Tersedia) | `UNAVAILABLE`         | `MISSING_FROM_OWNER` (`UNAVAILABLE_AT_SOURCE`). Honest status page + links to `1.2-02` & `1.3-04` ownership basics.                 |
| `1.5`         | `1-5-siklus-survei-laut`  | Siklus Proyek dan Survei Kelautan  | `5`               | `4` (Hari 3, sebelum 1.4)              | `PARTIAL` _(Missing)_ | `Catatan SEDP-1.pdf` (`MISSING_IN_AGENT_WORKSPACE / OWNER_CAN_SUPPLY`) & official M1.5 slides absent on disk; gated until supplied. |

### Lesson Inventory & Stable IDs (`[PROPOSED]` aligned to `docs/future/README.md`)

_(Note: Because `M4b` authors Modules `1.1` and `1.2` in parallel with `M2` simulators, each lesson's `related_labs` cross-link renders in the UI strictly when `isLabShipped(simSlug)` is true [verified by `pnpm verify:content`], preventing any dead `/lab/*` links under `R-24`.)_

| `lesson_id`  | Route (`/kurikulum/...`)                                      | `module_code` | `delivery_order` | Title (ID)                                                                           | Linked Lab / Quiz                                   |
| ------------ | ------------------------------------------------------------- | ------------- | ---------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------- |
| `1.1-01`     | `1-1-sejarah-evolusi/era-telegraf-bawah-laut`                 | `1.1`         | `1`              | Era Telegraf Bawah Laut dan Jalur Nusantara 1871                                     | `/lab/linimasa-sejarah` / `quiz-1.1-01-telegraf`    |
| `1.1-02`     | `1-1-sejarah-evolusi/telepon-koaksial-dan-satelit`            | `1.1`         | `2`              | Telepon Koaksial Transatlantik hingga Satelit Palapa                                 | `/lab/linimasa-sejarah` / `quiz-1.1-02-koaksial`    |
| `1.1-03`     | `1-1-sejarah-evolusi/revolusi-serat-optik-sdm`                | `1.1`         | `3`              | Revolusi Serat Optik, EDFA, WDM, Koheren, dan SDM                                    | `/lab/kapasitas-optik` / `quiz-1.1-03-optik`        |
| `1.2-01`     | `1-2-nadi-global/peta-global-dan-satelit`                     | `1.2`         | `4`              | Peta Kabel Global dan Mengapa >95% Trafik Lewat Laut                                 | `/lab/linimasa-sejarah` / `quiz-1.2-01-global`      |
| `1.2-02`     | `1-2-nadi-global/konektivitas-indonesia-palapa-ring`          | `1.2`         | `5`              | Konektivitas Indonesia, Palapa Ring, dan Dampak Ekonomi                              | `/referensi/glosarium` / `quiz-1.2-02-indonesia`    |
| `1.2-03`     | `1-2-nadi-global/gangguan-perbaikan-dan-ketahanan`            | `1.2`         | `6`              | Gangguan Kabel, Proses Perbaikan, dan Ketahanan Rute                                 | `/lab/gangguan-redundansi` / `quiz-1.2-03-gangguan` |
| `1.2-04`     | `1-2-nadi-global/permintaan-ai-koridor-batam-smart`           | `1.2`         | `7`              | Gelombang Permintaan AI, Koridor Batam-SG, dan Kabel SMART                           | `/tentang/sumber` / `quiz-1.2-04-smart`             |
| **`1.3-01`** | `1-3-arsitektur-sistem/arsitektur-ujung-ke-ujung`             | `1.3`         | `8`              | **Arsitektur Ujung-ke-Ujung Sistem Kabel Laut _(Vertical Slice)_**                   | `/lab/eksplorer-sistem` / `quiz-1.3-01-arch`        |
| `1.3-02`     | `1-3-arsitektur-sistem/wet-plant-kabel-repeater-bu`           | `1.3`         | `9`              | Wet Plant: Anatomi Kabel, Pelindung, Repeater EDFA, dan BU                           | `/lab/anggaran-daya` / `quiz-1.3-02-wet`            |
| `1.3-03`     | `1-3-arsitektur-sistem/dry-plant-slte-pfe-cotdr`              | `1.3`         | `10`             | Dry Plant: CLS, SLTE, Koheren, PFE, dan Lokalisasi COTDR                             | `/lab/anggaran-daya` / `quiz-1.3-03-dry`            |
| `1.3-04`     | `1-3-arsitektur-sistem/integrasi-kapasitas-margin-open-cable` | `1.3`         | `11`             | Integrasi Sistem: Kapasitas, Margin 25 Tahun, Proteksi, Open Cable                   | `/lab/kapasitas-optik` / `quiz-1.3-04-integrasi`    |
| `1.5-01`     | _(Gated pending Day 3 notes)_                                 | `1.5`         | `12`             | Siklus Hidup Proyek, RPL, dan Perizinan _(Menunggu Audit Sumber Hari 3 & Modul 1.5)_ | _(Deferred until sourced)_                          |
| `1.5-02`     | _(Gated pending Day 3 notes)_                                 | `1.5`         | `13`             | Survei Batimetri & Geofisika Kelautan _(Menunggu Audit Sumber Hari 3 & Modul 1.5)_   | _(Deferred until sourced)_                          |

---

## 4. Concrete Route Manifest Schema Example `[PROPOSED]`

```ts
// src/lib/curriculum/routes.ts (planning schema example only)
export type SequenceMode = "modul" | "hari";

export type CoverageStatus = "COVERED_IN_SOURCE" | "PARTIAL" | "UNAVAILABLE";

export interface ModuleManifest {
  moduleCode: "1.1" | "1.2" | "1.3" | "1.4" | "1.5";
  moduleSlug: string;
  titleId: string;
  canonicalOrder: number;
  deliveryOrder: number; // Note: 1.5 = 4, 1.4 = 5
  teachingWindowLabel: string; // e.g., "Hari 2-3"
  coverageStatus: CoverageStatus;
  unavailableReason?: string;
}

export interface NavigationSequenceLink {
  lessonId: string;
  href: string;
  titleId: string;
  sequenceMode: SequenceMode;
}
```
