# Product Requirements Document (PRD): SEDP Learning Hub

- **Status:** Phase 0B Planning Artifact (Not Implemented)
- **Date:** 2026-11-18
- **Phase Boundary:** Anonymous, static/MDX-first MVP. Deferred Phase F (`docs/future/`) is **out of scope** and unapproved.
- **Epistemic Convention:** Claims below are labeled `[VERIFIED]` (observed in repo/source inventory), `[DERIVED]` (synthesized from brief, design tokens, and specialist audits), `[PROPOSED]` (recommended MVP architecture/design choice), `[UNRESOLVED]` (requires owner confirmation), or `[OUT OF SCOPE]`.

---

## 1. Product Identity & Purpose

- **Working Product Name:** **SEDP Learning Hub** (`[UNRESOLVED]` pending final owner trademark/brand decision; see Section 6).
- **Subtitle & Framing:** _Catatan Belajar Independen Sistem Kabel Laut_ (Independent Public Educational Resource). `[DERIVED]`
- **Core Purpose:** Transform fragmented, linear multi-day subsea connectivity training notes and technical concepts into an accessible, Indonesian-first educational website pairing readable prose, custom anchored engineering diagrams, causal simulations with explicit modeling bounds, and original active-recall checks. `[VERIFIED: PROJECT_BRIEF_SEDP_Learning_Hub.md]`
- **Strict Non-Affiliation Mandate:** Never present, brand, or imply this product as an official platform of SEDP, CONNEXUS, Telkom University, Infranexia, ASKALSI, NEC, ASN, SubCom, or TeleGeography. Non-affiliation wording must appear consistently in header subtitle/context, metadata description, global footer, and `/tentang#penafian`. `[VERIFIED: AGENTS.md, Legal Review]`

---

## 2. Target Audiences & Jobs-to-be-Done (JTBD)

### Audiences `[DERIVED]`

1. **Primary (Pelajar & Mahasiswa Teknik/IT Indonesia Pemula):** Learners with little or no prior subsea optical or marine engineering background who need intuitive mental models in natural Indonesian paired with accurate English industry terminology (`CLS`, `BMH`, `SLTE`, `PFE`, `EDFA`, `COTDR`, `RPL`).
2. **Secondary (Praktisi Telekomunikasi, Jaringan & Infrastruktur):** Engineers and technical staff seeking a structured system-anatomy reference, transparent optical capacity/budget/fault calculators, and verified Indonesian connectivity context (e.g., Palapa Ring, Batam-Singapore corridor, fault resilience).
3. **Access Model:** 100% anonymous public visitors. Zero account walls, login prompts, or user-tracking scripts. `[VERIFIED]`

### Jobs-to-be-Done `[DERIVED]`

- **JTBD-1 (Pemahaman Bertahap):** Learn complex submarine cable topics in a progressive 5-step sequence (`Intuisi -> Diagram Terjangkar -> Pendalaman Teknis -> Kasus Nyata Bersumber -> Uji Pemahaman`) without redundant repetition or skipped fundamentals.
- **JTBD-2 (Navigasi Ganda):** Follow either the canonical curriculum structure (`1.1 -> 1.2 -> 1.3 -> 1.4 -> 1.5`) or the actual workshop sequence (`Hari 1 -> Hari 2 -> Hari 3`, which jumped `1.3 -> 1.5` before `1.4`), with honest status indicators where materials are partial or unavailable.
- **JTBD-3 (Eksperimen Kausal):** Vary physical parameters (fiber pairs, bandwidth, attenuation, repeater spacing, span/fault position) inside interactive `.abyss-bay` laboratories and understand both the engineering trade-offs and the simplified model limits.
- **JTBD-4 (Latihan & Rujukan Cepat):** Practice original Indonesian calculation/scenario checks with immediate lesson-linked feedback, and quickly search bilingual acronyms (`Glosarium`), equations (`Lembar Rumus`), and historical milestones (`Linimasa`).
- **JTBD-5 (Verifikasi Sumber):** Inspect every public statistic's provenance, copyright clearance status, and known contradictions across training decks before trusting or citing a figure.

---

## 3. MVP Goals, Non-Goals & Scope

### MVP Goals `[PROPOSED]`

1. **Immersive Ocean Reading & Lab UX:** Implement the `DESIGN.md` visual system (`ENERGY 2 / RHYTHM 2 / MOTION 1`), Pelagic Editorial light-first reading canvas + `.abyss-bay` dark instrument bays, persistent Pelagic/Abyssal theme toggle, and 3-state responsive layouts (`< 600px`, `600px-1024px`, `> 1024px`) passing WCAG 2.2 AA and `/antislop` Delivery Gates.
2. **First Complete Vertical Slice Before Scaling:** Prove end-to-end architecture with Lesson `1.3-01` (_Arsitektur Sistem Kabel Laut Ujung-ke-Ujung_), featuring an interactive accessible SVG `CLS / BMH / SLTE / PFE / Repeater / BU` explorer (Repeatered vs Repeaterless toggle) and an original 5-question quiz (`quiz-1.3-01-arch`).
3. **Audited Curriculum Rollout (Post-Slice):** Deliver Modules `1.1` (History & Evolution), `1.2` (Global Lifeline & Indonesia, excluding restricted slides), and `1.3` (Complete System Anatomy, Parts 1-4) as original Indonesian MDX lessons backed by `CLEARED` citations. Keep `1.4` honestly marked `Belum Tersedia` and keep `1.5` marked `Sebagian (Menunggu Sumber)` until `Catatan SEDP-1.pdf` / official M1.5 sources are supplied and audited.
4. **Priority V1 Interactive Labs:** Deliver the 5 prioritized V1 calculators/explorers: (a) Optical Capacity, (b) Attenuation & Optical Power Budget (repeaterless & repeatered ASE modes), (c) End-to-End System Explorer, (d) Route Fault & Redundancy, and (e) Interactive Historical Timeline, with V1.1 labs (`f`-`j`) staggered after V1 quality gates pass.
5. **Reference & Governance Surfaces:** Deliver bilingual Glossary (`/referensi/glosarium`), KaTeX Formula Sheet (`/referensi/rumus`), Historical Timeline (`/referensi/linimasa`), Source Library (`/tentang/sumber`), and Fact-Check Log (`/tentang/verifikasi-fakta`).
6. **Optional Local Progress Only:** Store anonymous theme and lesson/quiz progress strictly in browser `localStorage` with transparent Indonesian privacy copy and a working one-click reset control.

### Explicit Non-Goals `[OUT OF SCOPE]`

- User accounts, login/registration, roles/RBAC, `/studio/**` editorial admin UI, TipTap CMS, PostgreSQL, Redis, Python/FastAPI backend, or `/api/v1/**` endpoints (all deferred to unapproved Phase F in `docs/future/`).
- Payment processing, subscriptions, third-party analytics/telemetry, cookie banners for tracking, or hosted AI tutor/chatbots.
- Live cable telemetry, real-time TeleGeography API scraping, or commercial marine route engineering certification tools.
- Publishing or redistributing raw training PDFs, `NEC Group Internal Use Only` slides, SubCom `[Restricted]` slides (`Modul 1.2` p.34/46), TeleGeography/vendor screenshots, trainer/crew photos, or closed-course pre/post-test question banks.

---

## 4. Measurable Success Criteria (Release Gates) `[PROPOSED]`

MVP readiness is evaluated by falsifiable engineering, UX, rights, and educational checks rather than invented traffic targets:

1. **Vertical Slice Completeness:** Lesson `1.3-01` renders end-to-end via Git MDX, includes the interactive keyboard- and touch-accessible `CLS/BMH/SLTE/PFE/Repeater/BU` explorer, links to glossary definitions, and grades all 5 original questions in `quiz-1.3-01-arch` with lesson-section deep links.
2. **Content Provenance & Rights Gate (100%):** Automated build check confirms zero `UNKNOWN`, `PENDING`, or `REJECTED` assets/sources are exposed publicly; zero `.pdf`/`.pptx` files exist in `public/`; zero restricted strings (`"Internal Use Only"`, `"OSM BDO"`, `"Slides marked confidential"`) exist in `src/` or `content/`.
3. **Engineering Accuracy Gate (100%):** Every V1 simulator formula passes all unit test vectors within defined tolerances, catches zero/negative/unphysical edge cases without `NaN`/`Infinity`, and visibly renders its Indonesian _Penafian Pemodelan Edukatif_ panel.
4. **Accessibility & `/antislop` Delivery Gate:** Zero `@axe-core/playwright` WCAG 2.2 AA violations across all routes in both Pelagic Light and Abyssal Dark modes; `0px` horizontal overflow at `320px`, `375px`, `768px`, and `1280px`; clean `200%` text zoom; `>= 44x44px` interactive targets; `0` em dashes (`U+2014`); and complete `R-35` click-through evidence log with zero console/page errors.
5. **Phase F Compatibility Verified:** Stable `lesson_id` and `quiz_id` values present in MDX frontmatter; provenance schemas share canonical enum values with [docs/future/README.md](../future/README.md); zero `/api/v1` Next.js handlers exist; all MVP routes render cleanly without external network dependencies.

---

## 5. Major Alternatives & Trade-offs `[PROPOSED]`

| Decision Area          | Chosen MVP Direction                                                                                                                      | Alternative Considered                                   | Rationale                                                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Content Storage**    | Git-committed typed MDX (`content/`) + JSON registries                                                                                    | Headless CMS or Phase F PostgreSQL/FastAPI               | Zero ops/auth overhead, deterministic Git provenance review, preserves `lesson_id`/`quiz_id` compatibility with Phase F. |
| **Curriculum Rollout** | Vertical slice (`1.3-01`) first, then `1.1`/`1.2`/`1.3`, gating `1.4`/`1.5` on real sources                                               | Drafting speculative `1.4`/`1.5` prose now               | Upholds honesty (`R-36`, `R-38`) and proves MDX/SVG/Quiz/CI integration before bulk writing.                             |
| **Visualizations**     | Accessible custom React SVG diagrams + `recharts` (`v3`) plots                                                                            | Heavy `@xyflow/react` everywhere or WebGL canvas         | Lower JS payload, native keyboard/SVG semantics, synchronized HTML table parity, zero mobile pan-trap.                   |
| **Language & Routes**  | Indonesian UI/prose + Indonesian primary URLs (`/kurikulum`, `/lab`, `/latihan`, `/referensi`, `/tentang`) with English engineering terms | English routes (`/learn`, `/lab`) or bilingual i18n site | Matches target Indonesian student audience and brief without doubling translation maintenance.                           |

---

## 6. Unresolved Decisions Requiring Owner Approval `[UNRESOLVED]`

1. **Product Branding:** Keep `"SEDP Learning Hub"` with prominent `"Catatan Belajar Independen"` subtitle, or adopt a fully neutral Indonesian name (e.g., _Atlas Kabel Laut_) to minimize trademark ambiguity?
2. **Quarantine/Removal of `NEC Advances...pdf`:** Confirm moving `Modul_1.1`, `Modul 1.2`, `Module 1.3` into `sources-private/` and permanently removing `NEC Advances in Subsea Cable System  Deployment.pdf` from the project directory.
3. **Module `1.5` & `Catatan SEDP-1.pdf` Supply:** Confirm whether `Catatan SEDP-1.pdf` (Day 3 notes), Day 1-2 master notes, and M1.1/M1.2 pre/post-tests (private difficulty reference only) will be provided into `sources-private/`, or if `1.5` should remain deferred alongside `1.4` during initial MVP launch.
4. **Module `1.1` / `1.2` Time-Sensitive Claims:** Confirm verification workflow for Oct 2026 RI-SG cable counts (`M1.1 p.33`) and end-2026 INSICA status (`M1.2 p.40`) before Module `1.1`/`1.2` publication.
