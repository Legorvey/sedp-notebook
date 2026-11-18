# Project Structure & Repository Layout: SEDP Learning Hub (Phase F)

> [!CAUTION]
> **DO NOT DELETE.** Kept by the owner for future use. **NOT PART OF THE MVP**: do not implement or plan MVP work from this file until the owner approves Phase F (see [README.md](./README.md)). If this file conflicts with `docs/prompts/` or `AGENTS.md`, those win.

| Field | Detail |
|---|---|
| **System** | SEDP Learning Hub, Phase F (Platform) |
| **Document Version** | 4.0.0-sedp |
| **Date** | 2026-11-18 |
| **Status** | Deferred draft, not approved |
| **Repository Layout** | Root Next.js 16 App (MVP + Phase F UI) + `services/api/` (FastAPI Default) + `infra/docker/` |
| **Frontend Runtime** | Node.js 26 Active LTS (Node 24 & 22 Maintenance LTS didukung), pnpm 12 (`allowBuilds` di `pnpm-workspace.yaml`), Next.js 16.4.x (App Router, Turbopack default, `next lint` dihapus), React 19, Tailwind CSS 4 |
| **Backend Runtime (Default)** | Python 3.12+ (FastAPI, Pydantic v2, SQLAlchemy 2.0 Async, Alembic, Rust `nh3`; alternatif Next.js-native via `[OWNER_DECISION]`) |

---

## Riwayat Revisi (Revision History)

| Versi | Tanggal | Penulis / Reviewer | Bagian yang Diubah | Rincian Perubahan (Sebelum vs Sesudah) | Alasan Perubahan |
|---|---|---|---|---|---|
| 1.0.0 | 2026-10-13 | Staff Ahli Divisi MIK | Dokumen Baru | Draf awal struktur repositori monorepo dual-engine. | Inisiasi arsitektur berkas monorepo. |
| 1.1.0 | 14 Oktober 2026 | Staff Ahli MIK & Auditor | Task & Redis | Penambahan cleanup tasks, 3 instance Redis, enkripsi PIN. | Mitigasi audit keamanan v2.0.0. |
| 1.2.0 | 14 Oktober 2026 | Staff Ahli MIK & Architect | Harmonization | Penyelarasan env S3/R2, perintah reencrypt-pins, standardisasi broker. | Eliminasi ambiguitas konfigurasi. |
| 2.0.0 | 2026-10-23 | Staff Ahli MIK & Antigravity Lead | Seluruh Dokumen | **Sebelum:** Direktori Celery worker/tasks, modul formulir dinamis & interview booking, segregasi 3 instance Redis.<br>**Sesudah:** Eliminasi seluruh komponen formulir & Celery tasks, adopsi struktur murni Blog CMS sekelas WordPress, penyatuan 1 instance Redis di Docker Compose, perapian TipTap components di frontend, dan standarisasi konfigurasi deployment bertahap (Hostinger $\to$ Kampus Tel-U). | Pivot arsitektur WordPress-like Blog CMS, penyederhanaan tumpukan teknologi, dan portabilitas deploy. |
| 4.0.0-sedp | 2026-11-18 | Phase F Adaptation | Seluruh Dokumen | **Sebelum (HIMA IF CMS v2.0.0):** Layout terpisah `/frontend` + `/backend` + `/docker`, Next.js 15, Tailwind 3.4.x (`tailwind.config.ts`), Node 22, rute `/blog` & `/(admin)`, migrasi Alembic `001`/`002`, role `SUPER_ADMIN` + *direct publishing*, orkestrasi Hostinger -> Kampus.<br>**Sesudah (SEDP Learning Hub Phase F 4.0.0-sedp):** Mengadopsi struktur repositori pasca-Phase 0A berpusat pada aplikasi Next.js 16.4.x di root (`src/app`, `src/components`, `src/features`, `src/lib`, `src/styles`, `content/`, `public/assets/`, `docs/prompts/`, `docs/plans/`, `docs/research/`, `docs/future/`, `sources-private/` git-ignored) ditambah ekstensi Phase F (`src/app/(studio)/studio/**`, `src/app/api/internal/revalidate/route.ts`, `src/features/studio/`, `src/features/articles/`, `services/api/**`, `infra/docker/**`, `pnpm-workspace.yaml` dengan `allowBuilds`), migrasi Alembic 4 revisi kanonik (`0001_auth_core` s.d. `0004_learner`), 15 tabel kontrak bersama (+ tabel bantu `email_verification_tokens` di `DATABASE_SCHEMA.md`) & 8 enum kanonik, pembaruan runtime (Node 26 Active LTS / 24 / 22 LTS, pnpm 12, Python 3.12+), serta orkestrasi Docker hosting-agnostic untuk `[OWNER_HOSTING]` / `[OWNER_DOMAIN]`. | Menyelaraskan tata letak repositori dengan baseline Phase 0A SEDP Learning Hub serta kontrak bersama Phase F di [README.md](./README.md) tanpa mengubah ruang lingkup MVP. |

---

## 1. Root Repository Overview (Baseline Phase 0A + Ekstensi Phase F)

Repositori SEDP Learning Hub berpusat pada **aplikasi Next.js 16 App Router di root repositori** (terbentuk sejak Phase 0A untuk situs edukasi statis/MDX MVP). Saat owner menyetujui gerbang Phase F, platform diperluas secara aditif dengan fitur UI di `src/`, layanan API di `services/api/` (apabila memilih stack default FastAPI), dan konfigurasi deployment di `infra/docker/`.

Label pada pohon direktori berikut memisahkan secara tegas berkas baseline MVP dengan tambahan Phase F:
- **`[Phase 0A / MVP]`**: Ada atau direncanakan untuk MVP anonim *static-first*; harus tetap berjalan meskipun layanan Phase F tidak aktif.
- **`[Phase F]`**: Ditunda (*deferred*). Jangan dibuat, diinstal dependensinya, atau diaktifkan sebelum persetujuan tertulis owner.

```text
sedp-learning-hub/
├── .github/
│   └── workflows/
│       ├── ci.yml                  # [Phase 0A / MVP] Lint (ESLint CLI), typecheck, unit, build, E2E
│       └── phase-f-api-ci.yml      # [Phase F] Pytest, Ruff/Mypy, Alembic migration check (jika FastAPI dipilih)
├── content/                        # [Phase 0A / MVP] Kurikulum kanonik MDX di git (stable lesson_id & quiz_id),
│                                   # glosarium, lini masa, & bank kuis orisinal
├── public/
│   └── assets/                     # [Phase 0A / MVP] Aset statis terpublikasi & diagram SVG terkurasi (TANPA PDF mentah)
├── docs/
│   ├── prompts/                    # [Phase 0A / MVP] Prompt fase eksekusi (00_BOOTSTRAP_ENVIRONMENT, 01_MULTI_AGENT_...)
│   ├── plans/                      # [Phase 0B / MVP] Spesifikasi arsitektur, IA, UX, simulasi, & CONTENT_AND_SOURCES.md
│   ├── research/                   # [Phase 0A / MVP] Catatan riset sumber terbuka & verifikasi teknis
│   ├── future/                     # [Deferred] Kumpulan spesifikasi Phase F (dokumen ini & kontrak README.md)
│   ├── DECISIONS.md                # [Phase 0A / MVP] ADR & log persetujuan gerbang Phase F
│   └── ENVIRONMENT_REPORT.md       # [Phase 0A / MVP] Laporan versi runtime & hasil uji baseline
├── sources-private/                # [Phase 0A / MVP] GIT-IGNORED! Materi sumber mentah, PDF tertutup, catatan privat
├── src/
│   ├── app/                        # [Phase 0A / MVP + Phase F] Next.js 16.4.x App Router di root
│   ├── components/                 # [Phase 0A / MVP] Primitif shadcn/ui, shell layout, komponen diagram SVG aman
│   ├── features/                   # [Phase 0A / MVP + Phase F] Modul fitur (lessons/simulators + studio/articles)
│   ├── lib/                        # [Phase 0A / MVP + Phase F] Utilitas, parser MDX, & API client Phase F
│   └── styles/                     # [Phase 0A / MVP] Tailwind CSS 4 CSS-first (@import "tailwindcss", @theme tokens)
├── services/                       # [Phase F] Layanan backend terpisah (hanya jika Opsi A FastAPI dipilih)
│   └── api/                        # [Phase F] FastAPI + Pydantic v2 + SQLAlchemy 2.0 Async + Alembic + nh3
├── infra/                          # [Phase F] Infrastruktur kontainerisasi & reverse proxy single-origin
│   └── docker/                     # [Phase F] Nginx, docker-compose.yml, docker-compose.prod.yml, Dockerfiles
├── .editorconfig                   # [Phase 0A / MVP]
├── .env.example                    # [Phase 0A / MVP + Phase F vars terdokumentasi tanpa kredensial nyata]
├── .gitignore                      # [Phase 0A / MVP] Wajib mengecualikan sources-private/, *.pdf mentah, .env*, build
├── .nvmrc                          # [Phase 0A / MVP] Pin versi LTS Node yang didukung (target Node 26 Active LTS / 24 LTS)
├── AGENTS.md                       # [Phase 0A / MVP] Aturan agen & batasan domain
├── package.json                    # [Phase 0A / MVP] Root Next.js 16.4.x, React 19, Tailwind 4, Vitest, Playwright
├── pnpm-workspace.yaml             # [Phase 0A / MVP + Phase F] Konfigurasi pnpm 12 termasuk allowBuilds
├── tsconfig.json                   # [Phase 0A / MVP] TypeScript strict + alias @/*
└── README.md                       # [Phase 0A / MVP]
```

### Persyaratan Runtime & Konfigurasi Workspace (`pnpm 12`)

| Komponen | Spesifikasi / Versi | Catatan Implementasi |
|---|---|---|
| **Node.js** | **Node 26 Active LTS** (Node 24 Maintenance LTS & Node 22 Maintenance LTS tetap didukung) | Catat versi aktif pada `.nvmrc` dan `engines` di `package.json`. |
| **Package Manager** | **pnpm 12** (package manager tunggal) | Menggunakan `pnpm-workspace.yaml` dengan peta `allowBuilds` untuk mengontrol dependensi yang diizinkan menjalankan lifecycle build script. |
| **Next.js & React** | **Next.js 16.4.x stable** + **React 19** + **TypeScript (strict)** | **Turbopack adalah bundler default**. Perintah `next lint` telah dihapus pada Next.js 16; script `"lint"` pada `package.json` memanggil ESLint CLI secara langsung (`eslint .`). |
| **Styling** | **Tailwind CSS 4** + **shadcn/ui** | Konfigurasi CSS-first di `src/styles/` (`@import "tailwindcss";` dan `@theme`); tidak memerlukan `tailwind.config.ts` terpisah. |
| **Backend (Default Phase F)** | **Python 3.12+** | Digunakan di `services/api/` jika `[OWNER_DECISION]` mengonfirmasi arsitektur FastAPI. Paket Python dipin ke versi stabil saat Phase F dimulai. |

Contoh konfigurasi `pnpm-workspace.yaml` untuk pnpm 12 (daftar paket di `allowBuilds` disesuaikan lewat `pnpm approve-builds` saat dependensi dipasang):

```yaml
# pnpm-workspace.yaml
packages:
  - "."

# pnpm 12: daftar eksplisit dependensi yang diizinkan menjalankan build scripts
allowBuilds:
  esbuild: true
  sharp: true
```

Contoh pengaman wajib di `.gitignore` agar materi privat tidak pernah terbawa ke repositori publik:

```gitignore
# Materi sumber privat & dokumen mentah (WAJIB tidak tercommit dan tidak boleh di public/)
sources-private/
*.pdf
.env
.env.*
!.env.example
```

---

## 2. Struktur Aplikasi Root Next.js 16 (`src/`, `content/`, `public/assets/`)

Struktur berikut memadukan fondasi MVP pasca-Phase 0A dengan tambahan rute dan fitur Phase F. Perhatikan aturan kontrak bahwa **aplikasi Next.js tidak boleh memiliki Route Handler di bawah `src/app/api/v1/**`** apabila stack default FastAPI digunakan. Satu-satunya Route Handler Next.js pada arsitektur default adalah rute internal `src/app/api/internal/revalidate/route.ts` (bukan di bawah `/api/v1`), yang diblokir pada ingress eksternal Nginx (`location ^~ /api/internal/ { deny all; return 404; }`) dan hanya dijangkau `sedp_api` via jaringan internal Docker (`http://sedp_web:3000/api/internal/revalidate`).

```text
src/
├── app/
│   ├── layout.tsx                        # [MVP] Root layout, metadata global, font, Immersive Ocean theme
│   ├── page.tsx                          # [MVP] Beranda edukasi publik
│   ├── (mvp-routes...)/                  # [MVP] Rute kurikulum statis/MDX, simulator, glosarium, kuis lokal,
│   │                                     # tentang & disclaimer (mengikuti docs/plans/INFORMATION_ARCHITECTURE.md;
│   │                                     # nol ketergantungan pada API backend)
│   ├── artikel/                          # [Phase F - F1] Rute publik artikel "Catatan & Studi Kasus"
│   │   │                                 # (Catatan: path mengikuti docs/plans/INFORMATION_ARCHITECTURE.md;
│   │   │                                 # /artikel/[slug] adalah proposal sementara hingga dikonfirmasi)
│   │   ├── page.tsx                      # Arsip artikel PUBLISHED & filter kategori/tag (real error state jika API gagal)
│   │   └── [slug]/page.tsx               # Detail artikel: render content_html tersanitasi + atribusi CLEARED
│   ├── (auth)/                           # [Phase F] Rute autentikasi
│   │   ├── login/page.tsx                # Login email/username + Argon2id -> __Host-sedp_session
│   │   └── change-password/page.tsx      # Paksa ganti password awal (must_change_password = true)
│   ├── (learner)/                        # [Phase F - F3 Opsional] Rute akun pembelajar opt-in
│   │   └── profile/page.tsx              # Sinkronisasi progress, riwayat quiz_attempts, & hapus akun (DELETE /api/v1/me)
│   ├── (studio)/                         # [Phase F] Route Group Staff Console (TIDAK ditautkan dari navigasi publik)
│   │   └── studio/
│   │       ├── layout.tsx                # Layout Studio, metadata robots noindex/nofollow, session & role guard
│   │       │                             # (izinkan OWNER, AUTHOR, REVIEWER; tolak LEARNER)
│   │       ├── page.tsx                  # Dashboard Studio (ringkasan draf, antrean IN_REVIEW, status cek fakta)
│   │       ├── articles/
│   │       │   ├── page.tsx              # Daftar artikel & filter status (DRAFT, IN_REVIEW, APPROVED, SCHEDULED, PUBLISHED, ARCHIVED)
│   │       │   ├── new/page.tsx          # Editor artikel baru (TipTap WYSIWYG)
│   │       │   ├── [id]/edit/page.tsx    # Sunting artikel, tautan sources, & riwayat article_revisions
│   │       │   └── [id]/review/page.tsx  # [REVIEWER / OWNER] Form article_reviews (technical_ok, rights_ok, decision)
│   │       ├── categories/page.tsx       # [OWNER] Manajemen article_categories
│   │       ├── tags/page.tsx             # [OWNER / AUTHOR / REVIEWER] Manajemen article_tags
│   │       ├── media/page.tsx            # Media Library: upload raster <= 5MB & <= 16MP (tanpa SVG) + metadata provenance
│   │       ├── sources/page.tsx          # [Phase F - F2] Daftar sumber staff-only (sources)
│   │       ├── fact-checks/page.tsx      # [Phase F - F2] Log cek fakta (fact_checks) per lesson_id / article_id
│   │       ├── users/page.tsx            # [OWNER] Manajemen akun OWNER, AUTHOR, REVIEWER, LEARNER
│   │       └── audit-logs/page.tsx       # [OWNER] Jejak audit auth_audit_logs
│   ├── api/                              # [Phase F] Khusus rute internal (TIDAK ada route di bawah /api/v1/)
│   │   └── internal/
│   │       └── revalidate/
│   │           └── route.ts              # [Phase F] Revalidasi internal on-demand; diblokir di ingress eksternal Nginx
│   │                                     # (deny all; return 404;) & dipanggil sedp_api via jaringan internal Docker
│   ├── sitemap.ts                        # [MVP + Phase F] Hanya URL publik (studio & API dikecualikan)
│   └── robots.ts                         # [MVP + Phase F] Disallow /studio dan /api/v1
├── components/
│   ├── ui/                               # [MVP] Komponen primitif shadcn/ui
│   ├── layout/                           # [MVP] Header, footer, navigasi publik (tidak pernah menautkan /studio)
│   └── diagrams/                         # [MVP] Diagram SVG teknis authored di repo (aman, bukan user upload)
├── features/
│   ├── lessons/                          # [MVP] Pembaca kurikulum MDX (content/) dengan stable lesson_id
│   ├── simulators/                       # [MVP] Simulator interaktif teknik kabel laut
│   ├── glossary/                         # [MVP] Glosarium istilah & alias
│   ├── quizzes/                          # [MVP] Bank kuis orisinal & penyimpanan progres lokal anonim
│   ├── articles/                         # [Phase F - F1] UI artikel publik
│   │   ├── components/
│   │   │   ├── article-card.tsx          # Kartu ringkasan artikel publik
│   │   │   ├── article-reader.tsx        # Renderer aman HTML terkompilasi (content_html) & metadata atribusi
│   │   │   ├── provenance-footer.tsx     # Sitasi publik hanya untuk sumber/media CLEARED
│   │   │   └── api-error-state.tsx       # Error state eksplisit saat /api/v1 tidak terjangkau
│   │   └── hooks/
│   ├── studio/                           # [Phase F] UI internal staf (F1 editor/review + F2 provenance)
│   │   ├── editor/
│   │   │   ├── tiptap-editor.tsx         # Editor TipTap (pin current stable at Phase F start) -> AST content_json
│   │   │   ├── toolbar.tsx               # Kontrol format teks, tabel, sitasi artikel
│   │   │   └── media-picker-dialog.tsx   # Pilih / unggah raster via presigned URL (path relatif /storage/public/{id}.webp)
│   │   ├── reviews/
│   │   │   └── review-checklist-form.tsx # Penilaian technical_ok, rights_ok, dan review_decision
│   │   ├── provenance/
│   │   │   ├── source-register-table.tsx # Pengelolaan sources (source_type, trust_level, public_reuse_allowed, module_code, page_range)
│   │   │   └── fact-check-panel.tsx      # Pengelolaan fact_checks untuk lesson_id atau article_id
│   │   └── auth/
│   │       └── auth-store.ts             # State sesi in-memory klien (tanpa menyimpan token sensitif di localStorage)
│   └── learner/                          # [Phase F - F3 Opsional] Adapter opt-in sinkronisasi progres & quiz_attempts
├── lib/
│   ├── mdx/                              # [MVP] Loader & validator frontmatter MDX di content/
│   ├── api-client.ts                     # [Phase F] Fetch wrapper relative base '/api/v1', credentials: 'include', header X-Requested-With
│   ├── seo.ts                            # [MVP + Phase F] Helper metadata & reading time
│   └── utils.ts                          # [MVP] Helper class merging & format lokal
└── styles/
    └── globals.css                       # [MVP] Entrypoint Tailwind CSS 4 (@import "tailwindcss"; @theme ocean tokens)
```

---

## 3. Struktur Direktori Backend Default (`services/api/`)

Direktori `services/api/` hanya diinisialisasi setelah Phase F disetujui dengan arsitektur default **Python 3.12+ + FastAPI**. (Apabila `[OWNER_DECISION]` memilih alternatif Next.js-native Route Handlers, direktori `services/api/` ditiadakan dan kontrak `/api/v1` dipindahkan ke aplikasi TypeScript).

Seluruh nama tabel, enum, kolom, grup endpoint, dan revisi migrasi Alembic mengikuti kontrak bersama pada [README.md](./README.md):

```text
services/
└── api/
    ├── alembic/
    │   ├── versions/                     # 4 revisi migrasi Alembic kanonik berurutan
    │   │   ├── 0001_auth_core.py         # users (auth_epoch, email_verified_at), sessions, email_verification_tokens,
    │   │   │                             # auth_audit_logs, user_role enum
    │   │   ├── 0002_editorial.py         # article_categories, article_tags, article_tag_links, articles,
    │   │   │                             # article_revisions, article_reviews, media_assets, article_status,
    │   │   │                             # review_decision, rights_status
    │   │   ├── 0003_provenance.py        # sources, article_sources, fact_checks, source_type, trust_level, fact_check_status
    │   │   └── 0004_learner.py           # learner_progress (user_id, lesson_id unique), quiz_attempts (quiz_id), progress_status
    │   └── env.py
    ├── app/
    │   ├── api/
    │   │   └── v1/
    │   │       ├── router.py             # Aggregator seluruh grup /api/v1
    │   │       └── endpoints/
    │   │           ├── auth.py           # /auth: login, logout, me, change-password
    │   │           ├── users.py          # /users: manajemen akun 4 role (OWNER only)
    │   │           ├── categories.py     # /categories: CRUD taksonomi artikel
    │   │           ├── tags.py           # /tags: pencarian & pembuatan tag
    │   │           ├── articles.py       # /articles: CRUD, submit IN_REVIEW, schedule/publish (review-gated), archive, revisions
    │   │           ├── reviews.py        # /articles/{id}/reviews: submit APPROVED / CHANGES_REQUESTED (anti self-review)
    │   │           ├── media.py          # /media: presigned URL S3, confirm-upload, GET /{id}/preview, PATCH /{id}/rights
    │   │           │                     # (raster -> WebP /storage/public/{id}.webp, <= 5MB, <= 16MP, no SVG, provenance)
    │   │           ├── sources.py        # /sources: F2 source register (staff-only, tanpa URL publik file tertutup)
    │   │           ├── fact_checks.py    # /fact-checks: F2 verifikasi klaim per lesson_id / article_id
    │   │           ├── me.py             # /me, /me/progress, /me/quiz-attempts, DELETE /me (F3 learner self-service)
    │   │           └── audit_logs.py     # /audit-logs: jejak keamanan (OWNER only)
    │   ├── core/
    │   │   ├── config.py                 # Pydantic BaseSettings (.env loader)
    │   │   ├── security.py               # Argon2id hashing (parameter OWASP) & generator session token CSPRNG 256-bit
    │   │   ├── auth_cookie.py            # Penerbitan & hapus cookie __Host-sedp_session (Domain=None, HttpOnly, Secure, SameSite=Lax)
    │   │   ├── sanitizer.py              # Rust nh3 allowlist HTML sanitizer (kompilasi content_json -> content_html)
    │   │   ├── csrf_guard.py             # Validasi Sec-Fetch-Site, origin whitelist, & header X-Requested-With
    │   │   ├── rbac.py                   # Dependency guard 4 role + anti-IDOR/BOLA ownership checks
    │   │   └── rate_limit.py             # Redis atomic rate limiter
    │   ├── db/
    │   │   ├── session.py                # SQLAlchemy 2.0 async engine (asyncpg)
    │   │   ├── base.py                   # Declarative Base dengan UUIDv4 PK convention
    │   │   └── seed.py                   # Seeder akun OWNER awal (must_change_password = true) & kategori awal
    │   ├── models/                       # SQLAlchemy ORM (15 tabel kanonik + tabel bantu email_verification_tokens
    │   │   │                             # pada 0001_auth_core di DATABASE_SCHEMA.md, & 8 enum)
    │   │   ├── enums.py                  # user_role, article_status, review_decision, rights_status,
    │   │   │                             # source_type, trust_level, fact_check_status, progress_status
    │   │   ├── user.py                   # users (auth_epoch, email_verified_at), sessions, email_verification_tokens,
    │   │   │                             # auth_audit_logs
    │   │   ├── taxonomy.py               # article_categories, article_tags, article_tag_links
    │   │   ├── article.py                # articles (content_json, content_html), article_revisions, article_reviews
    │   │   ├── media.py                  # media_assets (rights_status, license, attribution, source_id)
    │   │   ├── provenance.py             # sources (public_reuse_allowed, module_code, page_range), article_sources, fact_checks
    │   │   └── learner.py                # learner_progress, quiz_attempts
    │   ├── schemas/                      # Pydantic v2 request/response DTOs
    │   └── services/
    │       ├── article_service.py        # Transisi siklus hidup & penegakan prasyarat review + semua media/sources CLEARED
    │       ├── media_service.py          # Signature S3v4 presigned URL, inspeksi magic-bytes / batas 16 MP (anti-decompression bomb),
    │       │                             # & re-encode WebP (/storage/public/{id}.webp)
    │       ├── session_service.py        # Redis cache + invalidasi instan berbasis users.auth_epoch
    │       ├── provenance_service.py     # Konsistensi sources, article_sources, & fact_checks
    │       └── learner_service.py        # Sinkronisasi opt-in progres & penghapusan akun DELETE /api/v1/me
    ├── tests/                            # Pytest unit & integration tests (RBAC, anti-IDOR, review gate, nh3, SVG/16MP guard)
    ├── pyproject.toml                    # Dependensi Python 3.12+ (pin current stable at Phase F start)
    └── main.py                           # FastAPI ASGI entrypoint
```

---

## 4. Orkestrasi Container & Infrastruktur (`infra/docker/`)

Konfigurasi kontainerisasi diletakkan di `infra/docker/` sehingga pengembangan MVP sebelum Phase F tetap bersih dari berkas deployment backend.

```text
infra/
└── docker/
    ├── nginx/
    │   ├── conf.d/
    │   │   └── default.conf              # Reverse proxy single-origin [OWNER_DOMAIN], media proxy cache, rate limits
    │   └── ssl/                          # Mount sertifikat lokal / ACME Webroot (jangan commit private key)
    ├── docker-compose.yml                # Orkestrasi pengembangan lokal Phase F
    ├── docker-compose.prod.yml           # Orkestrasi produksi hosting-agnostic untuk [OWNER_HOSTING]
    ├── Dockerfile.web                    # Multi-stage Next.js 16.4.x (Node 26 Active LTS + pnpm 12)
    └── Dockerfile.api                    # Multi-stage FastAPI (Python 3.12+)
```

### 4.1 Spesifikasi Layanan (`infra/docker/docker-compose.prod.yml`)

> [!NOTE]
> Tag image container dan batas alokasi CPU/RAM di bawah ini bersifat **template konfigurasi awal (target desain)** untuk lingkungan `[OWNER_HOSTING]`. Saat Phase F dimulai, pin seluruh base image ke versi stabil terkini (atau digest SHA256) dan sesuaikan batas resource berdasarkan hasil profiling nyata.

```yaml
# infra/docker/docker-compose.prod.yml
# Jalankan dari root repo: docker compose -f infra/docker/docker-compose.prod.yml up -d

networks:
  sedp-public:
    driver: bridge
  sedp-internal:
    driver: bridge

volumes:
  postgres_data:
  nginx_media_cache:
  certbot_www:
  certbot_conf:

services:
  # 1. Single-Origin Reverse Proxy & Ingress
  nginx:
    image: nginx:alpine # Pin tag minor/digest stabil saat Phase F dimulai
    container_name: sedp_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - nginx_media_cache:/var/cache/nginx/media_assets
      - certbot_www:/var/www/certbot:ro
      - certbot_conf:/etc/letsencrypt:ro
    networks:
      - sedp-public
      - sedp-internal
    depends_on:
      - web
      - api

  # 2. Root Next.js 16.4.x App (Halaman Statis/MDX MVP + F1 Public + Studio)
  web:
    build:
      context: ../..
      dockerfile: infra/docker/Dockerfile.web
    container_name: sedp_web
    restart: unless-stopped
    environment:
      - PORT=3000
      - NODE_ENV=production
      - INTERNAL_API_URL=http://api:8000/api/v1
    networks:
      - sedp-internal
    deploy:
      resources:
        limits: { cpus: "1.00", memory: "512M" }       # Target alokasi awal, sesuaikan [OWNER_HOSTING]
        reservations: { cpus: "0.20", memory: "128M" }

  # 3. Backend FastAPI (services/api/)
  api:
    build:
      context: ../..
      dockerfile: infra/docker/Dockerfile.api
    container_name: sedp_api
    restart: unless-stopped
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --proxy-headers --forwarded-allow-ips="*" --workers 2
    env_file:
      - ../../.env.production
    networks:
      - sedp-internal
    depends_on:
      - postgres
      - redis
    deploy:
      resources:
        limits: { cpus: "1.00", memory: "384M" }       # Target alokasi awal, sesuaikan [OWNER_HOSTING]
        reservations: { cpus: "0.20", memory: "128M" }

  # 4. PostgreSQL 16+
  postgres:
    image: postgres:16-alpine # Pin tag patch/digest stabil saat Phase F dimulai
    container_name: sedp_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - sedp-internal
    deploy:
      resources:
        limits: { cpus: "1.00", memory: "512M" }       # Target alokasi awal, sesuaikan [OWNER_HOSTING]
        reservations: { cpus: "0.20", memory: "256M" }

  # 5. Redis 7 (Instance Tunggal: Sesi, Rate Limit, Cache)
  redis:
    image: redis:7-alpine # Pin tag patch/digest stabil saat Phase F dimulai
    container_name: sedp_redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 200mb --maxmemory-policy allkeys-lru
    networks:
      - sedp-internal
    deploy:
      resources:
        limits: { cpus: "0.25", memory: "256M" }       # Target alokasi awal, sesuaikan [OWNER_HOSTING]
        reservations: { cpus: "0.05", memory: "64M" }
```

Struktur repositori ini menjaga isolasi yang bersih antara kurikulum MDX statis MVP dan perluasan platform Phase F agar stabilitas MVP tetap terjaga, portabel di berbagai penyedia `[OWNER_HOSTING]`, dan siap diaudit saat gerbang persetujuan Phase F dibuka.
