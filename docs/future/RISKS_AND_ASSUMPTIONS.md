# Analisis Risiko & Asumsi Desain: SEDP Learning Hub (Phase F)

> [!CAUTION]
> **DO NOT DELETE.** Kept by the owner for future use. **NOT PART OF THE MVP**: do not implement or plan MVP work from this file until the owner approves Phase F (see [README.md](./README.md)). If this file conflicts with `docs/prompts/` or `AGENTS.md`, those win.

| Field | Detail |
|---|---|
| **System** | SEDP Learning Hub, Phase F (Platform) |
| **Document Version** | 4.0.0-sedp |
| **Date** | 2026-11-18 |
| **Status** | Deferred draft, not approved |
| **Scope** | Asumsi Arsitektur & Register Risiko F1 Articles, F2 Provenance, opsional F3 Learner Accounts |
| **Domain & Hosting** | `[OWNER_DOMAIN]` / `[OWNER_HOSTING]` |
| **Privacy Framework** | UU PDP Indonesia (UU No. 27/2022) untuk modul opsional F3 Learner Accounts |

---

## Riwayat Revisi (Revision History)

| Versi | Tanggal | Penulis / Reviewer | Bagian yang Diubah | Rincian Perubahan (Sebelum vs Sesudah) | Alasan Perubahan |
|---|---|---|---|---|---|
| 4.0.0-sedp | 2026-11-18 | Phase F Adaptation | Seluruh Dokumen (Dokumen Baru untuk SEDP Phase F) | **Sebelum:** Dokumen analisis risiko HIMA IF CMS v2.0.0 (tidak tersimpan di commit `5cbca24`; berfokus pada blog CMS mahasiswa, *direct publishing*, dan migrasi server kampus).<br>**Sesudah:** Disusun ulang untuk SEDP Learning Hub Phase F (status *deferred draft, not approved*): menetapkan 8 asumsi desain Phase F (kurikulum tetap MDX di git, MVP independen dari API, pilihan stack di Gate F0, hosting agnostik `[OWNER_HOSTING]`, nol *direct publishing*) dan register 12 risiko terstruktur (Stored XSS, upload SVG, bom dekompresi 16 MP, pembajakan sesi, URI media putus saat ganti domain, kebocoran materi NEC "Internal Use Only"/tertutup, klaim afiliasi palsu SEDP/NEC/Telkom, ketidakakuratan teknik bawah laut, PII pembelajar di bawah UU PDP No. 27/2022, *scope creep* ke MVP, kegagalan API/build, dan pergeseran kontrak antar layanan). | Mendokumentasikan asumsi arsitektur dan mitigasi risiko teknis, hak cipta, akurasi teknik, privasi, serta batas produk sebelum Phase F disetujui. |

---

## 1. Asumsi Desain Arsitektur & Operasional (Design Assumptions)

Seluruh spesifikasi di `docs/future/` bertumpu pada asumsi desain berikut. Jika salah satu asumsi berubah saat **Phase F0 Gate**, perubahan wajib dicatat terlebih dahulu di `docs/DECISIONS.md` sebelum implementasi dimulai:

| ID | Asumsi Desain | Rasional & Konsekuensi Teknis | Titik Verifikasi |
|---|---|---|---|
| **A1** | **Phase F Bersifat *Deferred* & Kurikulum Inti Tetap MDX di Git** | Phase F hanya menambah **F1 Articles** ("Catatan & Studi Kasus"), **F2 Provenance**, dan opsional **F3 Learner Accounts**. Pelajaran inti (`lesson_id`) dan kuis (`quiz_id`) tetap berkas MDX di `content/`, tidak pernah dipindahkan ke PostgreSQL. | [README.md](./README.md), [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) |
| **A2** | **Independensi Mutlak Halaman MVP dari API Phase F** | Situs MVP *static-first* harus tetap berfungsi 100% (`HTTP 200 OK`) apabila layanan backend Phase F (`services/api/`, PostgreSQL, Redis) tidak berjalan. Hanya rute F1/F3 yang berkomunikasi dengan `/api/v1` dan wajib gagal secara anggun (*explicit error state*). | [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md), [ARTICLES_MODULE.md](./ARTICLES_MODULE.md) |
| **A3** | **Stack Backend Default Dapat Diganti pada Gerbang F0 (`[OWNER_DECISION]`)** | Default rancangan memakai Python 3.12+ FastAPI (`services/api/`) + PostgreSQL 16+ + Redis 7 + S3-compatible storage (Cloudflare R2 diusulkan) + Nginx di `infra/docker/`, sementara aplikasi Next.js 16.4.x berada di root repo (React 19, Tailwind 4, pnpm 12, Node 26/24/22 LTS). Alternatif Next.js-native Route Handlers + TypeScript ORM tetap sah dipilih di Gate F0 selama skema SQL, RBAC, sanitasi, dan guard media identik. | [README.md](./README.md), [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) |
| **A4** | **Single-Origin HTTPS di `[OWNER_DOMAIN]` sebagai Prasyarat Cookie `__Host-`** | Cookie sesi `__Host-sedp_session` mensyaratkan `Secure=true`, `Path=/`, dan tanpa atribut `Domain`. Oleh karena itu produksi wajib berjalan di belakang terminasi TLS HTTPS satu origin (`https://[OWNER_DOMAIN]`), tanpa mengekspos API backend pada origin lintas domain. | [AUTH_AND_RBAC.md](./AUTH_AND_RBAC.md), [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) |
| **A5** | **Akurasi Teknik & Hak Cipta adalah *Release Blocker* (Tanpa *Direct Publishing*)** | Berbeda dari blog umum, artikel kajian kabel laut dapat menyebarkan kekeliruan teknik atau melanggar hak cipta materi pelatihan. Oleh sebab itu `AUTHOR` tidak boleh menerbitkan langsung; setiap publikasi wajib melewati tinjauan independen (`technical_ok=true`, `rights_ok=true`) dan status `CLEARED` pada seluruh aset dan sumber. | [README.md](./README.md), [ARTICLES_MODULE.md](./ARTICLES_MODULE.md) |
| **A6** | **Pemisahan Ketat Media Publik (Raster Saja) vs Sumber Privat (`sources-private/`)** | Hanya gambar raster bersih (WebP/AVIF/PNG/JPEG, maks 5 MB, maks 16 MP, hasil re-encode WebP tanpa EXIF) berstatus `CLEARED` yang masuk ke `/storage/public/{id}.webp`. Diagram SVG teknis adalah komponen kode terkurasi di git, bukan upload CMS. Dokumen sumber tertutup berada di luar folder publik dan tidak pernah ditautkan via URL publik. | [API_DESIGN.md](./API_DESIGN.md), [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) |
| **A7** | **Penjadwalan Tanpa Worker & Infrastruktur Hosting-Agnostic (`[OWNER_HOSTING]`)** | Penayangan artikel terjadwal memakai query SQL deterministik (`published_at <= NOW()`) dan cache ber-TTL pendek tanpa Celery/worker terpisah. Spesifikasi container (`infra/docker/`) agnostik terhadap penyedia hosting dan tidak mengasumsikan migrasi ke server kampus mana pun. | [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md), [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) |
| **A8** | **Privasi Minimalis & Kepatuhan UU PDP No. 27/2022 untuk Modul Opsional F3** | Pengunjung anonim tidak dipaksa login. Jika modul F3 diaktifkan, data pembelajar dibatasi pada `email`, `display_name`, progres pelajaran, dan riwayat kuis tanpa tracker pihak ketiga, dengan hak hapus mandiri (`DELETE /api/v1/me`) dan retensi yang dikonfirmasi di `[OWNER_DECISION]`. | [README.md](./README.md), [AUTH_AND_RBAC.md](./AUTH_AND_RBAC.md) |

---

## 2. Ringkasan Matriks Risiko (Risk Matrix Summary)

Skala penilaian risiko menggunakan kualifikasi kualitatif (**Likelihood**: *Low / Medium / High*; **Impact**: *Medium / High / Critical*) untuk menentukan prioritas kontrol mitigasi tanpa mengklaim probabilitas statistik rekaan.

| ID | Risiko Utama | Kategori | Likelihood | Impact | Prioritas | Risk Owner |
|---|---|---|---|---|---|---|
| **R-01** | Stored XSS via konten artikel, TipTap AST, atau node KaTeX | Security | Medium | Critical | **P0** | Backend Lead & Studio Frontend Lead |
| **R-02** | Eksploitasi upload berkas `.svg` (Stored XSS / SMIL / script injection) | Security / Media | Medium | Critical | **P0** | Backend Media Lead |
| **R-03** | *Decompression bomb* (> 16 MP) & kelelahan memori worker saat decode gambar | Security / Availability | Medium | High | **P1** | Backend Media Lead & Infra/DevOps Owner |
| **R-04** | *Session hijack*, *cookie tossing*, CSRF, dan sesi kedaluwarsa pasca-pencabutan | Security / Auth | Medium | Critical | **P0** | Security / Backend Auth Lead |
| **R-05** | URI media artikel patah saat perubahan `[OWNER_DOMAIN]` atau migrasi `[OWNER_HOSTING]` | Reliability | Medium | Medium | **P2** | Backend Media Lead & Infra/DevOps Owner |
| **R-06** | Kebocoran hak cipta materi NEC "Internal Use Only", PDF mentah, atau soal tertutup | Legal / Provenance | High | Critical | **P0** | Owner & `REVIEWER` (Rights Reviewer) |
| **R-07** | Persepsi keliru sebagai produk resmi / berafiliasi dengan SEDP, NEC, atau Telkom | Legal / Reputational | Medium | High | **P1** | Owner & `REVIEWER` |
| **R-08** | Publikasi konten rekayasa sistem kabel laut yang tidak akurat atau menyesatkan | Technical Quality | Medium | High | **P1** | `REVIEWER` (Technical) & Owner |
| **R-09** | Kebocoran/kelebihan PII pembelajar & ketidakpatuhan UU PDP No. 27/2022 (F3) | Privacy / Compliance | Medium | High | **P1** | Owner & Backend Auth/F3 Lead |
| **R-10** | *Scope creep* menarik implementasi Phase F ke dalam MVP | Program / Scope | High | High | **P0** | Owner & Technical Program Lead |
| **R-11** | Gangguan atau downtime API Phase F menjatuhkan rute MVP atau proses build Next.js | Resilience | Medium | High | **P1** | Frontend Lead & Infra/DevOps Owner |
| **R-12** | Pergeseran kontrak (*contract drift*) atau duplikasi rute `/api/v1` antara Next.js dan Backend | Architecture | Medium | Medium | **P2** | Technical Program Lead & Backend Lead |

---

## 3. Register Risiko Terperinci (Detailed Risk Register)

### R-01: Stored XSS melalui Konten Artikel, TipTap AST, atau Formula KaTeX
- **Kategori**: Application Security
- **Likelihood**: Medium | **Impact**: Critical
- **Risk Owner**: Backend Lead & Studio Frontend Lead
- **Deskripsi Ancaman**: Penulis atau penyerang yang memodifikasi payload HTTP mencoba menyisipkan `<script>`, atribut event handler (`onerror`, `onload`), URL `javascript:`/`data:`, HTML tidak aman lewat salin-tempel dari sumber eksternal, atau perintah KaTeX berbahaya sehingga dieksekusi di browser pembaca maupun staf Studio.
- **Kontrol Mitigasi Berlapis**:
  1. Klien dilarang mengirim `content_html` final; server hanya menerima `content_json` (AST ProseMirror maks 512 KB) dan menjalankan validasi skema AST (`depth <= 32`, hanya node/mark terdaftar, melarang `H1`).
  2. Server mengompilasi AST secara deterministik lalu membersihkan output dengan allowlist **Rust `nh3`** (`clean_content_tags={"script", "style", "svg", "math"}`, paksa `rel="noopener noreferrer"`, filter `img[src]` hanya ke regex relatif `/storage/public/{uuid}.webp`).
  3. Rollback ke revisi lama (`article_revisions`) selalu mengulang sanitasi `nh3` terkini sebelum disimpan.
  4. KaTeX (jika diaktifkan) dipaksa berjalan dengan `trust: false` dan `strict: "warn"` sehingga `\href{javascript:...}` dan macro berisiko diblokir.
  5. Header respons `X-Content-Type-Options: nosniff` serta `Content-Security-Policy` diterapkan di Nginx & API, dan JSON-LD melakukan escape `<` menjadi `\u003c`.
- **Verifikasi Wajib**: Pengujian otomatis Pytest pada Sprint F2 & F5 membuktikan berbagai vektor XSS standar dilucuti 100% dan tidak terekspos di DOM publik.

### R-02: Eksploitasi Upload SVG (Stored XSS / Embedded Script / Polyglot)
- **Kategori**: Security / Media Pipeline
- **Likelihood**: Medium | **Impact**: Critical
- **Risk Owner**: Backend Media Lead
- **Deskripsi Ancaman**: Berkas `.svg` adalah dokumen XML yang dapat memuat `<script>`, `<foreignObject>`, atau event SMIL (`onload`). Jika disajikan pada origin yang sama (`https://[OWNER_DOMAIN]/storage/public/...`), penyerang dapat mengeksekusi skrip di origin situs utama untuk membajak sesi staf atau pembaca.
- **Kontrol Mitigasi Berlapis**:
  1. **Larangan Mutlak `.svg`**: `POST /api/v1/media/presign-upload` dan `confirm-upload` menolak ekstensi `.svg` dan MIME `image/svg+xml`. Hanya raster (`image/webp`, `image/avif`, `image/png`, `image/jpeg`) yang diterima.
  2. **Inspeksi *Magic Bytes* & Prefix XML**: `media_guard.py` memeriksa header biner aktual (setelah memangkas BOM/spasi awal) dan menolak mutlak awalan `<svg`, `<?xml`, `<!doctype`, maupun `<html`, bahkan bila ekstensi diubah menjadi `.jpg` atau `.webp`.
  3. **Re-encode Penuh ke WebP**: Setiap raster valid didekode dan di-encode ulang ke format WebP oleh Pillow sehingga muatan polyglot terbuang.
  4. **Constraint Database & Nginx**: Tabel `media_assets` menegakkan `CHECK (mime_type IN ('image/webp', 'image/avif', 'image/png', 'image/jpeg'))` dan Nginx `/storage/public/` hanya meneruskan pola UUID `.webp` dengan header `X-Content-Type-Options: nosniff` serta `Content-Security-Policy: default-src 'none'; sandbox`.
  5. **Alternatif Aman untuk Diagram Vektor**: Diagram SVG teknis SEDP ditulis dan direview langsung sebagai komponen TSX/SVG di repositori git (`src/components/diagrams/`), bukan melalui unggahan CMS.
- **Verifikasi Wajib**: Uji integrasi mengonfirmasi upload `.svg` murni maupun file `<svg>` berkamuflase `.png`/`.jpg` gagal dengan HTTP `415`/`422` dan objek di `quarantine/` langsung dihapus.

### R-03: *Decompression Bomb* (> 16 MP) & Kelelahan Sumber Daya Server saat Decode Media
- **Kategori**: Availability / Media Security
- **Likelihood**: Medium | **Impact**: High
- **Risk Owner**: Backend Media Lead & Infra/DevOps Owner
- **Deskripsi Ancaman**: Penyerang mengunggah berkas PNG/WebP/AVIF berukuran kecil (< 5 MB) yang header dimensinya dimodifikasi menjadi puluhan ribu piksel per sisi sehingga saat didekode di RAM dapat menghabiskan memori container `api` dan memicu *Out-Of-Memory (OOM) crash*.
- **Kontrol Mitigasi Berlapis**:
  1. Batas ukuran file maksimal **5 MB (`5.242.880` byte)** ditegakkan pada `Content-Length` Presigned PUT S3v4 dan stream download terbatas di `confirm-upload`.
  2. `PIL.Image.MAX_IMAGE_PIXELS` disetel keras ke **`16_000_000` (16 MP)** dengan `warnings.simplefilter("error", Image.DecompressionBombWarning)` agar Pillow melempar pengecualian sebelum mengalokasikan buffer bitmap besar.
  3. Validasi dimensi sebelum alokasi penuh, penolakan animasi multi-frame (`n_frames > 1`), batas sisi maksimum piksel (yang diselaraskan antara `media_guard.py` dan DDL pada Gate F0), serta `CHECK ((width::BIGINT * height::BIGINT) <= 16000000)` di PostgreSQL.
  4. Pembatasan konkurensi decode di worker API menggunakan semaphore dan rate limit pada `/media/presign-upload` & `/media/confirm-upload`.
- **Verifikasi Wajib**: Pengujian otomatis mengirim gambar sintetis berdimensi > 16 MP (< 5 MB) dan memastikan backend menolak dengan `422 VALIDATION_ERROR` tanpa lonjakan memori signifikan maupun crash worker.

### R-04: *Session Hijack*, *Cookie Tossing*, CSRF, & Sesi Lama Pasca-Pencabutan
- **Kategori**: Authentication & Session Security
- **Likelihood**: Medium | **Impact**: Critical
- **Risk Owner**: Security / Backend Auth Lead
- **Deskripsi Ancaman**: Pencurian atau penimpaan cookie dari subdomain tetangga (jika `[OWNER_DOMAIN]` kelak memiliki subdomain sibling), serangan *Cross-Site Request Forgery* (CSRF) ke endpoint studio, pembacaan token via XSS, atau sesi yang masih berlaku sesudah password diubah / akun staf dinonaktifkan.
- **Kontrol Mitigasi Berlapis**:
  1. **Host-Only Cookie `__Host-sedp_session`**: Atribut `Domain` **wajib kosong (`None`)**, dikombinasikan dengan `Secure=true`, `HttpOnly=true`, `SameSite=Lax`, dan `Path=/`.
  2. **Token Kriptografis & Penyimpanan Hash**: ID sesi 256-bit CSPRNG hanya disimpan sebagai hash SHA-256 (`token_hash`) di tabel `sessions`, tidak pernah sebagai plain token di DB maupun `localStorage`.
  3. **Instant Revocation via `users.auth_epoch`**: Setiap penggantian password, reset password, perubahan role, penonaktifan akun, atau `DELETE /api/v1/me` menaikkan `users.auth_epoch`, menghapus baris `sessions`, dan menghapus entri sesi di Redis. Middleware autentikasi memverifikasi `session.auth_epoch == current_auth_epoch` secara *fail-closed*.
  4. **Anti-CSRF 4 Lapis**: Pengecekan `Sec-Fetch-Site`, whitelist `Origin`/fallback `Referer` tepat ke `https://[OWNER_DOMAIN]`, kewajiban header `X-Requested-With`, dan CORS strict tanpa wildcard.
  5. **Argon2id OWASP & Lockout Staf Baru**: Password di-hash Argon2id ($m=19456\text{ KiB}, t=2, p=1$), verifikasi constant-time dengan dummy hash, rate limit login (target 5 req/menit), dan wajib `change-password` saat `must_change_password = true`.
- **Verifikasi Wajib**: Pengujian keamanan mengonfirmasi atribut exact cookie, penolakan CSRF `403`, dan penolakan instan `401` bagi sesi lama begitu `auth_epoch` dinaikkan.

### R-05: URI Media Putus (*Broken Images*) saat Perubahan `[OWNER_DOMAIN]` atau Migrasi `[OWNER_HOSTING]`
- **Kategori**: Reliability / Maintainability
- **Likelihood**: Medium | **Impact**: Medium
- **Risk Owner**: Backend Media Lead & Infra/DevOps Owner
- **Deskripsi Ancaman**: Jika artikel menyimpan URL absolut ke domain tertentu (`https://domain-lama.tld/...`) atau URL langsung bucket S3/R2 (`https://*.r2.dev/...`), setiap penggantian `[OWNER_DOMAIN]` atau perpindahan penyedia storage di `[OWNER_HOSTING]` akan memutus gambar di seluruh artikel lama.
- **Kontrol Mitigasi Berlapis**:
  1. **Kontrak Relative URI**: Seluruh node `subseaFigure` dan kolom `content_html` wajib memakai path relatif `/storage/public/{id}.webp`.
  2. Penegakan pola regex pada validator AST backend dan `nh3` `filter_safe_attribute`, yang menolak penyimpanan domain absolut ke `articles.content_json` maupun `content_html`.
  3. Abstraksi penyimpanan melalui reverse proxy Nginx (`/storage/public/` -> origin object storage publik yang dikonfigurasi lewat env) sehingga pergantian bucket atau penyedia `[OWNER_HOSTING]` hanya memerlukan pembaruan konfigurasi ingress/storage tanpa migrasi string database.
- **Verifikasi Wajib**: Uji unit memverifikasi `POST`/`PUT /articles` menolak `https://...` di dalam `subseaFigure.src`; uji staging membuktikan gambar tetap termuat saat host/domain staging diganti.

### R-06: Kebocoran Hak Cipta & Materi Tertutup (NEC "Internal Use Only", PDF Mentah, Soal Tertutup, Data Peserta)
- **Kategori**: Legal / Copyright & Provenance
- **Likelihood**: High | **Impact**: Critical
- **Risk Owner**: Owner & `REVIEWER` (Rights Reviewer)
- **Deskripsi Ancaman**: Staf tanpa sadar mengunggah salinan slide NEC bertanda "Internal Use Only", PDF materi pelatihan mentah, tangkapan layar kuliah tertutup, soal pre-test/post-test tertutup, atau daftar nama/data peserta kursus ke Media Library publik, ke tabel `sources`, atau menyalin langsung ke badan artikel F1.
- **Kontrol Mitigasi Berlapis**:
  1. **Pemisahan Bucket & Aturan Upload**: Pipeline `/media` menolak dokumen `.pdf`, `.docx`, `.zip`, serta memisahkan objek yang belum lolos verifikasi ke prefix non-publik (`quarantine/` dan `staging/`). Promosi ke `/storage/public/` hanya terjadi ketika `REVIEWER`/`OWNER` menyetel `rights_status = 'CLEARED'` dengan `license`, `attribution`, dan `source_id` terisi (ditegakkan juga oleh constraint DB).
  2. **Proteksi Tabel `sources` (Staff-Only)**: `sources` hanya menyimpan metadata referensi dan path lokal non-publik (`private_storage_ref`), dilengkapi constraint DB `private_storage_ref !~* '^https?://'` agar URL eksternal/bucket privat tidak pernah disalahartikan sebagai tautan publik. Endpoint `/sources` tertutup total bagi publik dan `LEARNER`.
  3. **Gerbang `public_reuse_allowed` & Review Hak Cipta**: Sumber berstatus `public_reuse_allowed = false` (seperti materi internal atau catatan riset) hanya boleh dipakai sebagai rujukan riset/parafrase orisinal, tidak untuk reproduksi langsung. Sebelum artikel dapat bertransisi ke `APPROVED`/`SCHEDULED`/`PUBLISHED`, `REVIEWER` berbeda wajib mencentang `rights_ok = true` dan backend memverifikasi seluruh media serta sumber tertaut berstatus `CLEARED`.
  4. **Perlindungan Repositori**: Direktori `sources-private/` dan berkas `*.pdf` dikecualikan di `.gitignore` sejak Phase 0A dan dilarang keras ditempatkan di `public/`.
- **Verifikasi Wajib**: Audit konten pada checklist review (`rights_ok`), uji integrasi penolakan upload PDF dan penolakan publikasi artikel dengan aset/sumber non-`CLEARED`, serta pemeriksaan CI/build bahwa `sources-private/` tidak masuk ke image Docker produksi.

### R-07: Salah Persepsi Afiliasi / Branding Resmi dengan SEDP, NEC, atau Telkom University
- **Kategori**: Legal / Reputational / Product Identity
- **Likelihood**: Medium | **Impact**: High
- **Risk Owner**: Owner & `REVIEWER`
- **Deskripsi Ancaman**: Penggunaan domain, logo, frasa tajuk, atau narasi editorial yang membuat pengunjung mengira SEDP Learning Hub (beserta artikel studi kasus Phase F) merupakan publikasi resmi program SEDP, NEC, Telkom University, atau operator telekomunikasi tertentu.
- **Kontrol Mitigasi Berlapis**:
  1. **Isolasi Identitas & Domain**: Domain dan infrastruktur situs dikunci ke `[OWNER_DOMAIN]` serta `[OWNER_HOSTING]` milik owner sendiri; nama program, universitas, atau merek pihak ketiga (SEDP, NEC, Telkom University, maupun operator/vendor kabel laut) tidak pernah dipakai sebagai identitas atau domain situs tanpa izin tertulis.
  2. **Disclaimer Edukatif Independen**: Template artikel F1 dan halaman tentang/sumber menampilkan pernyataan jelas bahwa konten merupakan sumber belajar publik independen, tidak berafiliasi maupun disahkan oleh penyelenggara pelatihan, vendor, atau operator kabel laut mana pun.
  3. **Checklist Tinjauan Editorial (`REVIEWER`)**: Pemeriksaan kelayakan publikasi mencakup verifikasi bahwa judul, badge, metadata SEO (`TechArticle`), dan atribusi tidak mencantumkan klaim dukungan resmi atau merek dagang secara menyesatkan.
- **Verifikasi Wajib**: Tinjauan template UI publik F1 dan daftar periksa review memastikan penafian independen selalu terrender di setiap halaman artikel dan tidak ada aset/domain pihak ketiga tak berizin.

### R-08: Publikasi Konten Rekayasa Kabel Laut yang Tidak Akurat atau Menyesatkan
- **Kategori**: Technical Accuracy & Educational Integrity
- **Likelihood**: Medium | **Impact**: High
- **Risk Owner**: `REVIEWER` (Technical Reviewer) & Owner
- **Deskripsi Ancaman**: Artikel studi kasus atau catatan lapangan mempublikasikan perhitungan *optical power budget* yang salah dimensi, penjelasan keliru tentang tegangan tinggi PFE / lokasi *shunt fault*, klaim insiden kabel tanpa sumber valid, nomor halaman/statistik rekaan, atau mengaburkan batas antara aproksimasi edukatif dan kalkulasi desain produksi.
- **Kontrol Mitigasi Berlapis**:
  1. **Penghapusan Total *Direct Publishing***: `AUTHOR` hanya dapat mengajukan draf (`IN_REVIEW`), tidak pernah menerbitkan atau menjadwalkan artikel sendiri.
  2. **Review Teknis Independen & Pemisahan Tugas**: Publikasi mewajibkan `article_reviews` berstatus `APPROVED` dengan `technical_ok = true` oleh peninjau berbeda (`reviewer_id != article_author_id`), yang juga ditegakkan di level database oleh trigger `fn_enforce_article_publish_gate()` dan constraint tabel `article_reviews`. (Opsi darurat override `OWNER` hanya aktif jika diizinkan oleh `[OWNER_DECISION]` dan wajib menyertakan alasan tertulis serta log audit).
  3. **Integrasi Log Cek Fakta (`fact_checks`)**: Klaim yang berstatus `DISPUTED` atau `RETRACTED` pada `fact_checks` memblokir publikasi artikel (`409 RESOURCE_CONFLICT`) sampai direvisi dan diverifikasi ulang terhadap `sources` yang dapat dipercaya (`trust_level`).
  4. **Penandaan Asumsi Model (`engineeringCallout`)**: Editor TipTap menyediakan varian callout `assumption` dan `safety` untuk memisahkan secara visual antara fakta terverifikasi, catatan keselamatan sistem PFE, dan penyederhanaan model edukatif. Setiap penyuntingan pada artikel `APPROVED`/`SCHEDULED` otomatis mereset status ke `DRAFT` agar tidak melewati peninjauan ulang.
- **Verifikasi Wajib**: Uji integrasi membuktikan `AUTHOR` mendapat `403` saat memanggil `/publish`, `REVIEWER` mendapat `403` saat mencoba menyetujui tulisannya sendiri, dan artikel dengan `fact_checks` berstatus `DISPUTED` gagal dipublikasikan.

### R-09: Pelanggaran Privasi & Kepatuhan Data Pribadi Pembelajar (`LEARNER`) di bawah UU PDP No. 27/2022
- **Kategori**: Privacy / Regulatory Compliance
- **Likelihood**: Medium | **Impact**: High
- **Risk Owner**: Owner & Backend Auth/F3 Lead
- **Deskripsi Ancaman**: Pengumpulan data pribadi pembelajar secara berlebihan, kebocoran data lewat tracker analitik pihak ketiga, kegagalan memverifikasi kepemilikan email saat registrasi, kebocoran data lintas pengguna (BOLA/IDOR pada progres/kuis), ketidakmampuan pengguna menghapus akunnya, atau sisa PII tertinggal di `auth_audit_logs` pasca-penghapusan.
- **Kontrol Mitigasi Berlapis**:
  1. **Opt-In & Minimisasi Data**: Modul F3 bersifat opsional; situs tetap dapat dipelajari secara anonim. Data `LEARNER` dibatasi hanya pada `email`, `display_name`, `learner_progress`, dan `quiz_attempts` (tanpa nomor telepon, alamat, identitas akademik/KTP, maupun tracker pihak ketiga).
  2. **Kontrol Akses Anti-BOLA/IDOR & Strict Field Filtering**: Seluruh endpoint `/api/v1/me*` mengambil identitas eksklusif dari `current_user.id` sesi server, menolak parameter `user_id` klien, dan mewajibkan verifikasi email via token SHA-256 single-use sebelum login pertama.
  3. **Hak Penghapusan Mandiri (`DELETE /api/v1/me`)**: Memerlukan konfirmasi kata sandi aktif, menghapus/menganonimkan data akun `LEARNER` dalam satu transaksi DB, membersihkan PII dari `auth_audit_logs.metadata`, menaikkan `auth_epoch`, dan mencabut sesi/cookie seketika.
  4. **Enkripsi & Retensi Terjadwal**: Seluruh trafik lewat HTTPS TLS, backup PostgreSQL dienkripsi sebelum disimpan ke off-host, serta jadwal pembersihan `sessions`, akun belum terverifikasi, dan log audit dijalankan sesuai periode `[OWNER_DECISION]`.
- **Verifikasi Wajib**: Uji integrasi mengonfirmasi nol request pihak ketiga di halaman publik/learner, isolasi BOLA antar dua akun `LEARNER`, dan pembersihan tuntas data pasca `DELETE /api/v1/me`.

### R-10: *Scope Creep* yang Menarik Spesifikasi Phase F ke dalam MVP
- **Kategori**: Program & Delivery Management
- **Likelihood**: High | **Impact**: High
- **Risk Owner**: Owner & Technical Program Lead
- **Deskripsi Ancaman**: Agen atau kontributor pada fase MVP (Phase 0A, Phase 0B, atau implementasi awal) membaca spesifikasi di `docs/future/` lalu mulai memasang FastAPI, PostgreSQL, Redis, TipTap, atau login akun pembelajar sebelum MVP statis selesai, atau memindahkan pelajaran MDX ke database.
- **Kontrol Mitigasi Berlapis**:
  1. **Banner Peringatan Eksplisit & Kontrak `README.md`**: Setiap berkas di `docs/future/` diawali banner `[!CAUTION]` yang melarang implementasi pada MVP dan menyatakan aturan `docs/prompts/` serta `AGENTS.md` selalu menang bila terjadi konflik.
  2. **Phase F0 Gate Wajib**: Implementasi Phase F diblokir secara prosedural sampai MVP *static-first* rilis dan persetujuan tertulis owner (beserta resolusi `[OWNER_DECISION]`) tercatat di `docs/DECISIONS.md`.
  3. **Batas Struktur Direktori**: Kode backend `services/api/` dan orkestrasi `infra/docker/` tidak diinisialisasi selama MVP; pelajaran tetap berada di `content/` sebagai berkas MDX.
- **Verifikasi Wajib**: Review PR dan checklist Phase 0A/0B memastikan tidak ada dependensi database, autentikasi, atau layanan `services/api/` terpasang sebelum Gate F0 resmi ditandatangani.

### R-11: Ketidaktersediaan API Phase F Mengganggu Rute MVP atau Build Next.js
- **Kategori**: Availability & Fault Isolation
- **Likelihood**: Medium | **Impact**: High
- **Risk Owner**: Frontend Lead & Infra/DevOps Owner
- **Deskripsi Ancaman**: Jika aplikasi Next.js di root memanggil `/api/v1` secara sinkron di *root layout*, *global navigation*, atau `sitemap.ts` tanpa timeout dan fallback, gangguan sementara pada container FastAPI atau PostgreSQL dapat membuat seluruh situs MVP (termasuk pelajaran MDX dan simulator) ikut menampilkan layar error 500 atau menggagalkan `next build`.
- **Kontrol Mitigasi Berlapis**:
  1. **Larangan Fetch API di Layout Global & Rute MVP**: `src/app/layout.tsx` dan seluruh rute pelajaran/simulator/glosarium/kuis MVP dilarang memanggil `/api/v1`.
  2. **Fetching Terisolasi dengan Timeout & Error State**: Klien artikel F1 memakai `AbortSignal.timeout` singkat (target 3 detik) dan *error boundary* lokal (`src/app/artikel/error.tsx`) yang menampilkan *explicit error state* beserta tautan ke kurikulum MDX.
  3. **Build & Sitemap Resilient**: `sitemap.ts` wajib menangkap error jaringan/timeout ke API secara bersih dan tetap mengembalikan seluruh URL statis MVP ketika API tidak aktif.
- **Verifikasi Wajib**: Chaos test pada Sprint F5 mematikan `api`, `postgres`, dan `redis` lalu memverifikasi `next build` berhasil dan seluruh rute MVP tetap mengembalikan `HTTP 200 OK`.

### R-12: Pergeseran Kontrak (*Contract Drift*) atau Duplikasi Rute `/api/v1` antara Next.js dan Backend
- **Kategori**: Architecture & Maintainability
- **Likelihood**: Medium | **Impact**: Medium
- **Risk Owner**: Technical Program Lead & Backend Lead
- **Deskripsi Ancaman**: Tanpa kontrak tunggal yang disinkronkan pada Gerbang F0, pengembang frontend dan backend dapat mendefinisikan nama field berbeda (misalnya variasi `display_name` vs `full_name`, endpoint clearance `/rights` vs `/clearance`, atau perbedaan tipe kolom revisi), atau tidak sengaja membuat Route Handler Next.js di bawah `src/app/api/v1/**` yang membypass Nginx/FastAPI.
- **Kontrol Mitigasi Berlapis**:
  1. **Single Source of Truth Kontrak**: Seluruh enum, tabel, revisi Alembic, dan kelompok API mengacu ketat ke [README.md](./README.md) dan daftar penyelarasan di **Phase F0 Gate** pada [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).
  2. **Aturan Larangan `src/app/api/v1/**`**: Pemeriksaan CI memvalidasi tidak ada direktori/route handler di `src/app/api/v1/**` saat arsitektur default FastAPI digunakan; hanya `/api/internal/revalidate` yang diizinkan untuk webhook internal (terblokir oleh Nginx).
  3. **OpenAPI & Type Verification**: Skema Pydantic v2 di FastAPI menghasilkan kontrak OpenAPI untuk memvalidasi tipe TypeScript klien di `src/features/articles/` dan `src/features/studio/`.
- **Verifikasi Wajib**: Checklist F0 Gate menyelesaikan seluruh penyelarasan DTO/kolom sebelum Sprint F1, dan CI memblokir PR yang menambahkan handler di `src/app/api/v1/**` pada mode FastAPI.

---

## 4. Matriks Tindak Lanjut Risiko ke Keputusan Owner (F0 Gate)

Beberapa mitigasi akhir bergantung pada penetapan kebijakan oleh owner di `docs/DECISIONS.md` pada saat **Phase F0 Gate** dibuka:

| Item `[OWNER_DECISION]` | Risiko Terkait | Pilihan yang Harus Ditetapkan Owner |
|---|---|---|
| **Keputusan #1 (Aktifkan F1, F2, F3)** | **R-09, R-10** | Menentukan apakah F3 (`LEARNER` accounts) ikut diaktifkan pada gelombang Phase F pertama atau ditunda agar paparan PII tetap nol. |
| **Keputusan #2 (FastAPI vs Next.js-native)** | **R-01, R-02, R-03, R-11, R-12** | Jika memilih Opsi B (Next.js-native Route Handlers), owner wajib memverifikasi ketersediaan sanitizer HTML setara `nh3` dan validator raster anti-16 MP di Node.js/pnpm `allowBuilds`. |
| **Keputusan #3 (`[OWNER_DOMAIN]` & `[OWNER_HOSTING]`)** | **R-04, R-05, R-07** | Domain resmi independen, spesifikasi kapasitas `[OWNER_HOSTING]`, penyedia S3-compatible storage, penyedia email verifikasi, dan lokasi backup off-host terenkripsi. |
| **Keputusan #4 (Retensi Data UU PDP)** | **R-09** | Mengonfirmasi durasi penyimpanan final untuk `sessions`, `auth_audit_logs`, akun `LEARNER` tidak aktif/belum terverifikasi, dan prosedur offboarding staf. |
| **Keputusan #5 (`OWNER` Self-Approval & Tombol Publish)** | **R-08** | Menentukan apakah *self-approval override* bagi `OWNER` diizinkan (dengan audit log wajib) atau dilarang mutlak sebagaimana `REVIEWER`, serta siapa yang berwenang memicu `/publish`. |
