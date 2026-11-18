# Architectural & Environment Decisions: SEDP Learning Hub

Log of verified Phase 0A decisions, constraints, and deferred boundaries.

---

## ADR-001: Node.js Runtime Pinning (`.nvmrc` vs `engines` vs CI)

- **Date:** 2026-11-18
- **Status:** Accepted (Phase 0A)
- **Context:** The local Windows workstation runs Node `v22.16.0` (Maintenance LTS). In November 2026, Node 26 is Active LTS, Node 24 is Maintenance LTS, Vitest `5.1.0` requires `^22.12 || ^24 || >=26`, and `jsdom@31.0.1` / `undici@8.12.4` declare engine ranges `^22.22.2 || ^24.15.0 || >=26.0.0` / `>=22.19.0`.
- **Decision:**
  - Pin `"engines": { "node": ">=22.12.0" }` in [package.json](../package.json) so local Node `22.16.0`, `24`, and `26` remain supported.
  - Set [.nvmrc](../.nvmrc) to `22.16.0` to match the verified local runtime.
  - Target Node `26` (Active LTS) in [.github/workflows/ci.yml](../.github/workflows/ci.yml) so CI executes cleanly without engine mismatch warnings.
- **Consequences:** Local `pnpm install` emits non-blocking `EBADENGINE` warnings for `jsdom@31.0.1`, `w3c-xmlserializer@6.0.0`, and `undici@8.12.4` on Node `22.16.0`, while all Vitest unit smoke tests pass. Upgrading local Node to `>=22.22.2`, `24.15+`, or `26` removes the warning.

## ADR-002: Package Manager Installation & pnpm 12 `allowBuilds` Policy

- **Date:** 2026-11-18
- **Status:** Accepted (Phase 0A)
- **Context:** `pnpm` was not installed initially (`corepack 0.32.0` was present, though Corepack is no longer bundled starting Node 25). pnpm 12 enforces `strictDepBuilds: true` via `allowBuilds:` in [pnpm-workspace.yaml](../pnpm-workspace.yaml).
- **Decision:** Install `pnpm` globally via `npm install -g pnpm@12` (`pnpm@12.21.0`), pin `"packageManager": "pnpm@12.21.0"` as an exact semver in [package.json](../package.json), and keep explicit `allowBuilds` (`sharp: false`, `unrs-resolver: false`) in [pnpm-workspace.yaml](../pnpm-workspace.yaml).
- **Consequences:** Deterministic package-manager resolution across Windows and CI without relying on deprecated `onlyBuiltDependencies` or disabling build-script strictness.

## ADR-003: Next.js 16.4.6 Scaffolding & ESLint 9 Pinning

- **Date:** 2026-11-18
- **Status:** Accepted (Phase 0A)
- **Context:** Workspace directory `SEDP Notebook Live` fails npm package-name validation (`validate-npm-package-name`) and contains root `AGENTS.md` and `DESIGN.md`. Next.js 16 also removed `next lint` and defaults both `next dev` and `next build` to Turbopack.
- **Decision:**
  - Scaffold in `./sedp-learning-hub` with `--skip-install --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --yes --disable-git --no-agents-md --no-cache-components`, move files (including `.gitignore`) to root without overwriting `AGENTS.md`/`DESIGN.md`/`docs/`, remove template `public/*.svg` assets, and run `pnpm install` at root.
  - Keep `"eslint": "^9"` (`9.39.5`) with `eslint-config-next@16.4.6` flat config ([eslint.config.mjs](../eslint.config.mjs)) and `"typescript": "^5"` (`5.9.3`), avoiding `eslint@10` / `typescript@7` until plugin peer ranges allow them.
  - Use `"typecheck": "next typegen && tsc --noEmit"` so Next.js 16 generated route helper types (`LayoutProps<"/">`) resolve cleanly on a fresh checkout prior to `next build`.

## ADR-004: shadcn/ui (`base-nova`) + `DESIGN.md` Token Namespacing

- **Date:** 2026-11-18
- **Status:** Accepted (Phase 0A)
- **Context:** `shadcn@4.23.0 init` defaults to Tailwind CSS 4 CSS-first `@theme inline` tokens (`base-nova` preset using `@base-ui/react`, `cn`, `lucide-react`, `tw-animate-css`) and maps `--accent` as a subtle hover background paired with dark `--accent-foreground`.
- **Decision:**
  - Run `shadcn@4.23.0 init -d -y --no-monorepo --pointer` first, then layer `DESIGN.md` tokens in [src/app/globals.css](../src/app/globals.css) using `--sedp-*` custom properties.
  - Map shadcn `--primary` and `--ring` to `--sedp-accent` (`#096573` Light, `#35D0BA` Dark / `.abyss-bay`), and map shadcn's hover `--accent` to `--sedp-bg-inset` (`#EAF0F3` / `#132F46`).
  - Scope `.abyss-bay` alongside `.dark` so embedded dark instrument bays inside Light Mode automatically override local CSS variables and maintain `>= 3:1` UI and `>= 4.5:1` text contrast.
  - Note for Phase 0B: `shadcn init` installed `lucide-react@^1.74.0`; `UX_BLUEPRINT.md` must evaluate icon choices under `antislop` `R-04` and prefer custom subsea engineering SVGs for domain hardware.

## ADR-005: Separate Vitest 5 & Playwright Suites

- **Date:** 2026-11-18
- **Status:** Accepted (Phase 0A)
- **Context:** Vitest 5 (`5.1.0`) requires `vite` (`8.3.8`) as a non-optional peer and does not support async React Server Components; Vitest's default glob also matches Playwright `*.spec.ts` files unless isolated.
- **Decision:** Keep unit/client component tests in `tests/unit/` ([vitest.config.mts](../vitest.config.mts) using Vite 8 native `resolve: { tsconfigPaths: true }`, excluding `tests/e2e/**`, run via `"vitest run"`) and end-to-end / Server Component smoke checks in `tests/e2e/` ([playwright.config.ts](../playwright.config.ts) running against `next start`).

## ADR-006: Deferred Phase F (`docs/future/`) Boundary

- **Date:** 2026-11-18
- **Status:** Deferred (Not Approved for MVP)
- **Context:** [docs/future/](../docs/future/README.md) holds adapted planning specs for an optional Phase F platform (FastAPI, PostgreSQL, Redis, auth, learner accounts).
- **Decision:** Phase F is **NOT PART OF THE MVP** and remains unapproved until explicit owner sign-off is recorded here. Phase 0A installed zero backend/database/auth dependencies and reserved `/api/v1` without creating route handlers.
