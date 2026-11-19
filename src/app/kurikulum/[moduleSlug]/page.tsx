import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getModuleBySlug, loadLessons, loadModules } from "@/lib/content/loader";

interface ModulePageProps {
  params: Promise<{ moduleSlug: string }>;
}

export function generateStaticParams() {
  return loadModules().map((mod) => ({ moduleSlug: mod.module_slug }));
}

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { moduleSlug } = await params;
  const mod = getModuleBySlug(moduleSlug);
  if (!mod) {
    return { title: "Modul Tidak Ditemukan" };
  }
  return {
    title: `Modul ${mod.module_code}: ${mod.title_id}`,
    description: mod.summary_id,
  };
}

const PLANNED_LESSONS_BY_MODULE: Record<
  string,
  readonly { id: string; title: string; milestone: string }[]
> = {
  "1.1": [
    { id: "1.1-01", title: "Era Telegraf Bawah Laut dan Jalur Nusantara 1871", milestone: "M4b" },
    {
      id: "1.1-02",
      title: "Telepon Koaksial Transatlantik hingga Satelit Palapa",
      milestone: "M4b",
    },
    { id: "1.1-03", title: "Revolusi Serat Optik, EDFA, WDM, Koheren, dan SDM", milestone: "M4b" },
  ],
  "1.2": [
    { id: "1.2-01", title: "Peta Kabel Global dan Peran Trafik Bawah Laut", milestone: "M4b" },
    {
      id: "1.2-02",
      title: "Konektivitas Indonesia, Palapa Ring, dan Dampak Ekonomi",
      milestone: "M4b",
    },
    {
      id: "1.2-03",
      title: "Gangguan Kabel, Proses Perbaikan, dan Ketahanan Rute",
      milestone: "M4b",
    },
    {
      id: "1.2-04",
      title: "Gelombang Permintaan Kapasitas dan Koridor Batam-Singapura",
      milestone: "M4b",
    },
  ],
  "1.3": [
    {
      id: "1.3-02",
      title: "Wet Plant: Anatomi Kabel, Pelindung, Repeater EDFA, dan BU",
      milestone: "M3",
    },
    {
      id: "1.3-03",
      title: "Dry Plant: CLS, SLTE, Koheren, PFE, dan Lokalisasi COTDR",
      milestone: "M3",
    },
    {
      id: "1.3-04",
      title: "Integrasi Sistem: Kapasitas, Margin 25 Tahun, Proteksi, Open Cable",
      milestone: "M3",
    },
  ],
};

export default async function ModuleDetailPage({ params }: ModulePageProps) {
  const { moduleSlug } = await params;
  const mod = getModuleBySlug(moduleSlug);

  if (!mod) {
    notFound();
  }

  const publishedLessons = loadLessons().filter(
    (lesson) => lesson.frontmatter.module_code === mod.module_code
  );
  const plannedLessons = PLANNED_LESSONS_BY_MODULE[mod.module_code] ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-sedp-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center px-1.5 hover:text-sedp-accent hover:underline"
            >
              Beranda
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/kurikulum/"
              className="inline-flex min-h-[44px] items-center px-1.5 hover:text-sedp-accent hover:underline"
            >
              Kurikulum
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="px-1.5 font-semibold text-sedp-ink">Modul {mod.module_code}</li>
        </ol>
      </nav>

      <header className="rounded-[10px] border border-sedp-subtle-border bg-sedp-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-xs font-semibold text-sedp-accent">
            Modul {mod.module_code} | {mod.teaching_window_id}
          </p>
          <span className="rounded-sm border border-sedp-control-border bg-sedp-inset px-2.5 py-1 text-xs font-semibold text-sedp-ink">
            {mod.availability_badge_id}
          </span>
        </div>

        <h1 className="mt-2 font-display text-2xl font-bold text-sedp-ink sm:text-3xl">
          {mod.title_id}
        </h1>
        <p className="mt-3 max-w-[66ch] text-base leading-relaxed text-sedp-muted">
          {mod.summary_id}
        </p>
      </header>

      {mod.coverage_status === "UNAVAILABLE" && (
        <section
          aria-labelledby="unavailable-heading"
          className="mt-6 rounded-[10px] border border-sedp-fault bg-sedp-surface p-6"
        >
          <h2 id="unavailable-heading" className="font-display text-xl font-bold text-sedp-fault">
            Status: Belum Tersedia
          </h2>
          <p className="mt-2 max-w-[64ch] text-base leading-relaxed text-sedp-ink">
            Materi Modul 1.4 belum tersedia karena dokumen sumber belum ada. Kami tidak menerbitkan
            materi tanpa rujukan terverifikasi. Lanjutkan ke Modul 1.3 atau buka Daftar Kurikulum.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/kurikulum/1-3-arsitektur-sistem/"
              className="inline-flex min-h-[44px] items-center rounded-md bg-sedp-accent px-4 py-2 text-sm font-semibold text-sedp-accent-ink hover:bg-[var(--sedp-accent-hover)]"
            >
              Lanjutkan ke Modul 1.3
            </Link>
            <Link
              href="/kurikulum/"
              className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-canvas px-4 py-2 text-sm font-semibold text-sedp-ink hover:bg-sedp-inset"
            >
              Buka Daftar Kurikulum
            </Link>
          </div>
        </section>
      )}

      {mod.coverage_status === "PARTIAL" && (
        <section
          aria-labelledby="partial-heading"
          className="mt-6 rounded-[10px] border border-sedp-partial bg-sedp-surface p-6"
        >
          <h2 id="partial-heading" className="font-display text-xl font-bold text-sedp-partial">
            Status: Sebagian (Menunggu Audit Sumber Hari 3)
          </h2>
          <p className="mt-2 max-w-[64ch] text-base leading-relaxed text-sedp-ink">
            Materi Modul 1.5 (Siklus Proyek dan Survei Kelautan) berstatus Sebagian (Menunggu Audit
            Sumber Hari 3). Topik ini diajarkan pada Hari 3, namun berkas sumber belum tersedia di
            repositori kerja untuk diaudit.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/kurikulum/?urut=hari"
              className="inline-flex min-h-[44px] items-center rounded-md bg-sedp-accent px-4 py-2 text-sm font-semibold text-sedp-accent-ink hover:bg-[var(--sedp-accent-hover)]"
            >
              Lihat Urutan Hari
            </Link>
            <Link
              href="/tentang/sumber/"
              className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-canvas px-4 py-2 text-sm font-semibold text-sedp-ink hover:bg-sedp-inset"
            >
              Periksa Daftar Sumber Publik
            </Link>
          </div>
        </section>
      )}

      {publishedLessons.length > 0 && (
        <section aria-labelledby="published-lessons-heading" className="mt-8 space-y-4">
          <h2
            id="published-lessons-heading"
            className="font-display text-xl font-bold text-sedp-ink"
          >
            Pelajaran Tersedia
          </h2>
          {publishedLessons.map((lesson) => (
            <article
              key={lesson.frontmatter.lesson_id}
              className="rounded-[10px] border border-sedp-control-border bg-sedp-surface p-6"
            >
              <p className="font-mono text-xs font-semibold text-sedp-verified">
                Pelajaran {lesson.frontmatter.lesson_id} | Tersedia &amp; Terverifikasi
              </p>
              <h3 className="mt-1 font-display text-xl font-bold text-sedp-ink">
                {lesson.frontmatter.title}
              </h3>
              <p className="mt-2 max-w-[64ch] text-sm leading-relaxed text-sedp-muted">
                {lesson.frontmatter.summary}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href={lesson.href}
                  className="inline-flex min-h-[44px] items-center rounded-md bg-sedp-accent px-5 py-2.5 text-sm font-semibold text-sedp-accent-ink hover:bg-[var(--sedp-accent-hover)]"
                >
                  Buka Pelajaran {lesson.frontmatter.lesson_id}
                </Link>
                {lesson.frontmatter.quiz_id && (
                  <Link
                    href={`/latihan/${lesson.frontmatter.quiz_id}/`}
                    className="inline-flex min-h-[44px] items-center rounded-md border border-sedp-control-border bg-sedp-canvas px-4 py-2 text-sm font-semibold text-sedp-ink hover:bg-sedp-inset"
                  >
                    Uji Pemahaman {lesson.frontmatter.lesson_id}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {plannedLessons.length > 0 && (
        <section aria-labelledby="planned-lessons-heading" className="mt-8 space-y-3">
          <h2 id="planned-lessons-heading" className="font-display text-lg font-bold text-sedp-ink">
            Rencana Pelajaran Berikutnya
          </h2>
          <p className="text-sm text-sedp-muted">
            Daftar topik di bawah ini dijadwalkan untuk tahap rilis berikutnya setelah verifikasi
            sumber primer dan simulator terkait selesai.
          </p>
          <ul className="space-y-2">
            {plannedLessons.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-sedp-subtle-border bg-sedp-surface px-4 py-3 text-sm"
              >
                <span>
                  <span className="font-mono font-semibold text-sedp-accent">{item.id}</span>{" "}
                  <span className="text-sedp-ink">{item.title}</span>
                </span>
                <span className="rounded-sm bg-sedp-inset px-2 py-0.5 text-xs font-medium text-sedp-muted">
                  Dijadwalkan ({item.milestone})
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
