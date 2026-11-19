# SEDP Learning Hub

Independent, public, Indonesian-language educational web application about subsea cable engineering systems.

> **Disclaimer:** SEDP Learning Hub is an independent educational resource and is **not** affiliated with, endorsed by, or an official product of SEDP, Telkom University, NEC, or any commercial subsea operator.

---

## Current Status: Milestone M0 Verified (Baseline & Static-Export CSP PoC)

This repository contains the verified Phase 0A + Milestone M0 baseline toolchain, remediated UI primitives, static-export (`output: "export"`) CSP script-hash Proof-of-Concept, content/provenance CI gates, and design tokens ([DESIGN.md](./DESIGN.md)), prepared ahead of Milestone M1 vertical slice authoring.

## Baseline Tech Stack

- **Framework:** Next.js 16 (`16.4.6`, App Router, static export `output: "export"`, Turbopack default)
- **UI & Styling:** React 19, TypeScript strict (`^5`), Tailwind CSS 4 (CSS-first `@theme`), shadcn/ui (`base-nova`)
- **Tooling:** Node.js `^22.12.0 || ^24.0.0 || >=26.0.0` (verified on `v22.16.0`; CI matrix tests `22.16.0` & `26`), `pnpm` (`12.21.0`), ESLint 9, Prettier 3
- **Testing:** Vitest 5 (`vite@^8`, React Testing Library, `jsdom`), Playwright (`chromium` + `mobile-touch`, `@axe-core/playwright`)

## Local Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Verification checks
pnpm lint
pnpm format:check
pnpm typecheck
pnpm verify:content
pnpm verify:assets
pnpm test
pnpm build
pnpm csp:hashes
pnpm test:e2e
```

## Repository Structure Highlights

- `src/app/`: Next.js App Router shell and base CSS tokens
- `src/components/`: UI components (`ui/` shadcn primitives and baseline controls)
- `src/features/`, `src/lib/`, `src/styles/`: Reserved domain, utility, and style modules
- `content/`: Future MDX lessons and structured curriculum data (MVP canonical content)
- `public/assets/`: Public static assets only (**never** place raw PDFs or internal slides here)
- `tests/unit/` & `tests/e2e/`: Separate Vitest unit and Playwright E2E suites
- `docs/prompts/`: Phase 0A and Phase 0B execution prompts
- `docs/plans/` & `docs/research/`: Phase 0B planning and research outputs
- `docs/future/`: **Deferred Phase F specifications (`DO NOT DELETE`, not part of MVP)**
- `sources-private/`: Local-only git-ignored folder for private reference materials
