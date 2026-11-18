# Content Audit, Provenance & Source Plan: SEDP Learning Hub

- **Status:** Phase 0B Planning Artifact (Not Implemented)
- **Date:** 2026-11-18
- **Phase F Compatibility:** Enums (`rights_status`, `source_type`, `trust_level`, `fact_check_status`) and ID conventions align with [docs/future/README.md](../future/README.md) without pulling any DB/API dependencies into MVP.

---

## 1. Audited Source Inventory & Legal/Rights Register (`[VERIFIED]` on Disk 2026-11-18)

### Workspace Location Note `[VERIFIED]`

All four PDFs below currently reside in the repository root (`C:\Codes\SEDP Notebook Live\*.pdf`, excluded from Git via `*.pdf` in [.gitignore](../../.gitignore)) while `sources-private/` is empty. Before Phase 1 content authoring begins, relocate Modules `1.1`, `1.2`, and `1.3` into `sources-private/` and **remove/quarantine `NEC Advances in Subsea Cable System  Deployment.pdf` outside the repository workspace**.

### 1A. Internal Editorial Source Audit Register (`docs/plans/` & Local Editorial Matrix Only: Never Published)

Tracks private/internal source provenance and quarantine constraints. **Never committed to `public/` or rendered on `/tentang/sumber`.**

| `source_id` (`sources.code`) | File / Artifact on Disk                                                                                                                  | `source_type`     | `trust_level`                                      | `rights_status`                                                      | `public_reuse_allowed`     | Audit & Containment Policy                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------- | -------------------------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src-owner-brief-01`         | `PROJECT_BRIEF_SEDP_Learning_Hub.md` (109 lines, owner-prepared)                                                                         | `OWNER_NOTES`     | `HIGH`                                             | `CLEARED`                                                            | `false` _(internal brief)_ | Authoritative product principles & scope input.                                                                                                                                                                                                                                                                                                                                                                                   |
| `src-sedp-m1-1-rev2`         | `Modul_1.1_A_Journey_Through_Time_Rev2 (2).pdf` (40p, CONNEXUS 2026 SEDP)                                                                | `OFFICIAL_MODULE` | `MEDIUM`                                           | `PENDING`                                                            | `false`                    | Topic outline & `p.39` bibliography usable as internal editorial leads. **Do not** redistribute slide prose, `p.8` NEC cable diagram, `p.17/27/35` inline quizzes, or third-party maps/paintings (`p.4/5/12/13/14/32/34`). Note `p.33` explicit warning: _"Verify figures before teaching."_                                                                                                                                      |
| `src-sedp-m1-2-revisi`       | `Modul 1.2 The Global Lifeline - Importance of Subsea Cables (revisi).pdf` (47p, SEDP Telkom Univ)                                       | `OFFICIAL_MODULE` | `MEDIUM`                                           | `REJECTED` (`p.34`, restricted pointer on `p.46`) / `PENDING` (rest) | `false`                    | **`p.34` (`Rumpon`) & restricted SubCom SubOptic 2022 pointer (`p.46`) are marked `[Restricted]` confidential: strictly unusable even as background notes.** Do not reuse `p.7` TeleGeography map capture or slide prose. Other topics require fresh Indonesian prose & independent inspection of public primary refs listed on `p.46` (`References` slide), `p.40` INSICA verification flag, and `p.7` map count reconciliation. |
| `src-sedp-m1-3-arch`         | `Module 1.3 Submarine Cable System Architecture_compressed.pdf` (72p, Infranexia / ASKALSI trainers, Telkom Univ Bandung 17-18 Nov 2026) | `OFFICIAL_MODULE` | `HIGH` (physics/arch) / `MEDIUM` (2017/2026 stats) | `PENDING`                                                            | `false`                    | Core architectural/physics backbone (Parts 1-4). **Zero** reuse of trainer photos/PII (`p.2`), **Telkom OSM BDO** screenshots/photos (`p.14/26`), field crew photos (`p.71`), **NEC/ASN** vendor photos/drawings (`p.24/33/37/51/55`), or **TeleGeography** map captures (`p.18`). Concepts & generic formulas inform original Indonesian MDX and original custom SVGs.                                                           |
| `src-nec-advances-2025`      | `NEC Advances in Subsea Cable System  Deployment.pdf` (27p, Oct 2025, `© NEC Corporation / 2024 NEC Group Internal Use Only`)            | `VENDOR_SLIDES`   | `LOW` _(unassessed; quarantined)_                  | **`REJECTED`**                                                       | `false`                    | **Hard Quarantine:** Marked `Internal Use Only` on content pages. Never opened, extracted, paraphrased, diagram-traced, or sent to third-party AI tools. Remove from workspace before implementation.                                                                                                                                                                                                                             |

### 1B. Public Source Registry (`content/sources.json`, Rendered on `/tentang/sumber`)

Strict allowlist: every entry in `content/sources.json` **must** satisfy `rights_status: "CLEARED"`, `public_reuse_allowed: true`, and include explicit `ownership`, `license`, and `attribution` metadata so no internal deck filename or restricted asset is ever serialized to public routes.

```json
{
  "source_id": "src-itu-g977-1",
  "title": "ITU-T Recommendation G.977.1: Transverse compatibility for dense wavelength division multiplexing submarine optical fiber cable systems",
  "source_type": "STANDARD",
  "trust_level": "HIGH",
  "rights_status": "CLEARED",
  "public_reuse_allowed": true,
  "ownership": "International Telecommunication Union (ITU-T)",
  "license": "Public standard reference citation only (no verbatim standard text redistribution)",
  "attribution": "ITU-T Recommendation G.977.1 (inspected official release)",
  "external_url": "https://www.itu.int/rec/T-REC-G.977.1",
  "checked_at": "TBD-M1-before-publication"
}
```

---

## 2. Missing-Source Checklist (`MISSING` on Disk 2026-11-18)

| Item                                                                      | Referenced In                                                                 | Impact on Phase 0B / MVP                                                    | Required Owner Action                                                        |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `Catatan SEDP-1.pdf` (10p, Day 3 notes)                                   | `01_MULTI_AGENT_IMPLEMENTATION_PLAN.md`, `PROJECT_BRIEF_SEDP_Learning_Hub.md` | **Blocks Module `1.5` lessons & Lab `(j)` quantitative mode.**              | Supply privately into `sources-private/` before authoring `1.5`.             |
| Owner Day 1-2 master notes, Google Docs textbook, Day 1/2 screenshots     | `01_MULTI_AGENT_IMPLEMENTATION_PLAN.md`, `PROJECT_BRIEF_SEDP_Learning_Hub.md` | Missing owner-authored context/examples for Day 1-2 synthesis.              | Supply privately into `sources-private/` if available.                       |
| Module `1.1` & `1.2` Pre-test & Post-test question sets                   | `01_MULTI_AGENT_IMPLEMENTATION_PLAN.md`, `PROJECT_BRIEF_SEDP_Learning_Hub.md` | Missing private difficulty-calibration reference (must NEVER be published). | Optional private supply to `sources-private/` for internal calibration only. |
| Official Module `1.4` material (_Business of Connectivity_)               | `01_MULTI_AGENT_IMPLEMENTATION_PLAN.md`, `Modul 1.2 p.21`                     | **Module `1.4` stays `UNAVAILABLE` in MVP.** Do not invent content.         | Supply when available; MVP displays honest unavailable status.               |
| Official Module `1.5` slide deck (_Permitting & Marine Survey_)           | `01_MULTI_AGENT_IMPLEMENTATION_PLAN.md`, `Modul 1.2 p.31`                     | **Module `1.5` stays `PARTIAL` / gated.**                                   | Supply into `sources-private/` when available.                               |
| Speaker notes / answer keys for M1.1 (`p.17/27/35`) & M1.2 (`p.17/27/37`) | Inspected PDFs                                                                | Inline deck quizzes lack explicit answer keys in exported slides.           | Optional; MVP writes clean-room original quizzes anyway.                     |

---

## 3. Verified Public Reference Candidates (For Original MVP Prose Verification) `[DERIVED from M1.1-M1.3 Bibliographies]`

MVP lessons and calculators must ground public facts in verifiable external standards/publications (`rights_status: CLEARED` for factual citation and paraphrased educational explanation with `trust_level: HIGH | MEDIUM`):
These public primary sources were identified via internal module bibliographies (`M1.1 p.39`, `M1.2 p.46` _References_ slide, `M1.3 p.42/65-67`) and **must be independently opened, verified, and assigned `CLEARED` status with explicit licensing/attribution in `content/sources.json` prior to publishing lessons**. Any `[Restricted]` SubOptic pointer noted on `M1.2 p.46` is excluded and never consulted:

1. **ITU-T Recommendations (`G.971` / `G.972` / `G.977` / `G.977.1`):** Optical fiber submarine cable terms, repeatered architecture, open-cable coupling point definitions.
2. **Public ICPC Recommendations & Government Best Practices (`ICPC Gov Best Practices 2021` and public ICPC fault-share releases):** Global fault cause shares and repair context (excluding any restricted third-party SubOptic proceedings).
3. **Chesnoy, J. (ed.) _Undersea Fiber Communication Systems_ (2nd/3rd ed., Academic Press/Elsevier) & _Open Submarine Cables Handbook_:** Optical budgets, EDFA/WDM/coherent evolution, open-cable GSNR acceptance concepts.
4. **Public Institutional & Legal References:** `Kepmen KP No. 14/2021` (Indonesian subsea corridor rules), `Koesmarihati / BAKTI 2024` Palapa Ring public webinar, `ITU/WMO/UNESCO-IOC` Joint Task Force on SMART Cables, `TeleGeography` public submarine cable map & blog releases (fact-checked text citations only, zero map image scraping), `APJII` public survey releases, `Atlantic-Cable.com` public archive.

---

## 4. Contradictions & Fact-Check Log (`content/fact-checks.json` Public Schema + Internal Audit Trace) `[AUDITED: VERIFY PRIMARY REFS BEFORE PUBLISH]`

Every item below is tracked transparently on `/tentang/verifikasi-fakta`. **Honesty & containment rules:** (1) Public `content/fact-checks.json` exposes `fact_check_id`, `lesson_id`, cleared public `source_id` refs, `public_claim_id`, `fact_check_status`, and `public_resolution_id` without printing internal operator deck identifiers (`OSM BDO`, `M1.1 p.8`, etc.), which stay strictly in the non-published internal audit column below; (2) **All items start `UNVERIFIED` (or `DISPUTED`) until their exact external primary references are opened, checked (`checked_at`), and promoted to `VERIFIED` during M1/M4 before respective lesson publication.**

| `fact_check_id`    | `lesson_id` | Public `source_id` (Target Primary Ref)     | Internal Deck Trigger _(Audit Only: Never Published)_                                                                   | Conflict / Uncertainty Observed                                                                                                            | `fact_check_status` | Planned Resolution Once Primary Ref Checked (`/tentang/verifikasi-fakta`)                                                                                                              |
| ------------------ | ----------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fc-traffic-share` | `1.2-01`    | `src-icpc-best-practices`                   | `M1.1 p.3` (`>95%`), `M1.2 p.3/14` (`>99%`), `M1.3 p.4` (`95-99%`)                                                      | Different denominators (total international internet vs intercontinental data); primary ICPC/APEC release not yet inspected directly.      | `UNVERIFIED`        | Open primary public release in M4; once verified, state `95-99%` and distinguish _lalu lintas internet internasional_ vs _data antarbenua_.                                            |
| `fc-tg-counts`     | `1.2-01`    | `src-telegeography-map`                     | `M1.1 p.4` (`597`), `M1.2 p.7` (`694` vs `607 + 102 = 709`)                                                             | Inconsistent edition dates and in-service vs planned grouping inside same summary.                                                         | `DISPUTED`          | Inspect live public TeleGeography summary in M4, cite exact edition date, and separate _sistem aktif_ vs _terencana_.                                                                  |
| `fc-palapa-ring`   | `1.2-02`    | `src-bakti-palapa-2024`                     | `M1.1 p.26/32` (`~12,200 km`), `M1.2 p.21` (`~12,000 km`: `7,900 + 4,100` vs package sum `11,950`)                      | Rounding differences between infrastructure summary and package breakdown; public BAKTI source not yet opened directly.                    | `UNVERIFIED`        | Verify against official public BAKTI/Komdigi summary in M4 and note total rounding vs rincian paket darat/laut.                                                                        |
| `fc-fault-causes`  | `1.2-03`    | `src-icpc-best-practices`                   | `M1.2 p.32` (ICPC `86%` fishing/anchoring) vs `M1.3 p.25` (2017 domestic operator summary `±78%` human, `~12%` natural) | Different study years, sample scopes, and category definitions; primary ICPC document not yet opened directly in Phase 0B.                 | `UNVERIFIED`        | Verify public ICPC `2010-2024` stats directly in M4; keep domestic historical figures framed neutrally with year & scope tags.                                                         |
| `fc-armour-depths` | `1.3-01`    | `src-chesnoy-ufcs`, `src-kepmen-kp-14-2021` | `M1.1 p.8` (`to 8,000 m`) vs `M1.3 p.23` (`500/1500 m` vs `200/500/2000 m`)                                             | Armour thresholds depend on seabed hazard & engineering design, not universal physics; `ITU-T G.972` covers terminology, not depth meters. | `UNVERIFIED`        | Teach armour grades qualitatively in `1.3-01` using **illustrative educational presets** in Lab `(c)` (verify Chesnoy/`Kepmen KP 14/2021` in M1 before citing numeric depth brackets). |
| `fc-apjii-denom`   | `1.2-02`    | `src-apjii-survey`                          | `M1.2 p.19` (`3.71%` Maluku-Papua user share) vs `M1.3 p.7` (`69.7%` regional penetration)                              | Share of national users vs intra-regional population penetration rate; `69.7%` not yet verified directly in primary APJII release.         | `UNVERIFIED`        | Keep withheld or verify directly against public APJII release before publishing `1.2-02`; label denominators clearly.                                                                  |
| `fc-geo-latency`   | `1.2-01`    | `src-itu-g971`                              | `M1.1 p.25` & `M1.2 p.14` (`~240 ms` / `~0.25 s` one-way GEO)                                                           | Risk of confusing one-way ground-satellite-ground hop (`~239 ms` min) with RTT (`~480-560 ms`); check ITU/orbital reference first.         | `UNVERIFIED`        | Verify orbital distance & refractive delay calculation in M4; label `~240 ms` explicitly as _satu arah_ and `~480-560 ms` as _RTT_.                                                    |
| `fc-ri-sg-2026`    | `1.1-03`    | `src-telegeography-map`                     | `M1.1 p.33` (Oct 2026 RI-SG claim: `24` cables, `~90%` / `~80%`)                                                        | Slide itself states: _"Verify figures before teaching."_                                                                                   | `UNVERIFIED`        | Verify public primary data before M1.1 publication, or withhold unverified percentages.                                                                                                |
| `fc-insica-2026`   | `1.2-04`    | `src-public-press-insica`                   | `M1.2 p.40` (INSICA `~100 km`, `24 FP`, end-2026 RFS target)                                                            | Slide states: _"Check project status before teaching."_                                                                                    | `UNVERIFIED`        | Verify current RFS status publicly before publishing M1.2 lesson `1.2-04`.                                                                                                             |
| `fc-tat8-rate`     | `1.1-03`    | `src-atlantic-cable`                        | `M1.1 p.29` (`TAT-8 280 Mb/s`)                                                                                          | Ambiguity between per-pair (`280 Mb/s`) vs total system (`2 x 280 = 560 Mb/s` across 2 working pairs).                                     | `UNVERIFIED`        | Verify against Chesnoy / Atlantic-Cable.com before M1.1 publication.                                                                                                                   |
| `fc-mkcs-434`      | `1.3-02`    | `src-public-press-mkcs`                     | `M1.3 p.16` (`434 km` domestic repeaterless citation, 2017 reference)                                                   | Single unverified historical reference (`2017`); newer systems exceed it.                                                                  | `UNVERIFIED`        | **Excluded from vertical slice `1.3-01`**. Only teach in `1.3-02` if publicly verified and labeled with year.                                                                          |

---

## 5. Clean-Room Licensing & Authoring Workflow

1. **Quarantine:** Keep raw reference PDFs strictly in `sources-private/` (and delete `NEC Advances...pdf` from workspace). Zero PDFs or slide screenshots in `public/` or `content/`.
2. **Conceptual Extraction:** Authors derive technical outlines and equations from audited non-restricted concepts, cross-checking numerical claims against public primary standards/textbooks.
3. **Original Authoring:** Write original Indonesian explanations, design custom React SVG schematics from scratch (never trace vendor slide pixel layouts), and author fresh scenario quizzes that test conceptual mastery without mimicking closed-course question phrasing.
4. **Automated Gate:** CI validates that every MDX lesson, quiz, glossary term, and media asset references `CLEARED` provenance (`public_reuse_allowed: true`) before `next build`.

---

## 6. Concrete Schema Examples `[PROPOSED]` (No Implementation Yet)

### A. Lesson MDX Frontmatter (`content/lessons/1.3-01-arsitektur-ujung-ke-ujung.mdx`)

```yaml
---
lesson_id: "1.3-01"
slug: "arsitektur-ujung-ke-ujung"
module_code: "1.3"
canonical_order: 8
delivery_order: 8
teaching_window: "Hari 2-3"
coverage_status: "COVERED_IN_SOURCE"
title: "Arsitektur Ujung-ke-Ujung Sistem Kabel Laut"
summary: "Memahami perjalanan sinyal optik dari PoP darat, CLS, dan Beach Manhole hingga wet plant di dasar samudra."
quiz_id: "quiz-1.3-01-arch"
related_labs:
  - "eksplorer-sistem"
glossary_ids:
  - "gls-pop"
  - "gls-cls"
  - "gls-bmh"
  - "gls-slte"
  - "gls-pfe"
  - "gls-edfa"
  - "gls-ropa"
  - "gls-bu"
rights_status: "CLEARED"
public_reuse_allowed: true
authoring_mode: "clean-room-original-prose"
source_refs:
  - source_id: "src-itu-g977-1"
    scope: "<verify-exact-clause-before-M1-freeze>"
    role: "public-standard-verification"
  - source_id: "src-itu-g972"
    scope: "<verify-exact-clause-before-M1-freeze>"
    role: "public-standard-terminology"
fact_check_ids: []
# Note: Internal curriculum outline tracing (e.g., src-sedp-m1-3-arch) lives ONLY in the non-published
# editorial matrix and is never placed in public MDX `source_refs`; `fc-armour-depths` and `fc-mkcs-434`
# are omitted from 1.3-01 unless/until their underlying primary public sources are inspected and verified.
last_reviewed: "2026-11-18"
---
```

### B. Glossary Entry (`content/glossary.json`)

```json
{
  "glossary_id": "gls-bmh",
  "term_en": "Beach Manhole",
  "abbr": "BMH",
  "term_id": "Sumur Transisi Pantai (Beach Manhole)",
  "aliases": ["beach manhole", "bmh", "manhole pantai", "sumur transisi pantai"],
  "category": "infrastruktur-darat",
  "definition_id": "Ruang beton bawah tanah di dekat garis pantai tempat kabel laut berpelindung ganda disambungkan ke kabel darat menuju Cable Landing Station.",
  "engineering_note_id": "Pada sistem ber-repeater, saluran dari BMH ke CLS membawa kabel serat optik sekaligus konduktor daya PFE dan mengisolasi kabel pantai yang rentan gangguan mekanis.",
  "related_lesson_ids": ["1.3-01"],
  "rights_status": "CLEARED",
  "public_reuse_allowed": true,
  "source_refs": [
    { "source_id": "src-itu-g972", "scope": "<verify-exact-clause-before-M1-freeze>" }
  ]
}
```

### C. Original Quiz Schema (`content/quizzes/quiz-1.3-01-arch.json`)

```json
{
  "quiz_id": "quiz-1.3-01-arch",
  "lesson_id": "1.3-01",
  "title_id": "Uji Pemahaman: Arsitektur Sistem Kabel Laut Ujung-ke-Ujung",
  "rights_status": "CLEARED",
  "public_reuse_allowed": true,
  "origin": "clean-room-original",
  "source_refs": [
    { "source_id": "src-itu-g977-1", "scope": "<verify-exact-clause-before-M1-freeze>" }
  ],
  "questions": [
    {
      "question_id": "q-1.3-01-01",
      "prompt_id": "Sebuah tautan kabel laut sepanjang 380 km menghubungkan dua pulau tanpa menaruh penguat aktif bertenaga listrik di dasar laut. Kombinasi arsitektur manakah yang paling tepat untuk kondisi tersebut?",
      "options": [
        {
          "id": "a",
          "text_id": "Sistem repeaterless dengan SLTE dan pompa ROPA atau Raman dari stasiun darat, tanpa PFE"
        },
        {
          "id": "b",
          "text_id": "Sistem repeatered lengkap dengan PFE bertegangan tinggi agar EDFA laut tetap aktif"
        },
        {
          "id": "c",
          "text_id": "Jalur koaksial FDM tanpa kabel serat optik di antara dua BMH"
        },
        {
          "id": "d",
          "text_id": "Hanya penguat EDFA standar di SLTE tanpa Raman maupun ROPA karena jarak di bawah 500 km"
        }
      ],
      "correct_option_id": "a",
      "explanation_id": "Penguat EDFA di terminal darat umumnya cukup hingga sekitar 120 km; untuk rentang seperti 380 km tanpa peralatan aktif bertenaga listrik di dasar laut, sistem repeaterless memakai penguatan Raman terdistribusi dan/atau ROPA yang dipompa secara optik dari darat sehingga PFE tidak diperlukan.",
      "lesson_section_anchor": "#sistem-repeaterless-vs-repeatered"
    }
  ]
}
```
