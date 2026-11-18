# PROMPT 01: SEDP Learning Hub - Phase 0B / Multi-Agent Implementation Plan

You are now the Technical Program Lead and Principal Architect. Phase 0A environment bootstrap (`docs/prompts/00_BOOTSTRAP_ENVIRONMENT.md`) must be complete, or any remaining gaps must be documented first. The objective is to create an **evidence-based, multi-agent implementation plan** for a public, independent **SEDP Learning Hub** with an **Immersive Ocean** UX. **Planning only: do not implement feature code yet.**

## Step 1: Discover, resolve mode, and delegate

- Inspect the actual repository, root [AGENTS.md](../../AGENTS.md), root [DESIGN.md](../../DESIGN.md), `docs/ENVIRONMENT_REPORT.md`, `docs/DECISIONS.md`, [docs/future/README.md](../future/README.md), and the real list of available skills and subagents. Read applicable skills first, including the `/antislop` skill suite (`antislop`, `antislop-ui`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`, `antislop-code`).
- Resolve the `/antislop` usage mode (`during` vs `after`) strictly per [AGENTS.md](../../AGENTS.md) Section 5 before designing `UX_BLUEPRINT.md` or evaluating UI copy.
- Keep `docs/future/` strictly isolated as deferred Phase F: do **not** pull Phase F backend, CMS, auth, or learner accounts into the MVP plan; use `docs/future/README.md` only to keep MVP content IDs (`lesson_id`, `quiz_id`), provenance enums (`rights_status`, `source_type`, `trust_level`, `fact_check_status`), and `/api/v1` avoidance compatible.
- Use available subagents in parallel when beneficial; otherwise simulate roles sequentially without claiming actual delegation.
- Suggested independent workstreams:
  1. **Product/UX Architect**: product requirements, learning journey, ocean design system anchored in `DESIGN.md` + `/antislop`, 3-state responsive wireframes, interaction model, accessibility, and light/dark parity.
  2. **Curriculum & Source Auditor**: inventory local `sources-private/` PDFs and notes if present, page-level evidence map, content taxonomy, gaps and contradictions.
  3. **Subsea Engineering Reviewer**: technical concepts, simulations, dimensional consistency, assumptions, numerical verification, accuracy risk.
  4. **Full-Stack Architect**: Next.js 16 App Router architecture, MDX content pipeline and React 19 / Turbopack compatibility verification, schema, source provenance, component boundaries, deployment architecture.
  5. **Public Content/Legal Reviewer**: copyright and licensing constraints, branding and logo risk, proprietary NEC slides, closed-course quiz prohibition, attribution.
  6. **Testing & Accessibility Engineer**: Vitest 5 (sync units) vs Playwright (E2E & async Server Components), simulator edge cases, WCAG 2.2 AA + contrast math, `/antislop` Delivery Gate & skill checklists, performance mechanisms, security, and CI.
- Each role must independently submit a short report with findings, unresolved questions, recommended decisions, and risks. Integrate and reconcile contradictory recommendations.

## Step 2: Examine sources instead of assuming content

Primary sources referenced by the owner (check workspace and `sources-private/` first; **none of these are committed to the repo by default**):

- User-created SEDP master notes through Day 2, Day 1/2 screenshots, and/or compiled textbook (`[MISSING unless present in sources-private/]`).
- Official Module 1.1, Module 1.2, and NEC advance slides (some NEC material marked 'Internal Use Only') (`[MISSING unless present in sources-private/]`).
- Pre-test and post-tests for Modules 1.1/1.2 (question sets are research inputs only, NOT reusable public quiz content) (`[MISSING unless present in sources-private/]`).
- `Catatan SEDP-1.pdf` (10 pages, most recent Day 3 notes) and `PROJECT_BRIEF.md` (not present in the initial repository) (`[MISSING unless provided by owner]`).

Strict source rules:

- Inspect what is actually on disk. Any listed source or `PROJECT_BRIEF.md` not present in the workspace or `sources-private/` MUST be marked **`MISSING`** in `docs/plans/CONTENT_AND_SOURCES.md` and flagged for the owner to supply privately. NEVER fabricate page numbers, quote text without inspection, or assume prior chat attachments are mounted in the coding agent workspace.
- Keep sources outside published assets in the git-ignored local `sources-private/` directory or private storage. Create a source register including filename, ownership, license status, module, page range, source type, trust level, facts to verify, and whether public reuse is permitted.

## Step 3: Build scope and IA from source coverage

Curriculum sequence should include:

- 1.1 History and technology evolution: telegraph, Atlantic cables, coaxial telephony, satellite, fiber/WDM/coherent/SDM.
- 1.2 Global lifeline: international infrastructure, Indonesia, capacity, resilience, fault case studies, geopolitics and policy, with verification.
- 1.3 Architecture: wet/dry plant, CLS, BMH, SLTE, optical transponders, DWDM, spectrum, modulation, Shannon capacity, PFE/voltage faults, COTDR, ownership models, system margins, and redundancy. Mark uncovered sections as partial.
- 1.5 Lifecycle and marine survey: business case to retirement, route planning, RPL, permits, marine services, hydrography/geophysics, SBES/MBES/SSS/SBP/USBL, magnetometer, gravity corer. **Actual teaching order jumped from 1.3 to 1.5 before 1.4; preserve both curriculum and event ordering.**
- 1.4: do NOT invent completed content; indicate unavailable/not yet sourced until actual material arrives.
  Cross-cutting pages: glossary with aliases, timeline, formula sheet, source library, simulator lab, original quiz bank, fact-check log.

## Step 4: Make specific UX decisions for Immersive Ocean (with `DESIGN.md` + `/antislop`)

- Anchor `docs/plans/UX_BLUEPRINT.md` in root [DESIGN.md](../../DESIGN.md) (`ENERGY 2 / RHYTHM 2 / MOTION 1`, editorial light-first lesson canvas paired with `.abyss-bay` dark instrument panels, plus a working Light/Dark toggle verified in both modes per `R-21` and `R-34`). Include a formal `Design Read` statement, all 5 Liveliness Levers, and an explicit `R-31` decision rationale table covering every visual choice (`R-01`, `R-04`, `R-06`, `R-07`, `R-08`, `R-09`, `R-10`, `R-12`, `R-13`, `R-14`, `R-19`, `R-22`). If any UX decision updates `DESIGN.md`, propose the update cleanly for owner review (`R-37`).
- Visual discipline (`antislop` + `antislop-ui`):
  - Palette capped at 2 core ocean colors + 1 deliberate cyan-teal accent (`R-29`) using `--sedp-*` tokens and `.abyss-bay` local overrides; never map `#096573` to shadcn's hover `--accent`. No generic AI blue-purple gradients or neon glows everywhere (`R-01`, `R-13`).
  - Topographical/bathymetric depth textures allowed ONLY with written architectural purpose and low contrast (`<= 8%` opacity, never blueprint grids behind prose, `R-07`, `R-25`).
  - Glassmorphism max 1-2 functional overlays (`R-10`), elevation via crisp borders first (`R-12`, no decorative colored left stripes without state meaning), deliberate radius hierarchy (`R-11`), non-uniform section rhythms (`R-05`, `R-14`).
  - Evaluate `lucide-react` critically (`R-04`): avoid uniform thin-stroke default icons for engineering concepts; specify custom domain SVGs for subsea plant, and forbid decorative emojis, decorative button arrows (`R-08`), eyebrow badges with pulsing status dots (`R-09`), and fake terminal windows.
- Required responsive views (covering every route in Step 3 so zero links are dead per `R-24`):
  - Primary views: Home, Learn Index, Lesson Reader, Interactive Lab, Practice (Original Quiz Bank), Reference Hub (Glossary + Formula Sheet + Timeline), About + Sources + Source Library + Fact-Check Log + Disclaimer.
- Lesson template: intuitive explanation -> anchored interactive diagram -> engineering deep dive (progressive disclosure) -> real case with citation -> check understanding.
- Layout, touch & zoom (`R-03`, `antislop-layoutmobile`, `antislop-human`): define three real responsive states (mobile `< 600px`, tablet/small laptop `600px-1024px`, desktop `> 1024px`) with `>= 44x44px` tap targets, zero horizontal overflow, layout integrity at 200% zoom without clipping, mobile keyboard scroll-into-view on interactive inputs, tap and keyboard equivalents for all hover tooltips on schematics, collapsible desktop sidebar + central readable column (`65ch-72ch`) + contextual TOC/inspector, and thumb-friendly mobile navigation that never obscures bottom controls.
- Motion (`R-19`, `R-39`): only when teaching a causal physical process (e.g., optical attenuation or COTDR reflection), strictly honoring `prefers-reduced-motion` and pausing long motion.
- States & Indonesian Copy Honesty (`R-02`, `R-15`..`R-18`, `R-23`, `R-24`, `R-26`, `R-27`, `R-36`, `R-38`, `antislop-copywriting`): specify explicit empty, loading, and error states for every interactive/filter view; real behavior on every control; zero em dashes (`U+2014`), zero buzzwords, zero generic CTAs, zero fabricated stats/logos/testimonials; eliminate AI prose tells (significance inflation, negative parallelism, rule-of-three padding, inline-header bullet lists, mechanical title case, boldface overuse, actorless passive); request explicit owner confirmation or specify honest placeholders for logos, hero art, and attributions.
- Contrast & Accessibility (`R-25`, `R-32`, `R-39`): verify all token pairings mathematically (`>= 4.5:1` body, `>= 3:1` large text & UI boundaries), keyboard operation (`Tab`, `Enter`/`Space`, `Escape`), visible focus rings, `cursor: pointer`, native controls, and semantic landmarks.

## Step 5: Plan simulations as real learning tools

For each simulator specify goal, user inputs, outputs, equations/algorithm, assumptions, unit conversion, validation ranges, edge cases, tests, source notes, and keyboard/screen-reader accessibility fallback (including accessible parameter controls, single-pointer/keyboard equivalents without drag-only barriers, and tabular result readout).
Prioritize:
V1: (a) optical capacity (fiber pairs x spectral width x efficiency and wavelengths x bit rate), (b) attenuation/optical power budget, (c) end-to-end system explorer wet/dry plant/CLS/SLTE/PFE/repeater/BU, (d) route fault and redundancy, (e) interactive historical timeline.
V1.1: (f) PFE polarity/voltage-profile and approximate shunt-fault location with careful modeling limits, (g) coherent modulation QPSK/16QAM/64QAM with reach-vs-OSNR trade-off, (h) spectrum WSS/ASE dummy light, (i) COTDR echo timeline, (j) marine survey instrument explorer.
Make clear where outputs are educational approximations rather than production engineering calculations.

## Step 6: Plan deployment and release boundaries

- Stack: Next.js 16 App Router (Turbopack), React 19, TypeScript 5 (`^5` strict), Tailwind CSS 4, shadcn/ui, MDX, KaTeX, Motion, SVG-first diagrams, React Flow when justified, Recharts. pnpm 12 (`allowBuilds`), Vitest 5 (`vite` peer dep, sync unit/component tests), Playwright (E2E & async Server Components), ESLint 9 (`eslint`, not removed `next lint`), Prettier. Verify MDX, KaTeX, Motion, `@xyflow/react` (React Flow), and Recharts compatibility with React 19 + Next.js 16 Turbopack explicitly in `TECHNICAL_ARCHITECTURE.md` (including client-only boundaries and peer checks such as `react-is` if needed).
- No authentication, billing, or AI chatbot in MVP. Local anonymous learning progress (`localStorage`) may be considered with transparent privacy notice and clear reset action.
- Structure content separately from UI with stable IDs (`lesson_id`, `quiz_id`), typed frontmatter, citations, glossary crosslinks, version history, source confidence, and rights status.
- Security, content licensing, accessibility (`WCAG 2.2 AA`), performance mechanisms (`R-40`: explicit media dimensions, hero `fetchpriority="high"`, no render-blocking head scripts; never fabricate unmeasured Lighthouse/Web Vitals claims), and engineering correctness are release blockers, not nice-to-haves.
- Never publicly expose source PDFs, screenshots, private keys, internal decks, unlicensed images, question-bank reproductions, attendee information, or source-specific restricted diagrams.
- Do not claim SEDP/NEC/Telkom/industry endorsement. Site must clearly say independent educational resource.

## REQUIRED WRITTEN OUTPUT (create these files under `docs/plans/`)

- `docs/plans/PRD.md`: audiences, jobs-to-be-done, goals, non-goals, scope, success criteria.
- `docs/plans/INFORMATION_ARCHITECTURE.md`: route map, navigation, module ordering, and lesson taxonomy.
- `docs/plans/UX_BLUEPRINT.md`: Immersive Ocean visual design aligned with `DESIGN.md` + `/antislop`, `Design Read`, 5 Levers, `R-31` decision rationale table, contrast table, reusable patterns, 3-state responsive wireframes covering all views, empty/loading/error states, interactions, and accessibility.
- `docs/plans/CONTENT_AND_SOURCES.md`: source audit, missing source list (`PROJECT_BRIEF.md`, `sources-private/`), provenance schema (enum names compatible with `docs/future/README.md`), licensing workflow, and public-safe content examples.
- `docs/plans/SIMULATION_SPECS.md`: math, states, behavior, validation, accessibility fallbacks, and tests for prioritized labs.
- `docs/plans/TECHNICAL_ARCHITECTURE.md`: stack decisions, package compatibility notes (MDX, KaTeX, Motion, React Flow, Recharts on React 19 + Turbopack), project tree, data models, MDX pipeline, state, security, CI, and dependency diagram (noting compatibility boundary with deferred `docs/future/`).
- `docs/plans/QUALITY_GATES.md`: Vitest + Playwright gates, visual, full `/antislop` Delivery Gate + all 5 domain skill checklists (`antislop-ui`, `antislop-copywriting`, `antislop-human`, `antislop-layoutmobile`, `antislop-code`, including `R-35` click-through evidence and `R-34` theme parity), accessibility, content, and copyright gates.
- `docs/plans/IMPLEMENTATION_PLAN.md`: MVP ordered milestones, vertical slice, task graph, dependencies, acceptance criteria, risk register, alternatives, and definition of done (separate from deferred `docs/future/IMPLEMENTATION_PLAN.md`).
- `docs/plans/AGENT_REVIEW_SUMMARY.md`: each subagent's findings, disagreements, decisions, and what could not be verified.

## Quality requirements

- Make choices concrete and falsifiable; do not output vague aspiration lists.
- Avoid over-engineering; identify the smallest functional vertical slice before full content conversion. Suggested slice: one complete lesson on end-to-end submarine cable architecture with clickable CLS, SLTE, PFE, repeater, BU, and an embedded knowledge check.
- Respect content copyright and source provenance. Paraphrase/redraw based on public-domain/permitted technical facts rather than publishing internal lecture material.
- Include actual examples of route schemas, lesson frontmatter, glossary entries, question schema, and simulator input/output in the planning documents, with **zero feature implementation**.
- Include realistic alternatives and rationale for trade-offs, plus a risk register.
- Before finalizing, conduct a second review from Engineering, Content, UX (`/antislop`), and Public Rights perspectives; surface unresolved decisions.

## Completion behavior

Return a concise executive recommendation with links to all planning files, a prioritized roadmap, top 5 risks, missing-source checklist (`PROJECT_BRIEF.md`, `sources-private/`), and a checklist of decisions that require owner approval. **STOP BEFORE WRITING FEATURE CODE.** No deployments, paid API connections, or public publication without explicit approval.
