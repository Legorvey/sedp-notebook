import type { Metadata } from "next";
import Link from "next/link";
import { BathymetryContours } from "@/components/layout/bathymetry-contours";
import { loadGlossary, loadLessons, loadModules } from "@/lib/content/loader";

export const metadata: Metadata = {
  title: "Beranda | SEDP Learning Hub",
  description:
    "Sumber belajar publik independen berbahasa Indonesia mengenai arsitektur sistem kabel laut, perangkat dry plant dan wet plant, serta latihan konseptual.",
};

const LEARNING_STAGES = [
  { step: "1", name: "Intuisi Utama", detail: "Peta mental peran komponen tanpa jargon berlebih." },
  {
    step: "2",
    name: "Diagram Terjangkar",
    detail: "Eksplorasi visual alur optik dan daya listrik DC di panel simulasi laut gelap.",
  },
  {
    step: "3",
    name: "Pendalaman Teknis",
    detail: "Rumus redaman, PFE seri, dan perbandingan arsitektur berstandar ITU-T.",
  },
  {
    step: "4",
    name: "Kasus Nyata Bersumber",
    detail: "Konteks pelindung kabel dan tata koridor pendaratan di Indonesia.",
  },
  {
    step: "5",
    name: "Uji Pemahaman",
    detail: "Lima soal konseptual dengan umpan balik langsung tertaut ke materi.",
  },
] as const;

export default function HomePage() {
  const modules = loadModules();
  const lessons = loadLessons();
  const glossaryCount = loadGlossary().length;
  const verticalSlice = lessons.find((item) => item.frontmatter.lesson_id === "1.3-01");

  return (
    <div>
      <section
        aria-labelledby="hero-heading"
        className="relative overflow-hidden border-b border-sedp-subtle-border bg-sedp-surface"
      >
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <h1
            id="hero-heading"
            className="max-w-[24ch] font-display text-3xl font-bold leading-tight tracking-tight text-sedp-ink sm:text-4xl lg:text-5xl"
          >
            Pahami Sistem Kabel Laut dari Pendaratan Pantai hingga Dasar Samudra
          </h1>
          <p className="mt-4 max-w-[66ch] text-base leading-relaxed text-sedp-muted sm:text-lg">
            SEDP Learning Hub adalah catatan belajar publik independen berbahasa Indonesia untuk
            memahami cara kerja infrastruktur telekomunikasi bawah laut, mulai dari stasiun darat{" "}
            <span className="font-mono text-sedp-ink">CLS</span>, sumur pantai{" "}
            <span className="font-mono text-sedp-ink">BMH</span>, hingga penguat optik di dasar
            laut.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href={
                verticalSlice?.href ?? "/kurikulum/1-3-arsitektur-sistem/arsitektur-ujung-ke-ujung/"
              }
              className="inline-flex min-h-[44px] items-center justify-center rounded-md bg-sedp-accent px-5 py-2.5 text-sm font-semibold text-sedp-accent-ink hover:bg-[var(--sedp-accent-hover)]"
            >
              Buka Pelajaran 1.3-01
            </Link>
            <Link
              href="/kurikulum/"
              className="inline-flex min-h-[44px] items-center justify-center rounded-md border border-sedp-control-border bg-sedp-canvas px-5 py-2.5 text-sm font-semibold text-sedp-ink hover:bg-sedp-inset"
            >
              Lihat Daftar Modul
            </Link>
          </div>
        </div>
        <BathymetryContours className="h-14 w-full text-sedp-accent opacity-[0.07]" />
      </section>

      <section aria-labelledby="spotlight-heading" className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="abyss-bay relative overflow-hidden rounded-[10px] border border-sedp-control-border bg-sedp-canvas p-6 text-sedp-ink lg:col-span-7">
            <BathymetryContours className="absolute inset-x-0 bottom-0 h-24 w-full text-sedp-accent opacity-[0.07]" />
            <div className="relative z-10">
              <p className="font-mono text-xs font-semibold text-sedp-accent">
                Lab Simulasi Tersedia (M1)
              </p>
              <h2
                id="spotlight-heading"
                className="mt-1 font-display text-2xl font-bold text-sedp-ink"
              >
                Eksplorer Arsitektur Ujung-ke-Ujung
              </h2>
              <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-sedp-muted">
                Bandingkan sistem <strong>Repeatered</strong> (menggunakan pencatu daya DC{" "}
                <span className="font-mono text-sedp-ink">PFE</span> dan{" "}
                <span className="font-mono text-sedp-ink">Repeater EDFA</span>),{" "}
                <strong>Open Cable (ITU-T G.977.1)</strong>, serta <strong>Repeaterless</strong> (
                <span className="font-mono text-sedp-ink">EDFA Terminal</span> dan{" "}
                <span className="font-mono text-sedp-ink">ROPA</span> tanpa daya DC laut).
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                <div className="rounded-md border border-sedp-control-border bg-sedp-surface p-3">
                  <p className="font-mono text-xs font-bold text-sedp-accent">PoP &amp; CLS</p>
                  <p className="mt-1 text-xs text-sedp-muted">SLTE, CTB, PFE, LME/NMS</p>
                </div>
                <div className="rounded-md border border-sedp-control-border bg-sedp-surface p-3">
                  <p className="font-mono text-xs font-bold text-sedp-accent">BMH Pantai</p>
                  <p className="mt-1 text-xs text-sedp-muted">Transisi kabel darat-laut</p>
                </div>
                <div className="rounded-md border border-sedp-control-border bg-sedp-surface p-3">
                  <p className="font-mono text-xs font-bold text-sedp-accent">Wet Plant</p>
                  <p className="mt-1 text-xs text-sedp-muted">Repeater EDFA, BU, ROPA</p>
                </div>
                <div className="rounded-md border border-sedp-control-border bg-sedp-surface p-3">
                  <p className="font-mono text-xs font-bold text-sedp-accent">2 Jalur</p>
                  <p className="mt-1 text-xs text-sedp-muted">Cahaya 1550 nm vs DC PFE</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/lab/eksplorer-sistem/"
                  className="inline-flex min-h-[44px] items-center rounded-md bg-sedp-accent px-4 py-2 text-sm font-semibold text-sedp-accent-ink hover:bg-[var(--sedp-accent-hover)]"
                >
                  Buka Eksplorer Sistem
                </Link>
                <Link
                  href="/latihan/quiz-1.3-01-arch/"
                  className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-surface px-4 py-2 text-sm font-semibold text-sedp-ink hover:bg-sedp-inset"
                >
                  Uji Pemahaman 1.3-01
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-6 lg:col-span-5">
            <h2 className="font-display text-xl font-bold text-sedp-ink">
              Peta Jalur Kurikulum (Modul 1.1 - 1.5)
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-sedp-muted">
              Anda dapat menelusuri kurikulum menurut urutan nomor modul maupun kronologi hari
              penyampaian sesi. Modul yang belum memiliki rujukan terverifikasi ditandai secara
              jujur.
            </p>

            <ul className="mt-4 divide-y divide-sedp-subtle-border">
              {modules.map((mod) => (
                <li
                  key={mod.module_code}
                  className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                >
                  <Link
                    href={`/kurikulum/${mod.module_slug}/`}
                    className="inline-flex min-h-[44px] min-w-0 items-center text-sm font-medium text-sedp-ink hover:text-sedp-accent hover:underline"
                  >
                    <span>
                      <span className="font-mono font-semibold text-sedp-accent">
                        {mod.module_code}
                      </span>{" "}
                      {mod.title_id}
                    </span>
                  </Link>
                  <span className="rounded-sm border border-sedp-subtle-border bg-sedp-inset px-2 py-0.5 text-xs font-medium text-sedp-ink">
                    {mod.availability_badge_id}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/kurikulum/?urut=hari"
                className="inline-flex min-h-[44px] items-center text-sm font-semibold text-sedp-accent underline underline-offset-4"
              >
                Lihat Urutan Hari (Hari 1 - 3)
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="method-heading"
        className="border-y border-sedp-subtle-border bg-sedp-inset/60"
      >
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 id="method-heading" className="font-display text-xl font-bold text-sedp-ink">
            Alur Belajar 5 Tahap
          </h2>
          <p className="mt-1 max-w-[66ch] text-sm text-sedp-muted">
            Setiap pelajaran dirancang agar pemula memahami gambaran besar sebelum masuk ke rincian
            rekayasa.
          </p>

          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {LEARNING_STAGES.map((stage) => (
              <li
                key={stage.step}
                className="rounded-md border border-sedp-subtle-border bg-sedp-surface p-4"
              >
                <span className="font-mono text-xs font-bold text-sedp-accent">
                  Tahap {stage.step}
                </span>
                <h3 className="mt-1 font-display text-base font-bold text-sedp-ink">
                  {stage.name}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-sedp-muted">{stage.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="reference-strip-heading"
        className="mx-auto max-w-6xl px-4 py-10 sm:px-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-6">
          <div>
            <h2
              id="reference-strip-heading"
              className="font-display text-lg font-bold text-sedp-ink"
            >
              Rujukan Terbuka &amp; Audit Transparansi
            </h2>
            <p className="mt-1 max-w-[60ch] text-sm text-sedp-muted">
              Periksa istilah teknis bilingual, daftar standar publik yang telah diaudit, serta log
              verifikasi fakta klaim yang masih menunggu sumber primer.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/referensi/glosarium/"
              className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-canvas px-4 py-2 text-sm font-medium text-sedp-ink hover:bg-sedp-inset"
            >
              Glosarium ({glossaryCount} Istilah)
            </Link>
            <Link
              href="/tentang/sumber/"
              className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-canvas px-4 py-2 text-sm font-medium text-sedp-ink hover:bg-sedp-inset"
            >
              Daftar Sumber Publik
            </Link>
            <Link
              href="/tentang/verifikasi-fakta/"
              className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-canvas px-4 py-2 text-sm font-medium text-sedp-ink hover:bg-sedp-inset"
            >
              Verifikasi Fakta
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
