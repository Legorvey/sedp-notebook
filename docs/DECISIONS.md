# Architectural & Environment Decisions: SEDP Learning Hub

Log of verified Phase 0A decisions, constraints, and deferred boundaries.

---

## ADR-001: Node.js Runtime Pinning (`.nvmrc` vs `engines` vs CI)

- **Date:** 2026-11-18 (Updated 2026-11-19 for M0 Node parity and M1 `jsdom` resolution)
- **Status:** Accepted (Phase 0A, reconciled M0, resolved M1)
- **Context:** The local Windows workstation runs Node `v22.16.0` (Maintenance LTS). In November 2026, Node 26 is Active LTS, Node 24 is Maintenance LTS, and Vitest `5.1.0` requires `^22.12 || ^24 || >=26`. Previously, `jsdom@31.0.1` (`^22.22.2 || ^24.15.0 || >=26.0.0`) and its transitive dependencies `w3c-xmlserializer@6.0.0` / `undici@8.12.4` (`>=22.19.0`) emitted `EBADENGINE` warnings on Node `22.16.0`.
- **Decision:**
  - Pin `"engines": { "node": "^22.12.0 || ^24.0.0 || >=26.0.0" }` in [package.json](../package.json) matching Vitest 5's supported major/minor lines while keeping local Node `22.16.0`, Node `24`, and Node `26` supported.
  - Pin `"jsdom": "^28.1.0"` (`engines.node: "^20.19.0 || ^22.12.0 || >=24.0.0"`, with `undici@^7.21.0` `>=20.18.1`), which `vitest@5.1.0` (`peerDependencies: { jsdom: "*" }`) supports directly across Node `22.16.0`, `24`, and `26`.
  - Keep [.nvmrc](../.nvmrc) at `22.16.0` to match the verified local runtime.
  - Run [.github/workflows/ci.yml](../.github/workflows/ci.yml) as a matrix across `["22.16.0", "26"]` so both exact local parity and Node 26 Active LTS are continuously verified.
- **Consequences:** Local `pnpm install` runs on Node `22.16.0` with **zero `EBADENGINE` warnings** and passes `pnpm audit --audit-level=high` (`0` high/critical advisories), while Vitest unit tests and builds remain compatible across both Node `22.16.0` and CI Node `26`.

## ADR-002: Package Manager Installation & pnpm 12 `allowBuilds` Policy

- **Date:** 2026-11-18 (Updated 2026-11-19 for M0 `tsx` / `esbuild`)
- **Status:** Accepted (Phase 0A, updated M0)
- **Context:** `pnpm` was not installed initially (`corepack 0.32.0` was present, though Corepack is no longer bundled starting Node 25). pnpm 12 enforces `strictDepBuilds: true` via `allowBuilds:` in [pnpm-workspace.yaml](../pnpm-workspace.yaml). Installing `tsx@4.23.15` for M0 validation scripts adds `esbuild@0.28.2`, which requires its postinstall native binary setup.
- **Decision:** Install `pnpm` globally via `npm install -g pnpm@12` (`pnpm@12.21.0`), pin `"packageManager": "pnpm@12.21.0"` as an exact semver in [package.json](../package.json), and keep explicit per-package `allowBuilds` (`esbuild: true`, `sharp: false`, `unrs-resolver: false`) in [pnpm-workspace.yaml](../pnpm-workspace.yaml).
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
  - **Milestone M0 Remediation Addendum (Completed 2026-11-19):** Phase 0A UI/a11y baseline gaps were resolved cleanly: `src/app/globals.css` (`@custom-variant dark` includes `.dark` and `.abyss-bay`, `:where(...)` low-specificity cursor selectors so `:disabled` / `[aria-disabled="true"]` keeps `cursor: not-allowed`, `.skip-link` zoom-safe off-screen transform + `min-height: 44px`, `scroll-padding-top`, `.katex-display` overflow styling); `src/components/ui/button.tsx` (`whitespace-normal`, `rounded-md`, `>= 44x44px` variants, `border-input` outline, opaque hover/destructive variants, solid `:focus-visible` outline, click/keyboard guards for `aria-disabled`); `src/components/theme-toggle.tsx` + `src/app/layout.tsx` (`try/catch` `sedp.theme` persistence via `useSyncExternalStore`, `suppressHydrationWarning`, pre-paint `<head>` script, WCAG 2.5.3 Label-in-Name toggle naming); and `package.json` (`shadcn` moved to `devDependencies`).

## ADR-005: Separate Vitest 5 & Playwright Suites

- **Date:** 2026-11-18 (Updated 2026-11-19 for M0 static-export CSP serving)
- **Status:** Accepted (Phase 0A, updated M0)
- **Context:** Vitest 5 (`5.1.0`) requires `vite` (`8.3.8`) as a non-optional peer and does not support async React Server Components; Vitest's default glob also matches Playwright `*.spec.ts` files unless isolated.
- **Decision:** Keep unit/client component tests in `tests/unit/` ([vitest.config.mts](../vitest.config.mts) using Vite 8 native `resolve: { tsconfigPaths: true }` + `@testing-library/jest-dom` setup, excluding `tests/e2e/**`, run via `"vitest run"`) and end-to-end / Async RSC / accessibility / HTTP CSP checks in `tests/e2e/` ([playwright.config.ts](../playwright.config.ts) running against freshly built static export `out/` via `node scripts/serve-export-with-csp.mjs --port 3100` with `reuseExistingServer: false` across `chromium` Desktop and `mobile-touch` projects).

## ADR-006: Deferred Phase F (`docs/future/`) Boundary

- **Date:** 2026-11-18
- **Status:** Deferred (Not Approved for MVP)
- **Context:** [docs/future/](../docs/future/README.md) holds adapted planning specs for an optional Phase F platform (FastAPI, PostgreSQL, Redis, auth, learner accounts).
- **Decision:** Phase F is **NOT PART OF THE MVP** and remains unapproved until explicit owner sign-off is recorded here. Phase 0A installed zero backend/database/auth dependencies and reserved `/api/v1` without creating route handlers.

## ADR-007: Phase 0B Proposed Architecture & Owner Milestone M0 Sign-Off

- **Date:** 2026-11-18 (Updated 2026-11-19 with owner M0 authorization)
- **Status:** Approved Baseline for Milestone M0
- **Context:** Phase 0B multi-agent planning (`docs/plans/*.md`) synthesized curriculum, provenance, engineering simulation, UX, accessibility, and Next.js 16 deployment specifications.
- **Confirmed M0 Policy Baseline (Owner Decisions):**
  1. Permitted Module `1.1`, `1.2`, and `1.3` PDFs staged in git-ignored `sources-private/`; quarantined `NEC Advances in Subsea Cable System  Deployment.pdf` remains unopened and untouched in archival protection (`scripts/verify-assets.ts` explicitly flags its local presence in root until the owner relocates it outside the repository). Missing Day 3 (`Catatan SEDP-1.pdf`) and Module `1.4` remain non-blocking.
  2. `SEDP Learning Hub` remains the provisional working title paired with clear independent/non-affiliation notices in public UI; final public brand review remains open before public launch.
  3. Pelagic Light default theme, original React `<svg>` schematics, anonymous resettable local progress (`sedp.progress.v1` in M1+), and validated non-PII simulator parameters confirmed; `ADR-006` deferred Phase F remains unapproved.

## ADR-008: Milestone M0 Deployment Proof-of-Concept Result (Option B Approved)

- **Date:** 2026-11-19
- **Status:** Verified in M0 PoC (`next.config.ts` Option B Static Export)
- **Context:** Owner authorized testing static export (`output: "export"`) with CSP script hashes first (`Option B`), keeping dynamic Next.js Node server nonces (`proxy.ts`, `Option A`) strictly as a documented fallback if Option B proved blocked.
- **Empirical M0 PoC Measurements (`pnpm build && pnpm csp:hashes && pnpm test:e2e`):**
  - Static export (`output: "export"`, `trailingSlash: true`) compiles `/`, `/poc-m0/`, and `/404.html` cleanly under Turbopack (`next@16.4.6`), bundling self-hosted `next/font` `.woff2` files, `katex/dist/katex.min.css`, KaTeX `.woff2` fonts, `@mdx-js/mdx@3.1.1` + `remark-math@6.0.0` + `rehype-katex@7.0.1` (`trust: false, strict: true`), and React 19 interactive client islands with zero external network requests.
  - `scripts/generate-csp-hashes.mjs` writes `.csp-manifest.json` outside `out/` covering 5 exported HTML files (`4` verified inline scripts per route: `THEME_INIT_SCRIPT`, Turbopack chunk push, and `self.__next_f` Flight payload). Measured header sizes: **`463` bytes max per route** and **`571` bytes total aggregate** across M0 (`6` unique script hashes).
  - Under enforced HTTP headers (`script-src 'self' 'sha256-...'` with zero `'unsafe-inline'`/`'unsafe-eval'`, `frame-ancestors 'none'`, `font-src 'self'`, `object-src 'none'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`), all Chromium Desktop and Mobile Touch Playwright checks pass with zero console errors, zero `securitypolicyviolation` events across hard reloads, pre-paint `sedp.theme` persistence, keyboard navigation, and zero `@axe-core/playwright` (`wcag22aa`) violations.
- **Decision & Future Hosting Constraint:** Adopt **Option B (`output: "export"`)** for MVP milestones (`M1+`) without pre-selecting a specific hosting provider (`[OWNER_HOSTING]` remains an explicit owner choice). Because each exported route embeds a build-specific `self.__next_f.push(...)` payload hash (~54 bytes), future static-host configuration generated from `.csp-manifest.json` must separately track:
  1. **Per-line header character cap** (e.g., max `2,000` characters per `_headers` line for hosts using flat `_headers` files such as Cloudflare Pages), evaluated per route (`maxRouteHeaderLineChars`), which is distinct from `aggregateHeaderBytes` across all site routes combined.
  2. **Total rule-count cap** (e.g., max `100` header rules on flat `_headers` files), evaluated against `routeCount` + static asset rules.
     Once total static routes approach host rule limits (or if `[OWNER_HOSTING]` cannot attach per-route HTTP headers programmatically via CDN/reverse-proxy adapters), deploy either a programmatic per-route header adapter consuming `.csp-manifest.json` or Option A (`proxy.ts` per-request nonces) as fallback.
