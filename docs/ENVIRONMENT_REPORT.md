# Environment Verification Report: SEDP Learning Hub (Phase 0A)

- **Date:** 2026-11-18
- **Phase:** Phase 0A (Environment Bootstrap only)
- **Scope:** Anonymous, static-first Next.js 16 baseline toolchain, design token smoke shell, lint/type/unit/E2E/build verification.

---

## 1. Preflight & Installed Toolchain Versions

| Tool / Package      | Verified Version / Status                                                                                                                  | Source / Note                                                                                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| OS & Arch           | `Microsoft Windows NT 10.0.26200.0` (`X64`)                                                                                                | Host shell inspection                                                                                                       |
| Node.js             | `v22.16.0` (Maintenance LTS)                                                                                                               | Host `node -v`; `package.json` `engines >= 22.12.0`, `.nvmrc` `22.16.0`, CI targets Node `26`                               |
| npm                 | `10.9.2`                                                                                                                                   | Host `npm -v`                                                                                                               |
| pnpm                | `12.21.0` (installed via `npm install -g pnpm@12`)                                                                                         | Was missing initially; pinned in `package.json` `"packageManager": "pnpm@12.21.0"`                                          |
| Git                 | `git version 2.49.0.windows.1`                                                                                                             | Host `git --version`                                                                                                        |
| Next.js             | `16.4.6`                                                                                                                                   | App Router, Turbopack default for `dev` & `build`                                                                           |
| React / React DOM   | `19.3.0`                                                                                                                                   | Installed via scaffold                                                                                                      |
| TypeScript          | `5.9.3` (`^5`)                                                                                                                             | Strict mode in `tsconfig.json`                                                                                              |
| Tailwind CSS        | `4.3.3` + `@tailwindcss/turbopack@4.3.3`                                                                                                   | CSS-first `@theme inline` in `src/app/globals.css`                                                                          |
| shadcn/ui           | `shadcn@4.23.0` (`base-nova` preset)                                                                                                       | `@base-ui/react@1.9.0`, `class-variance-authority@0.7.1`, `cn@0.5.2`, `lucide-react@1.74.0`, `tw-animate-css@1.4.0`         |
| ESLint              | `9.39.5` (`^9`) + `eslint-config-next@16.4.6`                                                                                              | Flat config in `eslint.config.mjs`                                                                                          |
| Prettier            | `3.10.1`                                                                                                                                   | `.prettierrc.json` & `.prettierignore`                                                                                      |
| Vitest / Vite / RTL | `vitest@5.1.0`, `vite@8.3.8`, `@vitejs/plugin-react@6.3.0`, `jsdom@28.1.0`, `@testing-library/react@16.3.3`, `@testing-library/dom@10.4.2` | Native Vite 8 `resolve: { tsconfigPaths: true }` in `vitest.config.mts`; `jsdom@28.1.0` aligns with Node `22.16.0` and `26` |
| Playwright          | `@playwright/test@1.65.1` + Chromium (`v1255` / Chrome for Testing `159.0.8154.6`)                                                         | Installed via `pnpm exec playwright install chromium`                                                                       |

---

## 2. Notable Issues & Dependency Decisions

1. **Initial missing `pnpm`:** Installed globally via `npm install -g pnpm@12` (`12.21.0`) rather than Corepack (`0.32.0`), because Corepack is discontinued starting Node 25.
2. **pnpm 12 `allowBuilds`:** Scaffold created `pnpm-workspace.yaml` with `allowBuilds: { sharp: false, unrs-resolver: false }`. Zero `ERR_PNPM_IGNORED_BUILDS` failures occurred across all installs (`next@16.4.6`, `shadcn`, `vitest@5.1.0`, `vite@8.3.8`, `@playwright/test@1.65.1`).
3. **Node `v22.16.0` engine alignment on `jsdom`:** Initial `jsdom@31.0.1` (`^22.22.2 || ^24.15.0 || >=26.0.0`) emitted non-fatal `EBADENGINE` warnings on Node `22.16.0`. In M1, `jsdom` was pinned to `^28.1.0` (`^20.19.0 || ^22.12.0 || >=24.0.0`), eliminating all `EBADENGINE` warnings on `22.16.0` while preserving Vitest 5 and Node `26` CI support. Recorded in [DECISIONS.md](./DECISIONS.md).
4. **ESLint `9.39.5` npm deprecation notice:** Intentional pin (`eslint@^9` with `eslint-config-next@16.4.6`) per `AGENTS.md` to avoid `eslint@10` plugin peer mismatches.
5. **Next.js 16 `LayoutProps<"/">` typegen:** `tsc --noEmit` initially failed before `next build` because `LayoutProps` lives in `.next/types/routes.d.ts`. Updated `"typecheck"` script to `"next typegen && tsc --noEmit"` so fresh checkouts and CI pass independently of `next build`.
6. **Git safety check:** Audited commit `5cbca24` and working tree; zero `.pdf`, `.pptx`, `.env`, `.key`, or `.pem` artifacts are tracked, and `sources-private/`, `public/**/*.pdf`, `.env*` (except `!.env.example`), `/playwright-report/`, and `/test-results/` are ignored in `.gitignore`.

---

## 3. Commands Executed & Verification Results

All checks below ran cleanly after edits:

| Check                     | Command                                                                                                                                                                                          | Exit Code | Observed Result                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm` install (global)   | `npm install -g pnpm@12`                                                                                                                                                                         | `0`       | Installed `pnpm 12.21.0`                                                                                                                    |
| Next.js scaffold          | `pnpm create next-app@16.4.6 sedp-learning-hub --skip-install --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --yes --disable-git --no-agents-md --no-cache-components` | `0`       | Created template cleanly; moved to root, removed `public/*.svg`                                                                             |
| Root install              | `pnpm install`                                                                                                                                                                                   | `0`       | Resolved & linked 353 packages                                                                                                              |
| shadcn init               | `pnpm dlx shadcn@4.23.0 init -d -y --no-monorepo --pointer`                                                                                                                                      | `0`       | Created `components.json`, `src/components/ui/button.tsx`, `src/lib/utils.ts`                                                               |
| Dev test deps             | `pnpm add -D prettier vitest vite @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @playwright/test`                                                                       | `0`       | Added 8 devDependencies                                                                                                                     |
| Chromium browser          | `pnpm exec playwright install chromium`                                                                                                                                                          | `0`       | Downloaded Chromium `v1255` + headless shell                                                                                                |
| TypeScript check          | `pnpm typecheck` (`next typegen && tsc --noEmit`)                                                                                                                                                | `0`       | Generated route types and passed `tsc --noEmit` with 0 errors                                                                               |
| ESLint                    | `pnpm lint` (`eslint .`)                                                                                                                                                                         | `0`       | 0 warnings, 0 errors                                                                                                                        |
| Formatting                | `pnpm format:check` (`prettier --check .`)                                                                                                                                                       | `0`       | All matched files pass Prettier code style                                                                                                  |
| Unit smoke test           | `pnpm test` (`vitest run`)                                                                                                                                                                       | `0`       | `1 passed (1)`, `2 passed (2)` (`cn` helper & `ThemeToggle` state)                                                                          |
| Production build          | `pnpm build` (`next build`)                                                                                                                                                                      | `0`       | Turbopack compiled & prerendered `/` and `/_not-found` statically                                                                           |
| Local launch & E2E        | `pnpm test:e2e` (`playwright test` against `next start -p 3100`)                                                                                                                                 | `0`       | `4 passed (2.2s)`: desktop `1280x800`, tablet `768x1024`, mobile `375x812`, keyboard skip-link, Light/Dark toggle, zero console/page errors |
| Gitignore & secrets check | `git check-ignore -v` + `git status --short`                                                                                                                                                     | `0`       | Confirmed `sources-private/`, `.env`, `public/test.pdf`, `playwright-report/` are ignored; no secrets or PDFs tracked                       |

---

## 4. Scoped `antislop` Delivery Gate (`R-35` Baseline Shell)

Scope: Phase 0A minimal setup verification shell (`src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/components/theme-toggle.tsx`). Full multi-section Block 3 liveliness and product composition are explicitly deferred to Phase 0B (`docs/plans/UX_BLUEPRINT.md`) and MVP implementation per [DESIGN.md](../DESIGN.md).

- **R-02 PASS:** Zero em dashes (`U+2014`) across all source files and all markdown files.
- **R-03 PASS:** Verified `0` horizontal overflow at `375x812`, `768x1024`, and `1280x800` via Playwright; `ThemeToggle` height `>= 44px` verified by `boundingBox()`.
- **R-17 / R-18 / R-23 / R-36 / R-38 PASS:** Zero fabricated statistics, testimonials, logos, or placeholder lessons; `public/*.svg` Next/Vercel template logos deleted; clear independent educational disclaimer rendered in `<footer>`.
- **R-24 / R-26 PASS:** Only interactive controls on `/` are skip link `<a href="#main-content">` (scrolls/focuses `#main-content`) and `ThemeToggle` `<button>` (toggles `.dark` class and `aria-pressed`). Zero dead links or non-functional buttons.
- **R-25 / R-34 PASS:** All `--sedp-*` and `.abyss-bay` Light/Dark token pairings mathematically verified with `contrast-check.py` (`>= 4.95:1` text, `>= 3.73:1` control borders); computed light (`rgb(246, 248, 249)`), embedded `.abyss-bay` (`rgb(8, 24, 38)`), and toggled `.dark` (`rgb(8, 24, 38)`) backgrounds verified at runtime in Playwright.
- **R-32 / R-39 PASS:** Native `<button>` and `<a href>`, `<html lang="id">`, `<header>`, `<main>`, `<footer>`, unique `<title>`, zoom-friendly viewport (`width=device-width, initial-scale=1`), `cursor: pointer` verified on button (`getComputedStyle`), `:focus-visible` ring, `prefers-reduced-motion` reset rule in `globals.css`, keyboard `Tab` -> skip-link and `Enter` -> `ThemeToggle` verified in Playwright.
- **R-35 PASS:** `pnpm build` succeeded, `pnpm test:e2e` booted production `next start -p 3100`, clicked and keyboard-exercised every interactive element, and verified `consoleErrors === []` and `pageErrors === []`.
- **R-40 PASS:** No unsized media, no render-blocking head scripts, and no unmeasured Lighthouse/CWV claims reported.

---

## 5. Concise Project Tree & Next Commands

```text
.
├── .github/workflows/ci.yml
├── .editorconfig
├── .env.example
├── .gitignore
├── .nvmrc
├── .prettierignore
├── .prettierrc.json
├── AGENTS.md
├── DESIGN.md
├── README.md
├── components.json
├── content/
├── docs/
│   ├── DECISIONS.md
│   ├── ENVIRONMENT_REPORT.md
│   ├── future/               # Deferred Phase F specs (DO NOT DELETE / NOT PART OF MVP)
│   ├── plans/                # Phase 0B output target
│   ├── prompts/
│   └── research/
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── playwright.config.ts
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── public/assets/
├── sources-private/          # Local-only, git-ignored
├── src/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── theme-toggle.tsx
│   │   └── ui/button.tsx
│   ├── features/
│   ├── lib/utils.ts
│   └── styles/
├── tests/
│   ├── e2e/smoke.spec.ts
│   └── unit/smoke.test.tsx
├── tsconfig.json
└── vitest.config.mts
```

To start the local development server:

```bash
pnpm dev
```

---

## 6. Phase 0B Handoff Checklist

Before beginning [docs/prompts/01_MULTI_AGENT_IMPLEMENTATION_PLAN.md](./prompts/01_MULTI_AGENT_IMPLEMENTATION_PLAN.md):

- [x] Verify Next.js 16.4.6, React 19.3.0, TypeScript 5.9.3, Tailwind 4.3.3, shadcn/ui, ESLint 9, Prettier 3, Vitest 5, and Playwright 1.65.1 pass all baseline scripts.
- [x] Verify `DESIGN.md` tokens, `.abyss-bay` scoping, Light/Dark toggle, and accessibility primitives work in browser smoke tests.
- [x] Verify `sources-private/`, `public/**/*.pdf`, and `.env*` ignore rules protect private course files.
- [ ] Owner decides whether to supply `PROJECT_BRIEF.md` and local PDFs/notes into `sources-private/` before Phase 0B source audit (`CONTENT_AND_SOURCES.md`).
- [ ] Run Phase 0B planning prompt (`docs/prompts/01_MULTI_AGENT_IMPLEMENTATION_PLAN.md`) in planning-only mode before any MVP feature implementation.
