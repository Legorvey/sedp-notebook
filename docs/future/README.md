# docs/future: Phase F (Platform) specifications

> [!CAUTION]
> **DO NOT DELETE THIS FOLDER.** The owner is keeping these documents for later use.
> **NOT PART OF THE MVP.** Phase 0A (bootstrap), Phase 0B (planning), and MVP implementation agents must not implement, scaffold, install dependencies for, or plan MVP work from anything in this folder. Read it only to keep MVP choices compatible with it. When this folder conflicts with `docs/prompts/` or `AGENTS.md`, those win.
> Phase F starts only after the owner approves it in writing (record the approval in `docs/DECISIONS.md`).

## Origin

These documents were adapted on 2026-11-18 from the owner's **HIMA IF CMS** planning set (v3.0.0 / v2.0.0, a FastAPI + PostgreSQL + Redis blog CMS). The unmodified originals stay in git history at commit `5cbca24` (for example `git show 5cbca24:INDEX.md`).

## Shared contract (every doc in this folder must agree with this section)

### Status and gate
- Name: **SEDP Learning Hub, Phase F (Platform)**. Status: **Deferred draft, not approved.**
- Entry gate: MVP shipped as an anonymous, static-first site; owner approval recorded; domain, hosting, and backend-stack decisions made (see "Open decisions").

### What Phase F adds (and what it never changes)
| Module | Purpose |
|---|---|
| **F1 Articles** ("Catatan & Studi Kasus") | DB-backed editorial articles: case studies, cable fault write-ups, field notes. Adapted from the HIMA blog engine. |
| **F2 Provenance** | Source register and fact-check log in the DB (staff only), mirroring the file-based schema defined in `docs/plans/CONTENT_AND_SOURCES.md` during Phase 0B. |
| **F3 Learner accounts** (optional) | Opt-in progress sync and quiz-attempt history. Anonymous reading and local progress keep working without an account. |

Never changes: **lessons stay MDX in git** and remain the canonical curriculum. The DB references lessons and quizzes only by their stable content IDs (`lesson_id`, `quiz_id` from MDX frontmatter). No MVP page may depend on the API being up; public article views must show a real error state if the API fails.

### Roles (`user_role` enum)
| Role | Replaces (HIMA) | Can |
|---|---|---|
| `OWNER` | `SUPER_ADMIN` | Everything: users, taxonomy, settings, audit logs, approve and publish any article. Self-approval only via an audit-logged override. |
| `AUTHOR` | `AUTHOR` | Create and edit own articles, upload own media, submit for review. **Cannot publish directly** (HIMA "direct publishing" is removed because correctness and licensing are release blockers). |
| `REVIEWER` | new | Technical and rights review: approve or request changes on others' articles; manage sources and fact checks. Cannot approve own work. |
| `LEARNER` | new | Only own progress, quiz attempts, profile, and account deletion. No studio access. |

### Article lifecycle (`article_status` enum)
`DRAFT -> IN_REVIEW -> APPROVED -> SCHEDULED | PUBLISHED -> ARCHIVED`, plus `IN_REVIEW -> DRAFT` on "changes requested". Publishing requires: an `APPROVED` review by someone other than the author, `technical_ok = true`, `rights_ok = true`, and every attached media asset and source at `rights_status = CLEARED`. Scheduling stays worker-free (query `published_at <= now()`), as in HIMA.

### Canonical names (use exactly these)
- Enums: `user_role {OWNER, AUTHOR, REVIEWER, LEARNER}`, `article_status {DRAFT, IN_REVIEW, APPROVED, SCHEDULED, PUBLISHED, ARCHIVED}`, `review_decision {APPROVED, CHANGES_REQUESTED}`, `rights_status {UNKNOWN, PENDING, CLEARED, REJECTED}`, `source_type {OFFICIAL_MODULE, VENDOR_SLIDES, OWNER_NOTES, PUBLIC_PAPER, STANDARD, NEWS, WEBSITE, OTHER}`, `trust_level {HIGH, MEDIUM, LOW}`, `fact_check_status {UNVERIFIED, VERIFIED, DISPUTED, RETRACTED}`, `progress_status {STARTED, COMPLETED}`.
- Tables: `users`, `sessions`, `auth_audit_logs`, `article_categories`, `article_tags`, `article_tag_links`, `articles`, `article_revisions`, `article_reviews`, `media_assets`, `sources`, `article_sources`, `fact_checks`, `learner_progress`, `quiz_attempts`.
- Key columns: UUIDv4 PKs; `users.auth_epoch` (instant revocation, kept from HIMA); `articles.content_json` (TipTap AST, JSONB) + `articles.content_html` (sanitized); `media_assets.rights_status`, `license`, `attribution`, `source_id`; `sources.public_reuse_allowed` (bool), `module_code`, `page_range`; `fact_checks.lesson_id` (text, nullable) and `article_id` (nullable); `learner_progress (user_id, lesson_id)` unique; `quiz_attempts.quiz_id` (text).
- Alembic revisions: `0001_auth_core`, `0002_editorial` (taxonomy, articles, revisions, reviews, media), `0003_provenance` (sources, article_sources, fact_checks), `0004_learner` (progress, quiz attempts).
- API: base `/api/v1`; groups `/auth`, `/users`, `/categories`, `/tags`, `/articles`, `/articles/{id}/reviews`, `/media`, `/sources`, `/fact-checks`, `/me`, `/me/progress`, `/me/quiz-attempts`, `/audit-logs`. The Next.js app must never define route handlers under `/api/v1`.
- Session cookie: `__Host-sedp_session` (Secure, HttpOnly, SameSite=Lax, Path=/, no Domain).

### Stack (proposed default, confirm at the Phase F gate)
- Frontend: the existing SEDP Next.js app at the repo root (Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS 4, shadcn/ui, pnpm). Staff console at `src/app/(studio)/studio/**` (noindex, never linked from public nav). Public article routes follow `docs/plans/INFORMATION_ARCHITECTURE.md`; `/artikel/[slug]` is only a proposal.
- Backend: FastAPI + Pydantic v2 + SQLAlchemy 2.0 async + Alembic, Python 3.12+, at `services/api/`. PostgreSQL 16+. Redis 7 single instance (sessions, rate limits, cache). S3-compatible object storage via presigned URLs (Cloudflare R2 proposed).
- Infra: `infra/docker/` (compose, Nginx single-origin ingress: `/` to Next.js, `/api/v1` to FastAPI).
- Editor: TipTap, pinned to the current stable major at Phase F start (HIMA specified 2.x; re-verify). Server-side HTML sanitization with `nh3` allowlist, as in HIMA.
- Alternative kept open: Next.js Route Handlers + a TypeScript ORM (single language, no Python service). Choose at the gate and record it.

### Media and content rules
- Uploads: raster only (WebP, AVIF, PNG, JPEG), max 5 MB, max 16 MP. **SVG uploads stay forbidden** (stored XSS). Authored SVG diagrams are fine because they live in the repo as reviewed components, not uploads.
- Every media asset and source carries provenance (`source_id`, `license`, `attribution`, `rights_status`). Only `CLEARED` items may render on public pages.
- Never upload or serve raw PDFs, lecture screenshots, NEC "Internal Use Only" material, closed-course test questions, or attendee data. Source files for `sources` rows stay in private storage; the table stores references, not public URLs.

### Identity, hosting, privacy
- Domain is `[OWNER_DOMAIN]`. Do not use Telkom University, SEDP, or NEC domains or branding unless the owner has written permission. The HIMA plan's campus-server migration is removed for the same reason.
- Hosting is `[OWNER_HOSTING]` (VPS proposed; HIMA's Hostinger plan is an example, not a decision).
- Privacy: no third-party trackers; learner data minimized to email, display name, progress, attempts; self-service deletion via `DELETE /api/v1/me`; comply with Indonesia's UU PDP (UU No. 27/2022). Retention periods are proposals until the owner confirms them.

### Writing rules for these docs
- Keep each document's original language mix (Indonesian prose, English technical terms).
- Do not invent statistics, benchmarks, or compliance claims. Performance targets are labeled as targets, not measurements.
- Use `[OWNER_DECISION]`, `[OWNER_DOMAIN]`, `[OWNER_HOSTING]` for unresolved values instead of guessing.

### Open decisions (owner)
1. Approve Phase F at all, and which modules (F1, F2, F3).
2. Backend stack: FastAPI service (default) or Next.js-native.
3. Domain and hosting.
4. Data retention periods.
5. Whether `OWNER` self-approval override is allowed.

## Files
See [INDEX.md](./INDEX.md) for the catalog.
