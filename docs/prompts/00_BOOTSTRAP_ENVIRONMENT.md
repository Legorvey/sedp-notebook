# PROMPT 00: SEDP Learning Hub - Phase 0A / Environment Bootstrap

You are the Lead Software Engineer for **SEDP Learning Hub**, an independent, public, educational web application about subsea cable systems. This is an **Immersive Ocean** learning experience: editorial-quality lessons, precise engineering visualizations, simulations, and original assessments. Indonesian is the main teaching language, with correct English engineering terminology. Do not present the site as an official SEDP, Telkom University, NEC, or other company product.

## Exact task boundary

Perform **environment initialization only**. Inspect the current workspace/repository first (including root [AGENTS.md](../../AGENTS.md), [DESIGN.md](../../DESIGN.md), `docs/prompts/`, and `docs/future/README.md`). Preserve all existing documentation folders (`docs/prompts/`, `docs/future/`), `AGENTS.md`, and `DESIGN.md`. If no app scaffold exists yet, scaffold a minimal, working project; if one already exists, inspect and propose minimally invasive changes. Do **not** implement the product UI, lesson content, simulation engines, authentication, database, AI tutor, or deployment. Do not create made-up placeholder lessons just to fill pages, and do **not** implement anything from `docs/future/`.

## Agent tooling

1. Discover available skills, MCP tools, subagents, and project instructions (`AGENTS.md`, `DESIGN.md`, and installed `/antislop` skills). Read relevant available skills rather than assuming their names or powers.
2. Before creating or editing UI shell files (`src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`), resolve the `/antislop` usage mode strictly per [AGENTS.md](../../AGENTS.md) Section 5 (explicit session choice -> global settings file -> ask if unresolved).
3. Use subagents only if supported and helpful. Do not falsely claim to have invoked them.
4. Check installed runtime versions (`node`, `npm`, `pnpm`), git state, and network availability. Check official documentation for tool compatibility before installing.

## Approved baseline (verified against Next.js 16.4.x ecosystem)

- **Framework:** Next.js 16 stable (`16.4.x`, App Router, Turbopack default for dev/build), React 19, TypeScript strict (`typescript@^5`, avoid `7.x` until `typescript-eslint` peer ranges allow it), Tailwind CSS 4 (CSS-first `@theme`, no `tailwind.config.js`), shadcn/ui (`shadcn@latest`).
- **Runtime & Package Manager:** Target Node.js 26 Active LTS (Node.js 24 and 22 Maintenance LTS are supported; Vitest 5 requires `>= 22.12`, Next.js 16 requires `>= 20.9`). Set `"engines": { "node": ">=22.12.0" }` in `package.json` so Node 22/24/26 all run cleanly, and match `.nvmrc` to the CI-tested LTS version documented in `docs/DECISIONS.md`. Sole package manager: **pnpm 12**, pinned via exact semver in `"packageManager"` (e.g., `"pnpm@12.21.0"` matching `pnpm -v`; never use a wildcard like `"pnpm@12.x"`, which fails `manage-package-manager-versions`).
  - If `pnpm` is missing on Windows, install via `npm install -g pnpm@12` rather than relying on Corepack (Corepack is removed starting Node 25). If global install is blocked or fails, report the exact reproducible install command instead of falling back to `npm` or `yarn`.
  - Handle pnpm 12 strict dependency build scripts via `allowBuilds:` in `pnpm-workspace.yaml` (never deprecated `onlyBuiltDependencies`). Resolve `ERR_PNPM_IGNORED_BUILDS` per package in `pnpm-workspace.yaml` or via `pnpm --allow-build=<pkg> ...` (including `pnpm --allow-build=<pkg> dlx ...` if needed) rather than blocking on interactive `pnpm approve-builds` or disabling strictness globally.
- **Linting & Formatting:** ESLint 9 (`eslint@^9` + `eslint-config-next@16.4.x` with flat `eslint.config.mjs`; avoid `eslint@^10` until peer ranges allow it), Prettier, accessible base CSS and `DESIGN.md` tokens; optional Husky/lint-staged ONLY if simple and justified. Note: `next lint` was removed in Next.js 16, so `"lint"` must invoke `eslint` directly.
- **Testing:**
  - Unit & sync component tests: Vitest 5 (`"test": "vitest run"`) + `vite` (`^8`, explicit devDependency; use Vite 8 native `resolve: { tsconfigPaths: true }` in `vitest.config.ts`, or `vite-tsconfig-paths` only if targeting Vite `< 8`) + `@vitejs/plugin-react` + `jsdom` + `@testing-library/react` + `@testing-library/dom`. Exclude the E2E directory from `vitest.config.ts` so Vitest never runs Playwright `*.spec.ts` files.
  - E2E & async Server Components: Playwright (`@playwright/test`) in a dedicated E2E folder (`testDir` set in `playwright.config.ts`); install Chromium on Windows via `pnpm exec playwright install chromium`, and `pnpm exec playwright install --with-deps chromium` on Linux CI. Vitest does not support async Server Components; route those to Playwright.
- **Planned for later (do not install without need in Phase 0A):** MDX, KaTeX, Motion, React Flow, Recharts.
- **Explicit exclusions:** No Supabase, login, hosted AI, API keys, analytics, CMS, or payment integrations for Phase 0. Never create route handlers under `/api/v1` (reserved if Phase F in `docs/future/` is ever approved).

## Execute in order

A. Check OS, `node -v`, `pnpm -v`, `git status`, and workspace contents (`AGENTS.md`, `DESIGN.md`, `docs/prompts/`, `docs/future/`). If required tools are missing, install or document reproducibly without unexpected global side effects.
B. Bootstrap Next.js TypeScript App Router with Tailwind CSS 4, ESLint 9, `src/` layout, and `@/*` alias:

- **Important scaffold safeguard:** `create-next-app` rejects workspace folder names with spaces or capitals (e.g. `SEDP Notebook Live`) via `validate-npm-package-name`, rejects roots containing `.md` files like `AGENTS.md`/`DESIGN.md`, and writes `AGENTS.md` by default. Furthermore, moving `node_modules` on Windows can fail on pnpm NTFS junctions.
- Therefore, scaffold into a temporary lowercase subdirectory inside the workspace (for example `./sedp-learning-hub`) with `--skip-install` and verified 16.4.x flags:
  `pnpm create next-app@16.4.6 sedp-learning-hub --skip-install --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --yes --disable-git --no-agents-md --no-cache-components`
  (Do **not** pass `--turbopack`; it does not exist in 16.4 because Turbopack is already the default.)
- Move ALL scaffolded files (explicitly including hidden dotfiles like `.gitignore`, plus `eslint.config.mjs`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `src/`, `public/`, `package.json`) into the repository root without overwriting existing `AGENTS.md`, `DESIGN.md`, `docs/`, or `.git/` (create or merge root `.gitignore`). Delete the temporary directory.
- Remove default template `public/*.svg` leftovers (`next.svg`, `vercel.svg`, `file.svg`, `globe.svg`, `window.svg`) so no unrequested template assets remain (`R-23`, `R-30`).
- Inspect `package.json`: set `"name": "sedp-learning-hub"`, `"packageManager": "pnpm@<exact-installed-semver>"`, `"engines": { "node": ">=22.12.0" }`, and ensure `"eslint": "^9"` with `"eslint-config-next": "16.4.x"` (downgrade from `^10` if `create-next-app` wrote `^10`). Configure `pnpm-workspace.yaml` with `allowBuilds:` (never `onlyBuiltDependencies`) and run `pnpm install` at the repository root.
  C. Initialize shadcn/ui **before** finalizing `src/app/globals.css` (`pnpm dlx shadcn@latest init --help` first to confirm non-interactive flags; pass `--allow-build=<pkg>` if `pnpm dlx` hits `ERR_PNPM_IGNORED_BUILDS`), only if compatible with Next 16 + React 19 + Tailwind 4.
- Note that `shadcn init` writes its own theme tokens and may add `lucide-react`; map `DESIGN.md`'s `--sedp-*` tokens cleanly into `globals.css` **after** `shadcn init` completes (mapping shadcn `--primary` and `--ring` to `--sedp-accent` and shadcn's hover surface `--accent` to `--sedp-bg-inset` / `--sedp-abyss-inset`, never `#096573`).
- Replace starter `Geist` / `lang="en"` boilerplate in `src/app/layout.tsx` with `<html lang="id">`, unique `<title>`, `DESIGN.md` typography (`Source Serif 4`, `IBM Plex Sans`, `IBM Plex Mono`) or documented font tokens, and zoom-friendly viewport defaults.
- Keep `src/app/page.tsx` minimal and honest (a brief Indonesian/English setup status view identifying SEDP Learning Hub as an independent educational resource under setup, styled with `DESIGN.md` base tokens `--sedp-bg-canvas`, `--sedp-text-primary`, `--sedp-accent`, and `<main>`); **do not** build an elaborate landing page, fake stats, or placeholder lessons during Phase 0A. Include accessible CSS primitives in the base layer (`cursor: pointer` on enabled interactive controls, `cursor: not-allowed` on disabled, `3:1` `:focus-visible` indicator, `@media (prefers-reduced-motion: reduce)`).
  D. Establish a coherent repository structure preserving `AGENTS.md`, `DESIGN.md`, `docs/prompts/`, and `docs/future/`, and ensuring:
- `src/app`, `src/components`, `src/features`, `src/lib`, `src/styles` (if needed), `content`, `public/assets`, `docs/plans`, `docs/research`, and `sources-private` (local only).
- Add `.gitkeep` (or concise scope `README.md`) inside empty tracked directories (`content/`, `public/assets/`, `docs/plans/`, `docs/research/`) so Git retains them. Do not create hundreds of empty files.
  E. Update `.gitignore` to exclude `sources-private/`, raw training materials, original lecture screenshots, secrets, local exports, `.env*` (except safe `.env.example`), Playwright reports/artifacts, and build artifacts. Raw PDFs must NEVER be placed in `public/`.
  F. Add or update `README.md`, `.env.example` (zero real credentials), `.nvmrc`, `.editorconfig`, Prettier config, `package.json` scripts (`dev`, `build`, `typecheck`, `lint`, `test` using `"vitest run"`, and `test:e2e`), minimal Vitest unit smoke test + Playwright E2E smoke test in separate folders, and standard GitHub Actions CI (`.github/workflows/ci.yml` running lint, typecheck, unit tests, build, and Playwright smoke if configured with `pnpm exec playwright install --with-deps chromium`; never auto-deploy).
  G. Run install, lint (`pnpm lint`), typecheck (`pnpm typecheck`), unit tests (`pnpm test`), production build (`pnpm build`), and a local smoke check (start app, verify `/` renders with zero console/page errors, plus Playwright smoke if Chromium is installed). Fix baseline failures. Report any tests that cannot run and why. Produce a scoped `antislop` Delivery Gate PASS/FAIL report (`R-35`) covering Block 1 Hard Gates plus `R-25`, `R-32`, `R-34` (if toggle exists, otherwise verified light base), `R-39`, and `R-40` on the starter shell (explicitly noting Block 3 multi-section product liveliness is deferred to Phase 0B/MVP per `DESIGN.md`).
  H. Verify root `AGENTS.md` and `DESIGN.md` remain intact and accurate against the actual scripts and files created (update script commands only if needed without removing project rules, `/antislop` routing, or `docs/future/` boundaries). Record environment assumptions, Node `.nvmrc` choice, `pnpm-workspace.yaml` `allowBuilds` entries, and dependency decisions in `docs/DECISIONS.md`.

## Product-level guardrails to encode early

- Public educational site; original prose, original diagrams, sources with attribution and license audits. No reproductions of internally marked NEC slides or closed-course tests without permission.
- A source may inform research without authorizing redistribution.
- Lessons progress from intuitive explanation to engineering model to interactive demonstration to assessment.
- "Immersive Ocean" means readable pelagic editorial prose paired with deep abyssal-navy engineering diagrams, restrained motion, clear typography, and WCAG 2.2 AA contrast in both Light and Dark modes (see [DESIGN.md](../../DESIGN.md)); functional immersion, not decorative overload.
- Mobile-first, semantic HTML, keyboard navigation, focus states, reduced-motion, and WCAG 2.2 AA goals.
- Anonymous reading with no login; no trackers or external secrets in the initial build.

## REQUIRED DELIVERABLES

1. Working baseline repository with verified status.
2. `docs/ENVIRONMENT_REPORT.md`: actual tool versions, install commands, `pnpm-workspace.yaml` `allowBuilds` decisions, test/build outputs, notable issues, and dependency decisions.
3. `docs/DECISIONS.md`, verified root `AGENTS.md`, and verified root `DESIGN.md`.
4. Concise project tree and exact next command to start the development server.
5. Scoped `antislop` Delivery Gate PASS/FAIL evidence for the baseline shell (`R-35`).
6. Clear handoff checklist for Phase 0B (`docs/prompts/01_MULTI_AGENT_IMPLEMENTATION_PLAN.md`).

**Stop after environment setup.** Do not begin product feature development. End with an explicit summary of what was executed vs merely proposed, and include verification evidence for every check run. Ask for owner approval before moving to Phase 0B planning work.
