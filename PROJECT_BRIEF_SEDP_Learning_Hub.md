# PROJECT_BRIEF.md — SEDP Learning Hub

> Owner-prepared Phase 0B planning input (2026-11-18). This is a product brief, not permission to implement or publish. Confirm decisions and source availability against the actual repository.

## 1. Product identity

**Working name:** SEDP Learning Hub  
**Type:** Independent, publicly accessible, Indonesian-language educational website explaining submarine cable connectivity and related engineering.  
**Relationship to institutions:** Independent educational resource. Do not imply official affiliation, sponsorship, endorsement, or ownership by SEDP, Telkom University, NEC, or cable operators. Names may be referenced accurately in attributed historical/technical context, not used as branding.

### Why build it?

The owner has accumulated course notes, lecture material, screenshots, and assessments through multiple days of a submarine connectivity learning program. A long Google Docs reference is useful but difficult to absorb linearly. The site should make complex concepts learnable through coherent prose, well-placed illustrations, simulations, and active recall, without sacrificing technical depth or accuracy.

### Who is it for?

- Primary: Indonesian students with little or no initial submarine cable engineering background.
- Secondary: telecom and networking learners interested in systems architecture, optical transport, installation, reliability, and industry context.
- Visitors must be able to read and practice anonymously without creating an account.

## 2. Product principles

1. **Learn -> explore -> practice.** Every complex lesson combines readable explanation, an anchored illustration, deeper technical treatment, and at least one meaningful check of understanding.
2. **Progressive disclosure, not superficial summaries.** Teach foundational ideas first, then allow deeper engineering explanations without duplicating content.
3. **Interaction should explain a cause.** Prefer diagrams and simulations that respond to physical or network parameters, not decorative animations.
4. **Honest technical modeling.** Clearly distinguish illustrative examples, simplified engineering approximations, and verified numerical facts. Include units, constraints, and assumptions.
5. **Provenance by design.** For publishable claims, track the actual verifiable source, link, document version, and (where applicable) page. Flag contradictions and uncertainty rather than fabricating.
6. **Public rights safety.** Source documents may inform planning, but their presence in a local folder does not grant public redistribution rights. Never publish internal slides, full training PDFs, closed-course test content, attendee details, or unlicensed figures.
7. **Mobile and accessibility first.** Reader must work on phones with diagrams, tables, controls, and keyboard/screen-reader equivalents.
8. **Maintainability.** Lesson content stays as reviewed MDX in Git; code and content IDs remain stable as the site evolves.

## 3. Product design

**Selected direction:** Immersive Ocean, defined by root `DESIGN.md` and agent anti-slop skills. Its design identity is an oceanographic field atlas with technically precise visualizations, not a marketing splash page.

- Long-form technical reading: calm editorial canvas, high contrast and excellent typography.
- Active network diagrams and simulator areas: dark `.abyss-bay` instrument panels with restrained cyan/teal accents.
- Light/Dark toggle, reduced motion, responsive three-state reflow, accessible charts/tables and diagrams.
- Visual explanations appear immediately near the text they clarify.
- UI language: natural Indonesian with correct English domain terminology. Friendly, confident, concise, not corny or hyperbolic.

## 4. Information architecture for planning

Top-level visitor experiences:

- **Home:** value proposition, orientation, entry into learning pathway.
- **Learn:** modules, lessons, navigation, cross-referenced concepts and checkpoints.
- **Explore:** technically grounded interactive experiments and system diagrams.
- **Practice:** original quiz bank, calculations, feedback and related lesson links.
- **Reference:** glossary, formula sheet, timeline, curated sources and fact checks.
- Supporting pages: About, Disclaimer, Methodology, Sources, Privacy where needed.

### Curriculum coverage (as observed in owner's conversation)

- **1.1 — History and technology evolution:** early telegraph and transatlantic systems, coaxial telephony, satellite, optical fiber, EDFA, WDM, coherent optics and SDM.
- **1.2 — Global lifeline:** role of subsea cables, Indonesian connectivity, international systems, resilience, fault scenarios, economics and geopolitics.
- **1.3 — Submarine system anatomy (partial Day 2–3 coverage):** wet/dry plant, CLS, BMH, SLTE, transponders, DWDM, PFE, repeater, BU, Raman/ROPA, power and monitoring, COTDR, redundancy and ownership concepts.
- **1.5 — Project lifecycle and marine survey (partial Day 3 coverage):** business and engineering project stages, route planning, permits, RPL, bathymetry/hydrography, marine survey instruments, commissioning, operations and retirement.
- **1.4 — Not sufficiently sourced yet:** do not fabricate or mark as completed.

**Important:** The order in which topics were taught can differ from the canonical module numbering (notably 1.5 taught before 1.4). UI and content models should support both curriculum order and session/day chronology.

### Source inventory expectation

Planning must inspect the actual working directory and only claim a document exists when it can be opened. Candidate research inputs, if owner supplies them and usage is permitted, include:

- Owner's SEDP notes through Day 2 and compiled reference textbook.
- Most recent Day 3 notes, called `Catatan SEDP-1.pdf` in prior discussions.
- Official module 1.1 and 1.2 PDFs, plus any later materials actually provided.
- Pretest and posttests for 1.1 and 1.2 for private competency analysis only, not public reproduction.
- Vendor slides including NEC material marked *Internal Use Only*, which must not be published, and should not be shared with third-party AI systems without sufficient authorization.
- Verifiable public standards and technical publications for independently authored teaching content.

Treat all filenames and page ranges as **unverified until inspected in this workspace**.

## 5. MVP scope (plan only in Phase 0B)

Minimum product should include:

1. A real responsive application shell, navigation and light/dark accessible design system.
2. An auditable, typed MDX curriculum model with stable `lesson_id` and source links.
3. At least one complete lesson that is genuinely useful to study, not a placeholder.
4. A complete first **vertical slice**: *End-to-End Submarine Cable Architecture* with interactive, accessible CLS / SLTE / PFE / repeater / BU relationships and a working original knowledge check.
5. Supporting original diagrams, a small but useful glossary and basic reference navigation.
6. Small, well-specified interactive labs chosen for educational value; keep approximate calculations clearly labeled.
7. Original practice questions with explanation and lesson links; don't reproduce private assessment wording.
8. Public content clearance, accessibility, responsive E2E checks, and performance checks as release blockers.

Suggested V1 lab priorities: optical capacity; attenuation and power budget; end-to-end system explorer; fault and route redundancy; historical timeline. Stagger more advanced PFE, coherent modulation, WSS/ASE, COTDR, and marine-survey simulations after vertical-slice quality is proven.

**MVP non-goals:** auth, accounts, personalized sync, CMS/database, payments, analytics trackers, backend API, AI tutor, live operational network measurements.

## 6. Technical baseline and deferred platform boundary

- Root stack: Next.js 16 App Router, React 19, TypeScript 5 strict, Tailwind CSS 4, shadcn/ui, pnpm 12.
- Content: MDX + typed frontmatter, accessible custom SVG for technical visuals, KaTeX for equations; add graph libraries only as justified.
- Quality: ESLint, Prettier, Vitest, Testing Library, Playwright, automated build and CI.
- Data persistence in MVP: optional transparent local-only progress, with reset and no forced login.
- **Deferred `docs/future/`: DO NOT DELETE and DO NOT IMPLEMENT.** Any future CMS/accounts/services require owner approval and an explicit phase gate after an anonymous static-first MVP ships.
- Maintain compatibility through stable `lesson_id` and `quiz_id`, non-conflicting provenance enums, and reservation of `/api/v1` for a possible later service. No MVP route depends on an API.
- Host Node engine warnings and CI/local runtime drift are an environment follow-up item to document, not an invitation to add features.

## 7. Planning outputs requested in Phase 0B

Produce `docs/plans/PRD.md`, `INFORMATION_ARCHITECTURE.md`, `UX_BLUEPRINT.md`, `CONTENT_AND_SOURCES.md`, `SIMULATION_SPECS.md`, `TECHNICAL_ARCHITECTURE.md`, `QUALITY_GATES.md`, `IMPLEMENTATION_PLAN.md`, and `AGENT_REVIEW_SUMMARY.md` according to `docs/prompts/01_MULTI_AGENT_IMPLEMENTATION_PLAN.md`.

In each output, distinguish **verified**, **derived**, **proposed**, **unresolved**, and **out-of-scope** claims. Specify verifiable acceptance criteria, risks and dependencies. The implementation plan must have a small testable vertical slice before scaling the curriculum.

**STOP after Phase 0B planning. Do not implement feature code or publish anything until the owner approves the plan.**
