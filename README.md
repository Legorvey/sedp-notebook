# SEDP Learning Hub

Independent, public, Indonesian-language educational web application about subsea cable engineering systems.

> **Disclaimer:** SEDP Learning Hub is an independent educational resource and is **not** affiliated with, endorsed by, or an official product of SEDP, Telkom University, NEC, or any commercial subsea operator.

---

## Current Status: Phase 0A (Environment Bootstrap)

This repository contains the verified Phase 0A Next.js 16 baseline toolchain and design tokens ([DESIGN.md](./DESIGN.md)), prepared ahead of Phase 0B multi-agent curriculum & architecture planning ([docs/prompts/01_MULTI_AGENT_IMPLEMENTATION_PLAN.md](./docs/prompts/01_MULTI_AGENT_IMPLEMENTATION_PLAN.md)).

## Baseline Tech Stack

- **Framework:** Next.js 16 (`16.4.6`, App Router, Turbopack default)
- **UI & Styling:** React 19, TypeScript strict (`^5`), Tailwind CSS 4 (CSS-first `@theme`), shadcn/ui (`base-nova`)
- **Tooling:** Node.js `>=22.12.0` (verified on `v22.16.0`; Node 24/26 LTS supported), `pnpm` (`12.21.0`), ESLint 9, Prettier 3
- **Testing:** Vitest 5 (`vite@^8`, React Testing Library, `jsdom`), Playwright

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
pnpm test
pnpm build
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
